<template>
  <div class="bracket-page">
    <h2 class="mb-4">{{ bracketReturned.name || 'Bracket' }}</h2>

    <!-- Region selector -->
    <v-tabs v-model="selectedRegion" color="warning" class="mb-4">
      <v-tab value="east">East</v-tab>
      <v-tab value="midwest">Midwest</v-tab>
      <v-tab value="south">South</v-tab>
      <v-tab value="west">West</v-tab>
    </v-tabs>

    <!-- Region display -->
    <div v-if="displayData">
      <div v-for="regionName in ['east', 'midwest', 'south', 'west']" :key="regionName">
        <div v-if="selectedRegion === regionName">
          <!-- Region Champion -->
          <div class="region-champ">
            <p>Region Champion:</p>
            <v-card class="matchup-card">
              {{ formatName(bracketData[regionName]?.regionChamp) }}
            </v-card>
          </div>

          <div class="bracket-region">
            <!-- Round of 64 (starting seeds) -->
            <div class="round round-of-64">
              <div
                class="matchup"
                v-for="(pair, idx) in chunkArray(startingSeeds[regionName], 2)"
                :key="regionName + '-r64-' + idx"
              >
                <v-card v-for="team in pair" :key="team" class="matchup-card">
                  {{ formatName(team) }}
                </v-card>
              </div>
            </div>

            <!-- Round of 32 -->
            <div class="round round-of-32">
              <div
                class="matchup"
                v-for="(pair, idx) in chunkArray(bracketData[regionName]?.round32 || [], 2)"
                :key="regionName + '-r32-' + idx"
              >
                <v-card v-for="team in pair" :key="team" class="matchup-card">
                  {{ formatName(team) }}
                </v-card>
              </div>
            </div>

            <!-- Sweet 16 -->
            <div class="round succulent-16">
              <div
                class="matchup"
                v-for="(pair, idx) in chunkArray(bracketData[regionName]?.sweet16 || [], 2)"
                :key="regionName + '-s16-' + idx"
              >
                <v-card v-for="team in pair" :key="team" class="matchup-card">
                  {{ formatName(team) }}
                </v-card>
              </div>
            </div>

            <!-- Elite 8 -->
            <div class="round hateful-8">
              <div
                class="matchup"
                v-for="(pair, idx) in chunkArray(bracketData[regionName]?.elite8 || [], 1)"
                :key="regionName + '-e8-' + idx"
              >
                <v-card v-for="team in pair" :key="team" class="matchup-card">
                  {{ formatName(team) }}
                </v-card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Finals section -->
      <div class="finals-section mt-6">
        <h3>Final Four</h3>
        <div class="bracket-region">
          <div class="round">
            <div class="matchup" v-for="(pair, idx) in chunkArray(finalsData.teams || [], 2)" :key="'ff-' + idx">
              <v-card v-for="team in pair" :key="team" class="matchup-card">
                {{ formatName(team) }}
              </v-card>
            </div>
          </div>
          <div class="round">
            <div class="matchup" v-for="(team, idx) in (finalsData.semifinals || [])" :key="'semi-' + idx">
              <v-card class="matchup-card">
                {{ formatName(team) }}
              </v-card>
            </div>
          </div>
          <div class="round">
            <div class="matchup" v-if="finalsData.champion">
              <v-card class="matchup-card champion-card">
                🏆 {{ formatName(finalsData.champion) }}
              </v-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center mt-10">
      <v-progress-circular indeterminate color="warning"></v-progress-circular>
      <p>Loading bracket...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import {
  startingBracketEast,
  startingBracketWest,
  startingBracketMidwest,
  startingBracketSouth,
  formatTeamDisplay,
  baseTeamNames,
} from '@/utils/bracketStruc'

const route = useRoute()
const $brackets = inject('$bracketsApi')

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// ─── State ───
const bracketReturned = ref({})
const bracketData = ref({})     // { east: RegionBracket, west: ..., south: ..., midwest: ... }
const finalsData = ref({})      // { teams: [], semifinals: [], champion: '' }
const tournamentTeams = ref({}) // { "e1": "Duke", ... } from API
const yearBracketString = ref('')
const displayData = ref(false)
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

    // The bracket is now a StructuredBracket object — read directly by key
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
  }
}

const loadTournamentTeams = async (year) => {
  try {
    const { data } = await $brackets.get(`/tournament-data?year=${year}`)
    tournamentTeams.value = data.teams
  } catch (err) {
    console.log(`No tournament data for ${year}, using base names`)
    tournamentTeams.value = baseTeamNames
  }
}

onMounted(async () => {
  await getBracket()
  if (yearBracketString.value) {
    await loadTournamentTeams(yearBracketString.value)
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