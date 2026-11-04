<template>
  <div class="bracket-page">
    <div v-if="displayData">
      <!-- Bracket header -->
      <div class="bracket-header">
        <h2>{{ bracketReturned.name || 'My Bracket' }}</h2>
        <div class="bracket-meta">
          <v-chip size="small" variant="flat" color="secondary">
            {{ yearBracketString }} Tournament
          </v-chip>
          <v-chip
            v-if="finalsData.champion"
            size="small"
            variant="flat"
            color="warning"
            prepend-icon="mdi-trophy"
          >
            Champion: {{ teamTitle(finalsData.champion) }}
          </v-chip>
        </div>
      </div>

      <!-- Region / Finals Tabs -->
      <v-tabs v-model="selectedRegion" color="warning" class="mb-4">
        <v-tab value="east">East</v-tab>
        <v-tab value="west">West</v-tab>
        <v-tab value="south">South</v-tab>
        <v-tab value="midwest">Midwest</v-tab>
        <v-tab value="finals">Final Four</v-tab>
      </v-tabs>

      <!-- Staged bracket -->
      <div class="bracket-scroll">
        <div class="bracket-grid" :class="{ 'finals-grid': selectedRegion === 'finals' }">
          <div
            v-for="(col, cIdx) in activeColumns"
            :key="col.label"
            class="round"
            :class="{ 'straight-in': col.straightIn }"
          >
            <div class="round-label">{{ col.label }}</div>
            <div class="round-body">
              <div v-for="(pair, pIdx) in col.pairs" :key="pIdx" class="matchup">
                <div class="pair">
                  <div
                    v-for="(seed, sIdx) in pair"
                    :key="sIdx"
                    class="team-card"
                    :class="{
                      advanced: col.next && seed && col.next.includes(seed),
                      champ: col.champ,
                    }"
                  >
                    <span class="seed-badge">{{ seedNum(seed) }}</span>
                    <span class="team-name">{{ teamTitle(seed) }}</span>
                    <v-icon v-if="col.champ" size="20" class="trophy">mdi-trophy</v-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="scroll-hint text-caption">Scroll sideways to follow the rounds →</p>
    </div>

    <!-- Server error -->
    <div v-else-if="serverError" class="text-center mt-10">
      <v-icon color="error" size="40" class="mb-2">mdi-server-off</v-icon>
      <p class="text-body-1">Could not reach the brackets server.</p>
      <p class="text-body-2 text-medium-emphasis">Please refresh the page to try again.</p>
    </div>

    <!-- Loading / warming up -->
    <div v-else class="text-center mt-10">
      <v-progress-circular indeterminate color="warning" class="mb-2"></v-progress-circular>
      <p v-if="serverStatusStore.bracketsChecking" class="text-body-2 text-medium-emphasis">
        Warming up the brackets server...
      </p>
      <p v-else>Loading bracket...</p>
    </div>
  </div>
</template>

<script setup>
import { useServerStatusStore } from '@/store/serverStatus'
import { useUserStore } from '@/store/user'
import {
  baseTeamNames,
  formatTeamTitle,
  startingBracketEast,
  startingBracketMidwest,
  startingBracketSouth,
  startingBracketWest,
} from '@/utils/bracketStruc'
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const $brackets = inject('$bracketsApi')

const userStore = useUserStore()
const serverStatusStore = useServerStatusStore()
const { user } = storeToRefs(userStore)

// ─── State ───
const bracketReturned = ref({})
const bracketData = ref({})
const finalsData = ref({})
const tournamentTeams = ref({})
const yearBracketString = ref('')
const displayData = ref(false)
const serverError = ref(false)
const selectedRegion = ref('east')

const startingSeeds = {
  east: startingBracketEast,
  west: startingBracketWest,
  south: startingBracketSouth,
  midwest: startingBracketMidwest,
}

const bracketId = route.query.id

// ─── Formatting ───
const seedNum = (seedString) => (seedString ? seedString.slice(1) : '')

const teamTitle = (seedString) => {
  if (!seedString) return 'TBD'
  return formatTeamTitle(seedString, tournamentTeams.value)
}

const chunkArray = (arr, size) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

// ─── Bracket columns ───
// Each column: { label, pairs, next, champ?, straightIn? }
//  - pairs: matchups (arrays of 1-2 seed strings) rendered top to bottom
//  - next: the following round's seeds, used to highlight advancing teams
//  - straightIn: column has a 1:1 feeder (no forking bracket connector)
const regionColumns = (region) => {
  const data = bracketData.value[region]
  if (!data) return []
  return [
    { label: 'First Round', pairs: chunkArray(startingSeeds[region], 2), next: data.round32 },
    { label: 'Second Round', pairs: chunkArray(data.round32, 2), next: data.sweet16 },
    { label: 'Sweet 16', pairs: chunkArray(data.sweet16, 2), next: data.elite8 },
    { label: 'Elite Eight', pairs: chunkArray(data.elite8, 2), next: [data.regionChamp] },
    { label: 'Region Champion', pairs: [[data.regionChamp]], champ: true, straightIn: true },
  ]
}

