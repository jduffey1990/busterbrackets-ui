<template>
  <div class="builder-page">
    <div class="title-card">
      <h2>
        <span class="user-name">{{ user.name }}</span>'s Bracket Builder
      </h2>
      <p class="title-sub">Boost a team if you're feeling loyal, name your bracket, and let Buster run the madness.</p>
    </div>

    <!-- Step 1: optional team boost -->
    <v-card class="step-card" elevation="0">
      <div class="step-header">
        <span class="step-number">1</span>
        <h4>Give a team an edge <span class="optional">(optional)</span></h4>
      </div>

      <div v-if="yearHasBracket">
        <v-autocomplete
          v-model="selectedTeam"
          :items="teamsThisYear"
          label="Pick your team"
          chips
          clear-on-select
          class="mb-2"
        ></v-autocomplete>
        <p class="hint-text">The team you choose gets a boost in every simulated matchup.</p>

        <div v-if="selectedTeam.length" class="mt-4">
          <v-select
            label="How much of an edge?"
            v-model="addedBenefit"
            :items="benefitLevels"
            item-title="title"
            item-value="value"
          ></v-select>
          <div class="paratool mt-2">
            <p class="hint-text mb-0">The percentage is added each round, not overall.</p>
            <v-tooltip
              text="It is an added chance each round to pass the opposing team. Win chances can't go over 100, and 100% means that your team will win the bracket automation. A 9 seed team with a 40% chance of winning and a 10% increase will have a 50% chance of winning that round"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" size="18" class="ml-1 info-icon">mdi-information</v-icon>
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>

      <div v-else class="blurred">
        <div class="blurred-overlay">
          This year's official bracket hasn't been released yet. Team boosts unlock once the field is set — you can still build a bracket below.
        </div>
        <div class="blur-me">
          <v-autocomplete
            :items="[]"
            label="Pick your team"
            chips
          ></v-autocomplete>
          <v-select
            label="How much of an edge?"
            :items="benefitLevels"
            item-title="title"
            item-value="value"
            class="mt-4"
          ></v-select>
        </div>
      </div>
    </v-card>

    <!-- Step 2: name + run -->
    <v-card class="step-card" elevation="0">
      <div class="step-header">
        <span class="step-number">2</span>
        <h4>Name it and run the simulation</h4>
      </div>
      <div class="run-row">
        <v-text-field
          v-model="newBracket.name"
          label="Name your bracket"
          class="name-field"
        ></v-text-field>
        <v-btn
          @click="createBracket"
          color="warning"
          size="large"
          :loading="simRunning"
          :disabled="simRunning"
          prepend-icon="mdi-basketball"
        >
          Build My Bracket
        </v-btn>
      </div>

      <!-- Simulation progress -->
      <v-expand-transition>
        <div v-if="simRunning || finalsDisplay" class="sim-progress">
          <div v-for="step in simSteps" :key="step.label" class="sim-step" :class="{ done: step.done }">
            <v-icon v-if="step.done" color="warning" size="20">mdi-check-circle</v-icon>
            <v-progress-circular v-else-if="simRunning" indeterminate size="16" width="2" color="secondary"></v-progress-circular>
            <v-icon v-else size="20" class="pending-icon">mdi-circle-outline</v-icon>
            <span>{{ step.label }}</span>
          </div>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- How it works + disclaimer -->
    <v-card class="disclaimer-card" elevation="0">
      <h6 class="mb-2">How the simulation works</h6>
      <p class="fine-print">
        Our bracket simulation assigns a "favored" team in each matchup based on seed differences and user-selected odds adjustments, then runs a calculation to decide who advances. We repeat this process round by round until we have winners from each region, culminating in a final showdown. This approach reflects a powerful, but fun, weighted die roll (1's versus 16's is historically far from a toss up for example). We select out historical matchups that have under 20 meetings due to skewed results, and use a matchup gradient instead.
      </p>
      <p class="fine-print mb-0">
        All predictions, projections, and suggestions provided on this website are for entertainment purposes only. We do not guarantee the accuracy or outcome of any bracket, and we cannot be held liable for any financial losses, wagering issues, or other damages incurred by following these picks or strategies. By using Buster Brackets, you acknowledge that all final decisions are your own and agree to hold Buster Brackets and its creators harmless for any results or consequences thereof.
      </p>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
const route = useRoute()
const router = useRouter()
import moment from 'moment'
const { show } = inject('toast')

