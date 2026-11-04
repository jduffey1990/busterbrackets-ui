# ui: agent instructions

Global rules live in `~/.claude/CLAUDE.md` and apply here.
This is the Vue 3 + Vuetify client for BusterBrackets.
The build plan for the odds and simulation work, and the phase records, live in the brackets repo at `brackets/docs/PLAN.md`.

## Invariants

- The brackets service owns the odds and the simulation (`GET /odds`, `POST /simulate-bracket`).
  The client carries no copy of the odds table or the simulation logic.
- Pages reach the services only through the `$usersApi` and `$bracketsApi` axios instances from `src/plugins/axios.js`.
- Bracket shape constants (seed keys, round-of-64 order, display conversion) live in `src/utils/bracketStruc.js`.
- Official results are entered on the Admin page; the four Final Four slots are in the order the semifinals are played, not region order, because each pair is one game.
- No emojis in product copy.

## Run and check

```bash
cd ~/code/buster && docker compose up -d --build ui   # served by nginx on :4000
cd ~/code/buster/ui
yarn install --frozen-lockfile
npx eslint . --ignore-path .gitignore                   # the lint step
yarn build                                              # production build
yarn test:e2e                                           # Playwright smoke suite, desktop and 390px, services mocked
```

The smoke suite lives in `e2e/`: `smoke.spec.mjs` walks every page, `mock-api.mjs` answers both services in the browser from `e2e/fixtures/`, and `.env.e2e` points the build at those fake hosts.
It needs Chromium once: `npx playwright install chromium`.
When a service response shape changes, update the mock handler and its fixture together.
The gate runs `yarn build && yarn test:e2e` as its test step; CI does the same.

## Branches, commits, and the gate

New work happens on a `feat/`, `fix/` or `chore/` branch, never on `main`.
Leave changes uncommitted for Jordan to review; commit only when asked, one logical change per commit.
This repo is gated by no-mistakes (`.no-mistakes.yaml`), honored only from the copy on `main`.
Jordan pushes a finished branch to the `no-mistakes` remote himself.
Production is AWS Amplify and Jordan's alone.

## Phase gate

Same five items as the brackets repo's `CLAUDE.md`, recorded in `brackets/docs/PLAN.md`.
Coverage here means the smoke suite in `e2e/` passing at desktop and 390px, extended for the pages or states the change touches, plus a drive of the real app with screenshots for anything the mock cannot show.
