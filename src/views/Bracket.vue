<template>
  <div class="bracket-page">
    <div v-if="displayData">
      <div class="bracket-header">
        <div class="bracket-heading">
          <router-link to="/dashboard" class="back-link">← My brackets</router-link>
          <h1>{{ bracketReturned.name || 'My bracket' }}</h1>
          <div class="bracket-meta">
            <v-chip size="small" variant="tonal" color="secondary">{{ yearBracketString }} field</v-chip>
            <v-chip v-if="finalsData.champion" size="small" variant="tonal" color="primary" prepend-icon="mdi-trophy">
              Champion · {{ teamTitle(finalsData.champion) }}
            </v-chip>
            <v-chip v-if="upsetCount" size="small" variant="tonal" color="success">
              {{ upsetCount }} {{ upsetCount === 1 ? 'upset' : 'upsets' }}
            </v-chip>
            <span class="text-muted created">Built {{ createdLabel }}</span>
          </div>
        </div>
        <div class="bracket-actions">
          <v-btn variant="outlined" color="secondary" :to="{ name: 'Breakdown', query: { id: bracketId } }">
            Breakdown
          </v-btn>
        </div>
      </div>

      <!-- Wide screens: the whole field, four regions converging on the center -->
      <p v-if="fullField" class="scroll-hint text-muted">Scroll sideways to see the whole field</p>
      <div v-if="fullField" class="field-scroll">
        <div class="field">
          <div class="round-labels">
            <div class="labels-side">
              <span v-for="label in roundLabels" :key="label" class="eyebrow">{{ label }}</span>
            </div>
            <div class="labels-center eyebrow">Final Four</div>
            <div class="labels-side mirrored">
              <span v-for="label in roundLabels" :key="label" class="eyebrow">{{ label }}</span>
            </div>
          </div>

          <div class="field-body">
            <div class="side left">
              <div v-for="region in leftRegions" :key="region.key" class="region">
                <div class="region-title">
                  <span>{{ region.label }}</span>
                  <span class="region-champ">Region champion · {{ region.champName }}</span>
                </div>
                <div class="rounds">
                  <div v-for="(round, r) in region.rounds" :key="r" class="round">
                    <div v-for="(game, g) in round.games" :key="g" class="game">
                      <div class="pair">
                        <TeamRow v-bind="game.a" dense/>
                        <TeamRow v-bind="game.b" dense/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="center">
              <div v-for="(semi, i) in semis" :key="i" class="semi">
                <div class="pair">
                  <TeamRow v-bind="semi.a" dense/>
                  <TeamRow v-bind="semi.b" dense/>
                </div>
              </div>
              <div class="final-block">
                <TeamRow v-bind="championRow" champ/>
                <p class="eyebrow text-center my-0">Championship</p>
                <div class="pair">
                  <TeamRow v-bind="finalGame.a" dense/>
                  <TeamRow v-bind="finalGame.b" dense/>
                </div>
              </div>
            </div>

            <div class="side right">
              <div v-for="region in rightRegions" :key="region.key" class="region">
                <div class="region-title mirrored">
                  <span class="region-champ">Region champion · {{ region.champName }}</span>
                  <span>{{ region.label }}</span>
                </div>
                <div class="rounds">
                  <div v-for="(round, r) in region.rounds" :key="r" class="round">
                    <div v-for="(game, g) in round.games" :key="g" class="game">
                      <div class="pair">
                        <TeamRow v-bind="game.a" dense/>
                        <TeamRow v-bind="game.b" dense/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Narrow screens: one region and one round at a time -->
      <div v-else class="compact">
        <TeamRow v-bind="championRow" champ/>

        <div class="segmented" role="tablist" aria-label="Region">
          <button
            v-for="option in regionOptions"
            :key="option.key"
            type="button"
            role="tab"
            class="segment"
            :class="{ on: selectedRegion === option.key }"
            :aria-selected="selectedRegion === option.key"
            @click="selectedRegion = option.key"
          >
            {{ option.label }}
          </button>
        </div>

        <template v-if="selectedRegion !== 'finals'">
          <div class="round-pills">
            <button
              v-for="(label, r) in roundShortLabels"
              :key="label"
              type="button"
              class="pill"
              :class="{ on: selectedRound === r }"
              @click="selectedRound = r"
            >
              {{ label }}
            </button>
            <span class="text-muted pill-caption">{{ compactRegion.label }} · {{ roundLabels[selectedRound] }}</span>
          </div>

          <div class="game-list">
            <div v-for="(game, g) in compactRegion.rounds[selectedRound].games" :key="g" class="game-card">
              <TeamRow v-bind="game.a"/>
              <TeamRow v-bind="game.b"/>
              <p class="game-note">{{ advanceNote(game, selectedRound) }}</p>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="game-list">
            <div v-for="(semi, i) in semis" :key="i" class="game-card">
              <p class="eyebrow my-0">Semifinal {{ i + 1 }}</p>
              <TeamRow v-bind="semi.a"/>
              <TeamRow v-bind="semi.b"/>
            </div>
            <div class="game-card">
              <p class="eyebrow my-0">Championship</p>
              <TeamRow v-bind="finalGame.a"/>
              <TeamRow v-bind="finalGame.b"/>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Server error -->
    <div v-else-if="serverError" class="text-center mt-10">
      <v-icon color="error" size="40" class="mb-2">mdi-server-off</v-icon>
      <p class="text-body-1">Could not reach the brackets server.</p>
      <p class="text-body-2 text-muted">Please refresh the page to try again.</p>
    </div>

    <!-- Loading / warming up -->
    <div v-else class="text-center mt-10">
      <v-progress-circular indeterminate color="primary" class="mb-2"></v-progress-circular>
      <p v-if="serverStatusStore.bracketsChecking" class="text-body-2 text-muted">
        Warming up the brackets server...
      </p>
      <p v-else>Loading bracket...</p>
    </div>
  </div>