const finalsColumns = () => {
  const finals = finalsData.value
  if (!finals.teams) return []
  return [
    { label: 'Final Four', pairs: chunkArray(finals.teams, 2), next: finals.semifinals },
    { label: 'Championship', pairs: [finals.semifinals || []], next: [finals.champion] },
    { label: 'National Champion', pairs: [[finals.champion]], champ: true, straightIn: true },
  ]
}

const activeColumns = computed(() => {
  if (selectedRegion.value === 'finals') return finalsColumns()
  return regionColumns(selectedRegion.value)
})

// ─── Data loading ───
const getBracket = async () => {
  try {
    const response = await $brackets.get(`get-bracket?id=${bracketId}`)
    bracketReturned.value = response.data

    const bracket = response.data.bracket
    yearBracketString.value = response.data.createdAt.slice(0, 4)

    bracketData.value = {
      east: bracket.east,
      west: bracket.west,
      south: bracket.south,
      midwest: bracket.midwest,
    }
    finalsData.value = bracket.finals

    displayData.value = true
  } catch (error) {
    console.error(error)
    // Don't set serverError here — a 404 for a bad ID is different
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
  }
}

onMounted(() => {
  if (serverStatusStore.bracketsReady) {
    loadData()
  } else if (serverStatusStore.bracketsError) {
    serverError.value = true
  } else {
    // Server is still warming up — watch for resolution
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
  padding: 1rem;
  max-width: 1240px;
  margin: 0 auto;
}

.bracket-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.bracket-header h2 {
  margin: 0;
}

.bracket-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ─── Bracket grid ─────────────────────────────────────────────
   Every round column stretches to the height of the tallest
   (the first round). Matchups flex evenly within that height, so
   each game sits vertically centered between its two feeder games
   — the classic staged-bracket shape. */
.bracket-scroll {
  overflow-x: auto;
  padding: 0.5rem 0.25rem 1rem;
}

.bracket-grid {
  display: flex;
  align-items: stretch;
  gap: 34px;
  min-width: 960px;
}

.finals-grid {
  min-width: 640px;
  max-width: 760px;
  margin: 0 auto;
}

.round {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 160px;
}

.round-label {
  height: 30px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(7, 21, 42, 0.65);
}

.round-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.matchup {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  padding: 5px 0;
}

.pair {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ─── Connector lines ─── */
/* outgoing stub from each matchup's center toward the next round */
.round:not(:last-child) .pair::after {
  content: '';
  position: absolute;
  right: -18px;
  top: 50%;
  width: 18px;
  height: 2px;
  margin-top: -1px;
  background: rgba(7, 21, 42, 0.3);
}

/* incoming stub into each matchup's center */
.round:not(:first-child) .pair::before {
  content: '';
  position: absolute;
  left: -17px;
  top: 50%;
  width: 17px;
  height: 2px;
  margin-top: -1px;
  background: rgba(7, 21, 42, 0.3);
}

/* vertical joiner between the two feeder games (skipped for 1:1 columns) */
.round:not(:first-child):not(.straight-in) .matchup::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 25%;
  height: 50%;
  width: 2px;
  background: rgba(7, 21, 42, 0.3);
}

/* ─── Team cards ─── */
.team-card {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-left: 3px solid transparent;
  border-radius: 10px;
  backdrop-filter: blur(6px);
  font-size: 13px;
  font-weight: 500;
  color: #07152a;
  white-space: nowrap;
  overflow: hidden;
}

.team-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.seed-badge {
  flex: 0 0 22px;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: rgba(16, 113, 160, 0.9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.team-card.advanced {
  background: rgba(255, 255, 255, 0.88);
  border-left: 3px solid #ff6801;
  font-weight: 600;
}

.team-card.champ {
  height: 56px;
  background: linear-gradient(135deg, #ff6801, #fcc35b);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 8px 20px rgba(255, 104, 1, 0.35);
}

.team-card.champ .seed-badge {
  background: rgba(255, 255, 255, 0.3);
}

.team-card.champ .trophy {
  margin-left: auto;
  color: #fff;
}

.scroll-hint {
  display: none;
  color: rgba(7, 21, 42, 0.55);
  margin: 0 0 0.5rem 0.25rem;
}

@media (max-width: 980px) {
  .scroll-hint {
    display: block;
  }
}

@media (max-width: 700px) {
  .bracket-grid {
    min-width: 820px;
    gap: 28px;
  }

  .round {
    min-width: 130px;
  }

  .team-card {
    height: 36px;
    font-size: 11px;
    padding: 0 7px;
    gap: 6px;
  }

  .seed-badge {
    flex-basis: 18px;
    height: 18px;
    width: 18px;
    font-size: 10px;
  }
}
</style>
