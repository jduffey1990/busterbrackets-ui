# UI redesign: the arena theme

Rules and the phase gate are in `CLAUDE.md`.
This file holds the plan, the status, and one "as built" record per phase.
The mockup that was approved is the design canvas "Buster Brackets UI Refresh" (four artboards: foundation, full-field bracket, bracket at 390px, dashboard cards).

## Start here

Branch: `feat/arena-redesign`, cut at `6681aba` and moved onto `main` at `0692f00` on 2026-11-04 after `feat/server-simulation` merged (ui PR 2).
The move was a stash, reset to `origin/main`, and stash pop; the three conflicts (`settings.scss` font fallback, `Dashboard.vue` empty-state icon, `Builder.vue` disclaimer paragraph) all resolved to this branch's version because each fix is already inside the rewrite.
The diff against `main` is now the redesign alone; the Builder shows only the restyle.
After the move: lint clean, `yarn build` passes, and one simulation ran through the restyled Builder against the merged `/simulate-bracket` (both calls 200, screenshots in the session scratchpad under `shots-rebase/`).

Resume here: all four phases are built and verified; nothing is committed. Next is Jordan's review of the diff, then commits in this grouping: (1) foundation and page color fixes, (2) bracket view, (3) dashboard, (4) builder.

```bash
cd ~/code/buster && docker compose up -d            # users on :3011, brackets on :3012
cd ~/code/buster/ui && yarn dev                      # Vite on :4000
npx eslint . --ignore-path .gitignore                # lint
yarn build                                           # the gate's check
```

## The problem

The shell was a neon cyan gradient with frosted-glass cards, a 150px header, and the logo (which has a dark background) sitting on top of it like a sticker.
The bracket view showed one region per tab, hiding most of the field.
The dashboard was a generic data table with a name and a timestamp per bracket.
The disclaimer was a full-width orange alert on the home and builder pages.

## The design

- Ground `#0B1526` (court), surface `#142440`, raised `#1B2F52`, paper `#F4F1EA` for text.
- One accent, orange `#FF6801`, with navy text on it. Gold `#FFC24B` for upsets and credits. The old cyan `#28F6F4` survives only as the "your boosted team" signal.
- Barlow Condensed for headings and button labels, Inter for body. Google Fonts replaces the Typekit halyard link.
- 8px radii, 1px lines, no blur, no translucency, no shadows.
- 64px header with a real nav and an avatar menu. Disclaimer becomes a footer link that opens a dialog.
- Tokens live on `:root` in `misc.scss` and in the Vuetify theme; pages use the tokens, not hex.

## Phases

### Phase 1: foundation (built)

Theme, fonts, global styles, app shell, header, footer, home, and the color fixes every other page needs to read on a dark ground (Login, Settings, ResetPassword, Payment, Success, Breakdown).
The Loom embed on the home page is gone: it showed the old UI.
Builder and Admin are left alone because they carry phase-4 edits.

### Phase 2: full-field bracket view (built)

`Bracket.vue` renders all four regions converging on the Final Four at desktop width, with seed badge, winner edge, upset tag, and the boosted team marked.
At 390px it becomes region and round pickers over a vertical game list with the champion pinned.

### Phase 3: dashboard cards (built)

`Dashboard.vue` replaces the data table with one card per bracket (champion, Final Four, upset count, actions) and a status strip (field timing, credits).
Needs each bracket's structure in the list call; today `get-user-brackets` returns the full document, so the card can read it directly.

### Phase 4: builder restyle (built)

Drops the disclaimer paragraph (the footer owns it) and restyles the step cards.
Done against the Builder as merged on `main` (`0692f00`); see "Start here".

## Open items

- The header has no credits chip: the store's user object is not refreshed after `decrement-credits`, so the number would go stale. The dashboard strip fetches it fresh instead.
- `Overlay.vue` is unused by any route and was left as is.
- The bracket document does not store the boosted team or its percentage (`create-bracket` keeps name, bracket, userId), so the cyan "your boost" marker from the mockup is not drawn. Storing `favorite` and `boost` on the bracket is a brackets-repo change.
- PDF download is not wired on the bracket page. `PDFBuilder.vue` rasterizes a DOM node with html2canvas; on the dark theme that makes a dark PDF, so it needs a print stylesheet first.
- `utils/bracketModel.js` is a new file rather than an addition to `bracketStruc.js` because it was written while `bracketStruc.js` belonged to the simulation branch; fold it in if that reads better.
- The Builder's disclaimer paragraph moved to the footer dialog, so the Builder card keeps only "How the simulation works". Jordan to confirm.

## Phase 1 as built (2026-11-03)

Files: `index.html`, `plugins/vuetify.js`, `styles/settings.scss`, `assets/scss/misc.scss`, `App.vue`, `components/Header.vue`, `components/Footer.vue`, `views/Home.vue`, plus dark-ground fixes in `Login.vue`, `Settings.vue`, `ResetPassword.vue`, `components/Payment.vue`, `components/Success.vue`, `views/Breakdown.vue`.
New asset `assets/buster-mark.png` (160px) so the header does not load the 1.9MB logo for a 40px mark.
Fixed along the way: `Settings.vue` used `computed` and `watch` without importing them, so the page rendered blank.