</template>

<script setup>
import TeamRow from '@/components/bracket/TeamRow.vue'
import { useServerStatusStore } from '@/store/serverStatus'
import { REGION_META, ROUND_LABELS, buildBracketModel } from '@/utils/bracketModel'
import { baseTeamNames, formatTeamTitle } from '@/utils/bracketStruc'
import moment from 'moment'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

const route = useRoute()
const $brackets = inject('$bracketsApi')
const serverStatusStore = useServerStatusStore()
const { width } = useDisplay()

// ─── State ───
const bracketReturned = ref({})
const tournamentTeams = ref({})
const yearBracketString = ref('')
const displayData = ref(false)
const serverError = ref(false)
const selectedRegion = ref('east')
const selectedRound = ref(0)

const bracketId = route.query.id

// The full field needs about 1400px; below that, one region at a time.
const fullField = computed(() => width.value >= 1100)

const roundLabels = ROUND_LABELS
const roundShortLabels = ['R64', 'R32', 'S16', 'E8']
const nextRoundNames = ['the Round of 32', 'the Sweet 16', 'the Elite Eight', 'the Final Four']

const regionOptions = [
  ...Object.entries(REGION_META).map(([key, meta]) => ({ key, label: meta.label })),
  { key: 'finals', label: 'F4' },
]

// ─── Formatting ───
const teamTitle = (seedKey) => {
  if (!seedKey) return 'TBD'
  return formatTeamTitle(seedKey, tournamentTeams.value)
}

const createdLabel = computed(() =>
  bracketReturned.value.createdAt ? moment(bracketReturned.value.createdAt).format('MMM D, YYYY') : ''
)

// ─── Game model ───
const model = computed(() =>
  displayData.value ? buildBracketModel(bracketReturned.value.bracket, teamTitle) : null
)

const finalsData = computed(() => bracketReturned.value.bracket?.finals || {})
const leftRegions = computed(() => model.value.sides.left.map((key) => model.value.regions[key]))
const rightRegions = computed(() => model.value.sides.right.map((key) => model.value.regions[key]))
const semis = computed(() => model.value.semis)
const finalGame = computed(() => model.value.finalGame)
const championRow = computed(() => model.value.champion)
const upsetCount = computed(() => model.value.upsetCount)
const compactRegion = computed(() => model.value.regions[selectedRegion.value] || model.value.regions.east)

const advanceNote = (game, roundIndex) => {
  const winner = game.a.state === 'win' ? game.a : game.b.state === 'win' ? game.b : null
  if (!winner) return 'Not played yet'
  return `${winner.name} advances to ${nextRoundNames[roundIndex]}`
}

// ─── Data loading ───
const getBracket = async () => {
  try {
    const response = await $brackets.get(`get-bracket?id=${bracketId}`)
    bracketReturned.value = response.data
    yearBracketString.value = response.data.createdAt.slice(0, 4)
  } catch (error) {
    console.error(error)
    // Don't set serverError here: a 404 for a bad ID is different
    // from the server being down. serverError is set by the store watch below.
  }
}

const loadTournamentTeams = async (year) => {
  try {
    const { data } = await $brackets.get(`/tournament-data?year=${year}`)
    tournamentTeams.value = data.teams
  } catch {
    console.log(`No tournament data for ${year}, using base names`)
    tournamentTeams.value = baseTeamNames
  }
}