import {
  recordsOver20,
  fixRecords,
  startingBracketEast,
  startingBracketWest,
  startingBracketMidwest,
  startingBracketSouth,
} from '@/utils/bracketStruc'

const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// ─── Tournament data from API (replaces hardcoded bracketNames) ───
const tournamentTeams = ref({})     // { "e1": "Duke", ... } from API
const yearHasBracket = ref(false)   // true once we've loaded teams for the current year
const yearNowString = String(new Date().getFullYear())

// ─── Region simulation working arrays ───
const simEast = ref([])
const simWest = ref([])
const simSouth = ref([])
const simMidwest = ref([])

// ─── Structured results per region (replaces flat array accumulation) ───
const regionResults = ref({
  east: { round32: [], sweet16: [], elite8: [], regionChamp: '' },
  west: { round32: [], sweet16: [], elite8: [], regionChamp: '' },
  south: { round32: [], sweet16: [], elite8: [], regionChamp: '' },
  midwest: { round32: [], sweet16: [], elite8: [], regionChamp: '' },
})

const finalsResults = ref({
  teams: [],
  semifinals: [],
  champion: '',
})

// ─── Display flags ───
const eastDisplay = ref(false)
const westDisplay = ref(false)
const southDisplay = ref(false)
const midwestDisplay = ref(false)
const finalsDisplay = ref(false)
const simRunning = ref(false)

// Order matches the simulation order in createBracket
const simSteps = computed(() => [
  { label: 'East region', done: eastDisplay.value },
  { label: 'Midwest region', done: midwestDisplay.value },
  { label: 'South region', done: southDisplay.value },
  { label: 'West region', done: westDisplay.value },
  { label: 'Final Four & Championship', done: finalsDisplay.value },
])

// ─── Odds ───
const oddsTable = fixRecords(recordsOver20)

// ─── User input ───
const selectedTeam = ref("")
const teamsThisYear = ref([])
const addedBenefit = ref(0)
const benefitLevels = ref([
  { value: 0, title: 'None, Why did I select a team at all?' },
  { value: 3, title: "3% - I'm modest, what can I say?" },
  { value: 5, title: '5% - Puts a little more fight in the underdogs.' },
  { value: 10, title: '10% - A 10% swing can be a boon!' },
  { value: 25, title: '25% - Close matchups are close no more!' },
  { value: 50, title: '50% - Like bringing a gun to a knife fight.' },
  { value: 80, title: '80% - Only the lowest seeds can still have odds against them with this' },
  { value: 100, title: "100% - Just build my team a championship, bub." },
])

const newBracket = ref({
  name: "",
  bracket: {},
  userId: user.value._id
})


// ─── Core simulation logic ───

/**
 * Simulate a single region's tournament.
 * Returns the region champ seed string, populates regionResults[regionName].
 */
const simulateRegion = (startingSeeds, regionName, regionStr) => {
  // Clone the starting seeds as the working pool
  let pool = [...startingSeeds]
  const result = regionResults.value[regionName]

  // Reset
  result.round32 = []
  result.sweet16 = []
  result.elite8 = []
  result.regionChamp = ''

  const roundNames = ['round32', 'sweet16', 'elite8', 'regionChamp']
  let roundIndex = 0

  while (pool.length > 1) {
    const survivors = []

    for (let i = 0; i < pool.length; i += 2) {
      const teamA = pool[i]
      const teamB = pool[i + 1]

      const seedA = parseInt(teamA.slice(1))
      const seedB = parseInt(teamB.slice(1))

      let favored, notFavored
      if (seedA < seedB) {
        favored = seedA
        notFavored = seedB
      } else {
        favored = seedB
        notFavored = seedA
      }

      const matchup = `${favored}vs${notFavored}`
      let odd = getOdds(matchup, favored, notFavored)

      if (selectedTeam.value !== "") {
        odd = checkOddForAlterations(favored, notFavored, odd, regionStr)
      }

      const winner = Math.random() < (odd / 100)
        ? addBack(favored, regionStr)
        : addBack(notFavored, regionStr)

      survivors.push(winner)
    }

    // Store the round results
    const roundName = roundNames[roundIndex]
    if (roundName === 'regionChamp') {
      result.regionChamp = survivors[0]
    } else {
      result[roundName] = [...survivors]
    }

    pool = survivors
    roundIndex++
  }

  return pool[0] // region champ
}