### Phase gate - as built

1. **Coverage.** Playwright drive of the real app through the login form at 1440 and 390: home, login, dashboard with the avatar menu open, settings, payment, breakdown.
   Gaps: Success and ResetPassword were restyled by the same token swap but not driven (no payment or reset token locally); Admin and Builder are untouched and carry the other branch's edits.
2. **DRY.** Colors exist in two places by necessity (the Vuetify theme object and the `:root` tokens); both files say so at the top. The disclaimer text exists once, in `Footer.vue`, until Builder loses its copy in phase 4.
3. **Modularity.** Header owns navigation and the account menu; Footer owns the disclaimer dialog; pages carry no header or footer concerns.
4. **Orthogonality.** `warning` is kept equal to `primary` in the theme so existing `color="warning"` buttons stay primary without touching every page; noted in `vuetify.js`. Stripe's appearance object repeats four token values because its iframe cannot read CSS variables; noted in `Payment.vue`.
5. **Branch and production guard.** All work on `feat/arena-redesign`; nothing committed; lint clean and `yarn build` passes; only the local Docker services were used.

## Phase 2 as built (2026-11-03)

Files: `views/Bracket.vue` (rewritten), `components/bracket/TeamRow.vue` (new), `utils/bracketModel.js` (new).
The model builder turns a StructuredBracket into games with winner and upset flags; the view only lays them out.
Above 1100px the page shows the whole field: the two regions whose champions meet in semifinal 1 on the left, the other two on the right, Final Four and championship in the center, with CSS connectors.
Below that it is a region picker, a round picker, and a vertical game list, with the champion pinned at the top.

### Phase gate - as built

1. **Coverage.** Playwright drive through the dashboard card into the "UCLA for the win!" bracket at 1440, 1280 (scrolls sideways with the hint shown), and 390 (East R64, West R32 with an upset tag, Final Four tab). No console errors.
   Gaps: a bracket with unfilled slots (TBD rows) was not driven; no such document exists locally.
2. **DRY.** One game model for the full field, the compact view, and the dashboard cards; one TeamRow for every team cell.
3. **Modularity.** `bracketModel.js` imports only the seed-order constants; no Vue, no axios. TeamRow takes plain props and knows nothing about rounds.
4. **Orthogonality.** The left/right split depends on `finals.teams` being in played order, the same contract the Admin page and the server derivation rely on; noted in `bracketModel.js`. The semifinal block heights in `Bracket.vue` mirror the region block heights so the games line up; noted in the CSS.
5. **Branch and production guard.** All work on `feat/arena-redesign`; nothing committed; lint clean; `yarn build` passes.

## Phase 3 as built (2026-11-03)

Files: `views/Dashboard.vue` (rewritten), `utils/tournamentDates.js` (new).
The list call already returns each bracket's structure, so the cards derive champion, Final Four, and upset count client-side through `bracketModel.js`; team names come from one `tournament-data` fetch per distinct year.
The status strip shows the next field (Selection Sunday countdown, or "field is set" once `tournament-data/years` lists it), credits from `/get-user`, and a bracket count.

### Phase gate - as built

1. **Coverage.** Playwright drive at 1440, 1280, and 390 with seven brackets, the admin button, and the live news feed. No console errors.
   Gaps: the empty state (no brackets) and the zero-credit copy were not driven; the seed user has brackets and credits.
2. **DRY.** Cards reuse `bracketModel.js` and `TeamRow`; the Selection Sunday rule lives once in `tournamentDates.js`.
3. **Modularity.** Dashboard fetches and lays out; it computes nothing about bracket structure.
4. **Orthogonality.** The "next field" year flips to next year from May onward, which assumes the Builder will also build next year's field by then; noted in the computed. The Selection Sunday rule (first Sunday on or after March 12) is documented with the years it was checked against.
5. **Branch and production guard.** As phase 2.

## Phase 4 as built (2026-11-03)

File: `views/Builder.vue` (template head, overlay copy, disclaimer paragraph removed, style block).
The heading no longer leads with the user's name; the orange gradient card is gone.

### Phase gate - as built

1. **Coverage.** Playwright drive at 1440 and 390 with the 2026 field loaded (team picker live). No console errors.
   Gaps: the "field not released" blurred state and the simulation progress list were not driven; running the simulation would spend a credit and create a bracket.
2. **DRY.** The disclaimer now exists only in `Footer.vue`.
3. **Modularity.** Unchanged: the page still posts to `/simulate-bracket` and `/create-bracket` only.
4. **Orthogonality.** None new.
5. **Branch and production guard.** As phase 2. The file's diff on this branch includes `feat/server-simulation`'s simulation change until the rebase.
