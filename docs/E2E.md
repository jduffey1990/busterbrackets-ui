# Playwright smoke suite

Branch: `chore/playwright-smoke`, cut from `main` at `fe89fba` on 2026-11-04.

## Why

The no-mistakes gate had no test step for this repo beyond `yarn build`, so its test agent drove the app by hand on every push and took about twenty minutes.
A committed suite turns that into a check: the gate runs it, reads the result, and only explores what the suite does not cover.

## How it works

- `yarn test:e2e` runs `playwright.config.js`.
  The web server step builds the app with `--mode e2e`, which loads `.env.e2e` and points both axios instances at `users.buster.test` and `brackets.buster.test`, then serves that build with `vite preview` on port 4100.
- `e2e/mock-api.mjs` intercepts every request to those hosts inside the browser and answers from `e2e/fixtures/`.
  The fixtures were captured from the local services on 2026-11-04 and trimmed: one 2026 field with results, two brackets (chalk and chaos), three news items, one breakdown.
  The mock keeps per-test state, so the builder test can create a bracket and see it on the dashboard, and it records every call so a test can assert on request bodies.
- The specs, one per realm, share `e2e/helpers.mjs` for the login form, the screenshot step, and the labelled-input lookup:
  `smoke.spec.mjs` walks home, login (accepted, rejected, and the submit button flush with the field column), the footer disclaimer, dashboard, account menu, header navigation to the builder and back (desktop links, account menu entries on a phone), bracket (full field on desktop, region tabs on a phone), breakdown, builder through a full simulation, settings, and log out;
  `account.spec.mjs` covers creating an account (rules, taken username), forgot password, reset password (no token, valid, expired), and the Settings profile edit and password change;
  `admin.spec.mjs` covers the route guard for plain and logged-out users, the admin links, loading the current field, saving teams and results, and starting a new year;
  `payment.spec.mjs` covers the zero-credit route to payment, the status strip link, a declined card, and the redirect to the success page, with Stripe's script replaced by a stub;
  `states.spec.mjs` covers the warming card, the breakdown preview and missing-recap states, an unknown bracket, the builder with no field and with a boosted team, and the router's redirects.
  Every test runs in two projects, `desktop` at 1440px and `mobile` at 390px, and saves a full-page screenshot under `test-results/` with animations settled first, so a capture under parallel load is not mid-transition.
- Nothing outside the repo is needed except Chromium, installed once with `npx playwright install chromium`.
  CI installs it with `--with-deps`.

## Adding a test

Put new tests in `e2e/smoke.spec.mjs` or a sibling `*.spec.mjs`.
If the page calls a service route the mock does not know, add a handler to `mock-api.mjs`; an unknown route answers 404 with the method and path in the body, so the failure names what is missing.
When a service response shape changes, update the handler and the fixture together.

## Phase gate - as built

- Coverage: eighty tests, forty per width. Gaps: the dashboard and breakdown "could not reach the server" state (the store retries for a minute before showing it), the bracket page's scroll hint between 1100px and 1440px, the Settings unsaved-changes prompt on leaving the page, and the real Stripe elements.
- DRY: the login form selectors and the screenshot helper live once in the spec; service shapes live once in the mock.
- Modularity: config, mock, fixtures, and spec are separate files; the mock exports the user and password the spec logs in with.
- Orthogonality: the suite touches no app source. The one coupling is `.env.e2e`, which exists so the app needs no test-only code path; it is noted in the file header.
- Branch and production guard: `.env.e2e` only loads under `--mode e2e`, the build goes to `dist-e2e` (ignored), and the production build is unchanged.
- Stability: three consecutive runs green at twenty tests, then two at seventy-six, on 2026-11-04. Renaming "Log out" in the header made two tests fail, so a green run is evidence.