const getOdds = (matchup, favored, notFavored) => {
  if (oddsTable.has(matchup)) {
    return oddsTable.get(matchup)
  } else if ((notFavored - favored) < 3) {
    return 60
  } else if ((notFavored - favored) < 6) {
    return 65
  } else if ((notFavored - favored) < 9) {
    return 75
  } else if ((notFavored - favored) < 12) {
    return 80
  } else {
    return 85
  }
}

const addBack = (num, regionStr) => {
  const prefixMap = { east: 'e', west: 'w', south: 's', midwest: 'm' }
  return (prefixMap[regionStr] || 'm') + num.toString()
}

const checkOddForAlterations = (favored, notFavored, odd, regionStr) => {
  const favoredStr = addBack(favored, regionStr)
  const unfavoredStr = addBack(notFavored, regionStr)

  if (selectedTeam.value === tournamentTeams.value[favoredStr]) {
    return Math.min(100, odd + addedBenefit.value)
  } else if (selectedTeam.value === tournamentTeams.value[unfavoredStr]) {
    return Math.max(0, odd - addedBenefit.value)
  }
  return odd
}

const checkFinalOddForAlterations = (favored, notFavored, odd) => {
  const favoredStr = addBack(favored.seed, favored.region)
  const unfavoredStr = addBack(notFavored.seed, notFavored.region)

  if (selectedTeam.value === tournamentTeams.value[favoredStr]) {
    return Math.min(100, odd + addedBenefit.value)
  } else if (selectedTeam.value === tournamentTeams.value[unfavoredStr]) {
    return Math.max(0, odd - addedBenefit.value)
  }
  return odd
}

/**
 * Simulate the Final Four.
 */
const simulateFinals = (regionChamps) => {
  // regionChamps = [{ seed: "e3", region: "east" }, ...]
  finalsResults.value.teams = regionChamps.map(r => r.seed)
  finalsResults.value.semifinals = []
  finalsResults.value.champion = ''

  let pool = [...regionChamps]

  // Semifinal round (2 games from 4 teams)
  const semiFinalWinners = []
  for (let i = 0; i < pool.length; i += 2) {
    const team1 = pool[i]
    const team2 = pool[i + 1]

    const seed1 = parseInt(team1.seed.slice(1))
    const seed2 = parseInt(team2.seed.slice(1))

    let favored, notFavored
    if (seed1 < seed2) {
      favored = { seed: seed1, region: team1.region }
      notFavored = { seed: seed2, region: team2.region }
    } else {
      favored = { seed: seed2, region: team2.region }
      notFavored = { seed: seed1, region: team1.region }
    }

    const matchup = `${favored.seed}vs${notFavored.seed}`
    let odd = getOdds(matchup, favored.seed, notFavored.seed)

    if (selectedTeam.value !== "") {
      odd = checkFinalOddForAlterations(favored, notFavored, odd)
    }

    const winner = Math.random() < (odd / 100)
      ? { seed: addBack(favored.seed, favored.region), region: favored.region }
      : { seed: addBack(notFavored.seed, notFavored.region), region: notFavored.region }

    semiFinalWinners.push(winner)
  }
  finalsResults.value.semifinals = semiFinalWinners.map(w => w.seed)

  // Championship game
  const team1 = semiFinalWinners[0]
  const team2 = semiFinalWinners[1]

  const seed1 = parseInt(team1.seed.slice(1))
  const seed2 = parseInt(team2.seed.slice(1))

  let favored, notFavored
  if (seed1 < seed2) {
    favored = { seed: seed1, region: team1.region }
    notFavored = { seed: seed2, region: team2.region }
  } else {
    favored = { seed: seed2, region: team2.region }
    notFavored = { seed: seed1, region: team1.region }
  }

  const matchup = `${favored.seed}vs${notFavored.seed}`
  let odd = getOdds(matchup, favored.seed, notFavored.seed)

  if (selectedTeam.value !== "") {
    odd = checkFinalOddForAlterations(favored, notFavored, odd)
  }

  const champion = Math.random() < (odd / 100)
    ? addBack(favored.seed, favored.region)
    : addBack(notFavored.seed, notFavored.region)

  finalsResults.value.champion = champion
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const createBracket = async () => {
  // Reset results and progress display
  finalsResults.value = { teams: [], semifinals: [], champion: '' }
  simRunning.value = true
  eastDisplay.value = false
  westDisplay.value = false
  southDisplay.value = false
  midwestDisplay.value = false
  finalsDisplay.value = false

  // Process each region
  const eastChamp = simulateRegion([...startingBracketEast], 'east', 'east')
  eastDisplay.value = true
  await sleep(2000)

  const midwestChamp = simulateRegion([...startingBracketMidwest], 'midwest', 'midwest')
  midwestDisplay.value = true
  await sleep(2000)

  const southChamp = simulateRegion([...startingBracketSouth], 'south', 'south')
  southDisplay.value = true
  await sleep(2000)

  const westChamp = simulateRegion([...startingBracketWest], 'west', 'west')
  westDisplay.value = true
  await sleep(2000)

  // Finals
  const final4 = [
    { seed: eastChamp, region: 'east' },
    { seed: midwestChamp, region: 'midwest' },
    { seed: southChamp, region: 'south' },
    { seed: westChamp, region: 'west' },
  ]

  simulateFinals(final4)
  finalsDisplay.value = true
  await sleep(1000)

  // ─── Assemble the StructuredBracket ───
  const structuredBracket = {
    east: { ...regionResults.value.east },
    midwest: { ...regionResults.value.midwest },
    south: { ...regionResults.value.south },
    west: { ...regionResults.value.west },
    finals: { ...finalsResults.value },
  }

  newBracket.value.bracket = structuredBracket
  simRunning.value = false
  submitNewBracket()
}

const submitNewBracket = async () => {
  try {
    const response = await $brackets.post('/create-bracket', newBracket.value)
    if (response.status === 200) {
      decrementCredits()
    }
  } catch (error) {
    console.error(error)
  }
}

const decrementCredits = async () => {
  try {
    const response = await $users.patch('/decrement-credits')
    if (response.status === 200) {
      show({ message: 'Thanks for creating a bracket with us. You will be redirected to your dashboard to view your bracket.' })
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    }
  } catch (error) {
    console.error(error)
  }
}

// ─── Load tournament data from API ───
const loadTournamentData = async () => {
  try {
    const { data } = await $brackets.get(`/tournament-data?year=${yearNowString}`)
    tournamentTeams.value = data.teams
    yearHasBracket.value = true

    // Build the team names array for the autocomplete
    teamsThisYear.value = Object.values(data.teams)
  } catch (err) {
    // No tournament data for this year — that's OK, yearHasBracket stays false
    console.log(`No tournament data found for ${yearNowString}`)
    yearHasBracket.value = false
  }
}

onMounted(async () => {
  await loadTournamentData()
})
</script>

<style scoped>
.builder-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 0.5rem 1rem 2rem;
}

