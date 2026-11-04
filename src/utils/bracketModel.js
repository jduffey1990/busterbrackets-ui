// bracketModel.js: turns a StructuredBracket (the server's shape, see
// brackets/src/models/tournamentData.ts) into the games the views render.
//
// A game is two slots and a winner. Each slot carries exactly the props
// components/bracket/TeamRow.vue takes: who it is, whether it advanced in
// this game, and whether that was an upset (the worse seed won).

import {
  startingBracketEast,
  startingBracketMidwest,
  startingBracketSouth,
  startingBracketWest,
} from '@/utils/bracketStruc'

export const REGION_META = {
  east: { label: 'East', starting: startingBracketEast },
  west: { label: 'West', starting: startingBracketWest },
  south: { label: 'South', starting: startingBracketSouth },
  midwest: { label: 'Midwest', starting: startingBracketMidwest },
}

const PREFIX_TO_REGION = { e: 'east', w: 'west', s: 'south', m: 'midwest' }

export const ROUND_LABELS = ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite Eight']

export const seedNum = (seedKey) => (seedKey ? Number(seedKey.slice(1)) : 0)

const chunkPairs = (arr) => {
  const pairs = []
  for (let i = 0; i < arr.length; i += 2) pairs.push(arr.slice(i, i + 2))
  return pairs
}

/**
 * @param bracket   StructuredBracket: { east, west, south, midwest, finals }
 * @param teamName  (seedKey) => display name
 */
export function buildBracketModel(bracket, teamName) {
  const slot = (seedKey, opponentKey, winnerKey) => ({
    seedKey: seedKey || '',
    name: seedKey ? teamName(seedKey) : 'TBD',
    state: !seedKey || !winnerKey ? 'tbd' : seedKey === winnerKey ? 'win' : 'out',
    upset:
      !!seedKey && !!opponentKey && seedKey === winnerKey && seedNum(seedKey) > seedNum(opponentKey),
  })

  const makeGame = (pair, winnerKey) => ({
    a: slot(pair[0], pair[1], winnerKey),
    b: slot(pair[1], pair[0], winnerKey),
  })

  const regions = {}
  for (const [key, meta] of Object.entries(REGION_META)) {
    const data = bracket[key] || {}
    const participants = [meta.starting, data.round32 || [], data.sweet16 || [], data.elite8 || []]
    const winners = [data.round32 || [], data.sweet16 || [], data.elite8 || [], [data.regionChamp]]
    regions[key] = {
      key,
      label: meta.label,
      champKey: data.regionChamp || '',
      champName: data.regionChamp ? teamName(data.regionChamp) : 'TBD',
      rounds: participants.map((teams, r) => ({
        label: ROUND_LABELS[r],
        games: chunkPairs(teams).map((pair, i) => makeGame(pair, winners[r][i])),
      })),
    }
  }

  const finals = bracket.finals || {}
  const teams = finals.teams || []
  const semiWinners = finals.semifinals || []
  const semis = [makeGame([teams[0], teams[1]], semiWinners[0]), makeGame([teams[2], teams[3]], semiWinners[1])]
  const finalGame = makeGame(semiWinners, finals.champion)

  // The two regions whose champions meet in semifinal 1 go on the left, the
  // other two on the right, so the lines lead to the game actually played.
  // finals.teams is in played order (see the Admin page and the server model).
  const regionOf = (seedKey) => PREFIX_TO_REGION[(seedKey || '')[0]]
  let left = [regionOf(teams[0]), regionOf(teams[1])].filter(Boolean)
  let right = [regionOf(teams[2]), regionOf(teams[3])].filter(Boolean)
  if (!(left.length === 2 && right.length === 2 && new Set([...left, ...right]).size === 4)) {
    left = ['east', 'west']
    right = ['south', 'midwest']
  }

  const finalFour = teams.filter(Boolean).map((seedKey) => ({ seedKey, name: teamName(seedKey) }))

  const allGames = [
    ...Object.values(regions).flatMap((region) => region.rounds.flatMap((round) => round.games)),
    ...semis,
    finalGame,
  ]
  const upsetCount = allGames.filter((game) => game.a.upset || game.b.upset).length

  return {
    regions,
    sides: { left, right },
    semis,
    finalGame,
    finalFour,
    champion: {
      seedKey: finals.champion || '',
      name: finals.champion ? teamName(finals.champion) : 'Champion TBD',
      state: 'win',
    },
    upsetCount,
  }
}
