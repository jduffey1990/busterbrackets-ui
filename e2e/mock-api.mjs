// In-browser stand-in for the users and brackets services. Every request the
// app makes to the .env.e2e hosts is answered here from fixtures, so a test
// run has the same data every time and needs nothing running beside Vite.
//
// Shapes mirror the real services (captured 2026-11-04). When a service
// response changes, update the handler and the fixture together.
import { readFileSync } from 'node:fs'

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'))

const TOURNAMENT = fixture('tournament-2026.json')
const BRACKETS = fixture('brackets.json')

export const PASSWORD = 'password123'
export const TOKEN = 'e2e-token'
export const USER = {
  _id: '6e2e00000000000000000001',
  username: 'user1',
  email: 'user1@example.com',
  name: 'User One',
  status: 'active',
  credits: 2,
  role: 'user',
  createdAt: '2026-02-19T18:00:31.170Z',
  updatedAt: '2026-02-19T18:00:31.170Z',
  deletedAt: null,
  resetToken: null,
  resetTokenExpiry: null,
}

export const NEWS = [
  {
    title: 'Preseason poll puts three Big 12 teams in the top ten',
    snippet: 'Kansas leads the way again, with Houston and Arizona close behind.',
    link: 'https://example.com/news/1',
    source: 'Example Sports',
    publishedAt: '2026-11-04T18:10:55.000Z',
  },
  {
    title: 'Transfer portal reshapes the Big East',
    snippet: 'UConn reloads while Marquette leans on returning starters.',
    link: 'https://example.com/news/2',
    source: 'Example Sports',
    publishedAt: '2026-11-04T16:00:00.000Z',
  },
  {
    title: 'Mid-major watch: who could crash the bracket',
    snippet: 'Five teams outside the power conferences with a real shot at the second weekend.',
    link: 'https://example.com/news/3',
    source: 'Example Sports',
    publishedAt: '2026-11-04T12:00:00.000Z',
  },
]

export const BREAKDOWN = {
  content:
    'This bracket leans on the favorites early and takes two real swings in the second weekend.\n\nThe Final Four is three top-two seeds and one surprise, which is close to how most recent tournaments have played out.',
  isPostTournament: true,
  stats: { correctPicks: 41, totalGames: 63, upsets: ['12 seed over 5 seed in the East'] },
}

const teamName = (seedKey) => TOURNAMENT.teams[seedKey]

/**
 * Routes every request to the two fake service hosts through fixtures and
 * returns the mutable state the handlers read and write, so a test can
 * inspect what was called and what was created.
 */
export async function installMockApi(page) {
  const state = {
    user: { ...USER },
    brackets: structuredClone(BRACKETS),
    calls: [],
  }

  const users = {
    'GET /ping-user': () => ({ body: 'pinged backend' }),
    'POST /login': (params, body) =>
      body?.username === USER.username && body?.password === PASSWORD
        ? { body: { token: TOKEN, user: state.user } }
        : { status: 401, body: { message: 'Invalid username or password.' } },
    'GET /session': (params, body, authed) =>
      authed ? { body: { user: state.user } } : { status: 401, body: { message: 'Not logged in.' } },
    'GET /get-user': () => ({ body: state.user }),
    'PATCH /decrement-credits': () => {
      state.user.credits -= 1
      return { body: state.user }
    },
  }

  const brackets = {
    'GET /ping-bracket': () => ({ body: 'pinged backend' }),
    'GET /get-user-brackets': () => ({ body: state.brackets }),
    'GET /get-bracket': (params) => {
      const found = state.brackets.find((b) => b._id === params.get('id'))
      return found ? { body: found } : { status: 404, body: { error: 'Bracket not found' } }
    },
    'GET /tournament-data/years': () => ({ body: { years: [TOURNAMENT.year] } }),
    'GET /tournament-data': (params) => ({ body: { ...TOURNAMENT, year: Number(params.get('year')) } }),
    'GET /news': () => ({ body: NEWS }),
    'GET /breakdown': (params) => {
      const found = state.brackets.find((b) => b._id === params.get('id'))
      return found
        ? { body: { ...BREAKDOWN, bracketName: found.name } }
        : { status: 404, body: { error: 'Bracket not found' } }
    },
    // The simulation always returns the second fixture bracket, so the
    // builder test can assert on a known champion.
    'POST /simulate-bracket': () => ({ body: { bracket: structuredClone(BRACKETS[1].bracket) } }),
    'POST /create-bracket': (params, body) => {
      const now = new Date().toISOString()
      const created = {
        _id: `6e2e0000000000000000c${String(state.brackets.length + 1).padStart(3, '0')}`,
        userId: state.user._id,
        name: body.name,
        bracket: body.bracket,
        offshootBracket: body.bracket,
        createdAt: now,
        updatedAt: now,
      }
      state.brackets.push(created)
      return { body: created }
    },
  }

  const corsHeaders = (request) => ({
    'access-control-allow-origin': request.headers()['origin'] || '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers':
      request.headers()['access-control-request-headers'] || 'authorization, content-type, x-csrftoken',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  })

  await page.route(/^https?:\/\/(users|brackets)\.buster\.test\//, async (route) => {
    const request = route.request()
    const method = request.method()
    if (method === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders(request) })
    }
    const url = new URL(request.url())
    const service = url.hostname.startsWith('users') ? users : brackets
    const body = method === 'GET' ? null : request.postDataJSON()
    const authed = request.headers()['authorization'] === `Bearer ${TOKEN}`
    state.calls.push({ method, path: url.pathname, query: Object.fromEntries(url.searchParams), body })

    const handler = service[`${method} ${url.pathname}`]
    const result = handler
      ? handler(url.searchParams, body, authed)
      : { status: 404, body: { error: `no mock for ${method} ${url.pathname}` } }
    return route.fulfill({
      status: result.status || 200,
      contentType: 'application/json',
      headers: corsHeaders(request),
      body: JSON.stringify(result.body),
    })
  })

  return { state, teamName, tournament: TOURNAMENT, brackets: BRACKETS }
}