const loadData = async () => {
  await getBracket()
  if (yearBracketString.value) {
    await loadTournamentTeams(yearBracketString.value)
    displayData.value = true
  }
}

onMounted(() => {
  if (serverStatusStore.bracketsReady) {
    loadData()
  } else if (serverStatusStore.bracketsError) {
    serverError.value = true
  } else {
    // Server is still warming up: watch for resolution
    const unwatch = watch(
      () => [serverStatusStore.bracketsReady, serverStatusStore.bracketsError],
      ([ready, error]) => {
        if (ready) {
          unwatch()
          loadData()
        } else if (error) {
          unwatch()
          serverError.value = true
        }
      }
    )
  }
})
</script>

<style scoped>
.bracket-page {
  padding: 4px 0 16px;
}

/* ─── Header ─── */
.bracket-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.bracket-heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.back-link {
  font-size: 13px;
  color: var(--bb-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--bb-paper);
}

.bracket-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.created {
  font-size: 12px;
}

/* ─── Full field ─── */
.scroll-hint {
  display: none;
  margin: 0 0 8px;
  font-size: 12px;
}

@media (max-width: 1439px) {
  .scroll-hint {
    display: block;
  }
}

.field-scroll {
  overflow-x: auto;
  padding-bottom: 8px;
}

.field {
  min-width: 1392px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.round-labels,
.field-body {
  display: flex;
  gap: 16px;
}

.labels-side {
  flex: 1 1 0;
  display: flex;
  gap: 16px;
}

.labels-side span {
  flex: 1 1 0;
  text-align: center;
}

.labels-side.mirrored {
  flex-direction: row-reverse;
}

.labels-center {
  flex: 0 0 190px;
  text-align: center;
  color: var(--bb-ball);
}

.side {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.region {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.region-title {
  height: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--bb-font-display);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.region-title.mirrored {
  justify-content: flex-end;
}

.region-champ {
  font-family: var(--bb-font-body);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0;
  text-transform: none;
  color: var(--bb-muted);
}

.rounds {
  display: flex;
  gap: 16px;
  height: 470px;
}

.right .rounds {
  flex-direction: row-reverse;
}

.round {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Every round column is the same height, so each game centers between the
   two games that feed it. */
.game {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  padding: 3px 0;
}

.pair {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Connectors: a stub out of each game, a stub into each later game, and a
   vertical joiner between the two feeders. Mirrored on the right side. */
.left .pair::after,
.right .pair::after,
.left .round:not(:first-child) .pair::before,
.right .round:not(:first-child) .pair::before,
.left .round:not(:first-child) .game::before,
.right .round:not(:first-child) .game::before {
  content: '';
  position: absolute;
  background: var(--bb-line-strong);
}

.left .pair::after,
.right .pair::after {
  top: 50%;
  width: 9px;
  height: 1px;
}

.left .pair::after {
  right: -9px;
}

.right .pair::after {
  left: -9px;
}

.left .round:not(:first-child) .pair::before,
.right .round:not(:first-child) .pair::before {
  top: 50%;
  width: 8px;
  height: 1px;
}

.left .round:not(:first-child) .pair::before {
  left: -8px;
}

.right .round:not(:first-child) .pair::before {
  right: -8px;
}

.left .round:not(:first-child) .game::before,
.right .round:not(:first-child) .game::before {
  top: 25%;
  height: 50%;
  width: 1px;
}

.left .round:not(:first-child) .game::before {
  left: -9px;
}

.right .round:not(:first-child) .game::before {
  right: -9px;
}

.center {
  flex: 0 0 190px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Each semifinal block matches a region block (22px title + 6px gap + 470px
   rounds) so the semifinal sits level with the Elite Eight game feeding it. */
.semi {
  height: 498px;
  box-sizing: border-box;
  padding-top: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.final-block {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ─── Compact ─── */
.compact {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.segmented {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 8px;
  background: var(--bb-surface);
}

.segment {
  flex: 1 1 0;
  height: 40px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--bb-muted);
  font-family: var(--bb-font-display);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
}

.segment.on {
  background: var(--bb-ball);
  color: var(--bb-court);
}

.round-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.pill {
  height: 34px;
  padding: 0 14px;
  border: 1px solid var(--bb-line-strong);
  border-radius: 999px;
  background: transparent;
  color: var(--bb-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.pill.on {
  background: var(--bb-paper);
  color: var(--bb-court);
  border-color: var(--bb-paper);
}

.pill-caption {
  margin-left: auto;
  font-size: 12px;
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  background: var(--bb-surface);
}

.game-note {
  margin: 2px 0 0 4px;
  font-size: 11px;
  color: var(--bb-muted);
}
</style>
