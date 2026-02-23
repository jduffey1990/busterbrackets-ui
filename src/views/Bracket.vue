<template>
  <div class="bracket-page">
    <div v-if="displayData">
      <!-- Region Tabs -->
      <v-tabs v-model="selectedRegion" color="warning" class="mb-4">
        <v-tab value="east">East</v-tab>
        <v-tab value="west">West</v-tab>
        <v-tab value="south">South</v-tab>
        <v-tab value="midwest">Midwest</v-tab>
      </v-tabs>

      <!-- Region Bracket -->
      <div v-for="region in ['east', 'west', 'south', 'midwest']" :key="region">
        <div v-if="selectedRegion === region">
          <h3 class="text-capitalize mb-2">{{ region }} Region</h3>
          <div class="bracket-region">
            <div
              v-for="(round, rIdx) in bracketData[region]"
              :key="rIdx"
              class="round"
            >
              <div
                v-for="(matchup, mIdx) in chunkArray(round, 2)"
                :key="mIdx"
                class="matchup"
              >
                <v-card
                  v-for="(seed, sIdx) in matchup"
                  :key="sIdx"
                  class="matchup-card"
                  elevation="1"
                >
                  {{ formatName(seed) }}
                </v-card>
              </div>
            </div>
          </div>

          <!-- Region Champion -->
          <div class="region-champ mt-4">
            <span class="text-subtitle-2 mr-2">Region Champion:</span>
            <v-card class="matchup-card champion-card" elevation="2">
              {{ formatName(finalsData.semifinals?.find(s => s?.region === region)?.winner) }}
            </v-card>
          </div>
        </div>
      </div>

      <!-- Finals -->
      <div class="finals-section mt-6">
        <h3 class="mb-2">Final Four &amp; Champion</h3>
        <div class="bracket-region">
          <div class="round">
            <div v-for="(semi, idx) in finalsData.semifinals" :key="idx" class="matchup">
              <v-card class="matchup-card" elevation="1">{{ formatName(semi?.team1) }}</v-card>
              <v-card class="matchup-card" elevation="1">{{ formatName(semi?.team2) }}</v-card>
            </div>
          </div>
          <div class="round">
            <div class="matchup">
              <v-card v-for="(semi, idx) in finalsData.semifinals" :key="idx" class="matchup-card" elevation="1">
                {{ formatName(semi?.winner) }}
              </v-card>
            </div>
          </div>
          <div class="round">
            <div class="matchup">
              <v-card class="matchup-card champion-card" elevation="3">
                🏆 {{ formatName(finalsData.champion) }}
              </v-card>
            </div>
          </div>
        </div>
      </div>
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
  formatTeamDisplay,
  startingBracketEast,
  startingBracketMidwest,
  startingBracketSouth,
  startingBracketWest,
} from '@/utils/bracketStruc'
import { storeToRefs } from 'pinia'
import { inject, onMounted, ref, watch } from 'vue'
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
const formatName = (seedString) => {
  if (!seedString) return ''
  return formatTeamDisplay(seedString, tournamentTeams.value)
}

const chunkArray = (arr, size) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

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
  max-width: 1200px;
  margin: 0 auto;
}

.region-champ {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.bracket-region {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  overflow-x: auto;
}

.round {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  min-width: 140px;
}

.matchup {
  display: flex;
  flex-direction: column;
  margin: 0.25rem 0;
}

.matchup-card {
  padding: 0.4rem 0.6rem;
  margin: 1px 0;
  font-size: 0.8rem;
  min-width: 130px;
  white-space: nowrap;
}

.champion-card {
  font-weight: bold;
  font-size: 1rem;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
}

.finals-section {
  border-top: 2px solid #e6cc80;
  padding-top: 1rem;
}

@media (max-width: 700px) {
  .matchup-card {
    font-size: 0.65rem;
    min-width: 90px;
    padding: 0.3rem 0.4rem;
  }
}
</style>