.title-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff6801 0%, #fcc35b 100%);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  box-shadow: 0 10px 26px rgba(255, 104, 1, 0.3);
}

.title-card h2 {
  margin: 0;
  color: #fff;
}

.user-name {
  color: #07152a;
}

.title-sub {
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
}

.step-card {
  padding: 1.5rem 1.75rem;
  margin-bottom: 1.25rem;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.step-header h4 {
  margin: 0;
}

.step-number {
  flex: 0 0 30px;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  background: #1071a0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
}

.optional {
  font-weight: 400;
  color: rgba(7, 21, 42, 0.55);
  font-size: 15px;
}

.hint-text {
  font-size: 13px;
  color: rgba(7, 21, 42, 0.65);
  margin: 0;
}

.paratool {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.info-icon {
  color: #1071a0;
}

.blurred {
  position: relative;
}

.blur-me {
  filter: blur(3px);
  pointer-events: none;
}

.blurred-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 600;
  padding: 2rem;
  box-sizing: border-box;
  z-index: 1;
}

.run-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.name-field {
  flex: 1 1 280px;
}

.sim-progress {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(7, 21, 42, 0.1);
}

.sim-step {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 14px;
  color: rgba(7, 21, 42, 0.55);
}

.sim-step.done {
  color: #07152a;
  font-weight: 600;
}

.pending-icon {
  color: rgba(7, 21, 42, 0.3);
}

.disclaimer-card {
  padding: 1.25rem 1.5rem;
}

.fine-print {
  font-size: 12px;
  line-height: 1.5;
  color: rgba(7, 21, 42, 0.65);
  margin-bottom: 0.75rem;
}

@media (max-width: 700px) {
  .step-card {
    padding: 1.1rem 1.2rem;
  }
}
</style>