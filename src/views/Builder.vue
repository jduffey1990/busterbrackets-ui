<template>
  <div class="title-card">
    <div class="title-heading">
      <h2>
        <span class="user-name">{{ user.name }}</span>'s bracket builder
      </h2>
    </div>
  </div>

  <div>
    <div v-if="yearHasBracket">
      <v-autocomplete
        v-model="selectedTeam"
        :items="teamsThisYear"
        label="Select Your Team If you want to increase their odds"
        chips
        clear-on-select
        class="autocomplete"
      ></v-autocomplete>
      <p class="small mb-10">The team you choose will receive a benefit if you please.</p>
      <div v-if="selectedTeam.length">
        <v-select
          label="Select a handicap to help your team against opponents"
          class="autocomplete"
          v-model="addedBenefit"
          :items="benefitLevels"
          item-title="title"
          item-value="value"
        ></v-select>
        <div class="paratool">
          <p class="small mb-6">The percentage is not an overall percentage.</p>
          <v-tooltip
            text="It is an added chance each round to pass the opposing team. Win chances can't go over 100, and 100% means that your team will win the bracket automation. A 9 seed team with a 40% chance of winning and a 10% increase will have a 50% chance of winning that round"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" small color="grayblue" class="icon">mdi-information</v-icon>
            </template>
          </v-tooltip>
        </div>
      </div>
    </div>
    <div v-else class="blurred">
      <div class="blurred-overlay">
        There is not a bracket officially released for this year. If you would like to increase a specific team's odds, please wait until the bracket is released.
      </div>
      <div class="blur-me">
        <v-autocomplete
          v-model="selectedTeam"
          :items="teamsThisYear"
          label="Select Your Team If you want to increase their odds"
          chips
          closable-chips
          clear-on-select
          class="autocomplete"
        ></v-autocomplete>
        <p class="small mb-6">The team you choose will receive a benefit if you please.</p>
        <v-select
          label="Select a handicap to help your team against opponents"
          v-model="addedBenefit"
          :items="benefitLevels"
          item-title="title"
          item-value="value"
          class="autocomplete"
        ></v-select>
        <p class="small mb-6">
          The percentage is not an overall percentage. It is an added chance each round to pass the opposing team.
          Win chances can't go over 100, and 100% means that your team will win the bracket automation.
        </p>
      </div>
    </div>
  </div>
  <hr class="mb-10">
  <div class="centered">
    <v-text-field v-model="newBracket.name" label="Name Your Bracket" width="400" class="mb-6"></v-text-field>
    <v-btn @click="createBracket" color="warning" class="mb-10">Create Bracket Now!</v-btn>

    <div class="bracket-status" v-if="eastDisplay"><p>East bracket processing complete!</p></div>
    <div class="bracket-status" v-if="westDisplay"><p>West bracket processing complete!</p></div>
    <div class="bracket-status" v-if="southDisplay"><p>South bracket processing complete!</p></div>
    <div class="bracket-status" v-if="midwestDisplay"><p>Midwest bracket processing complete!</p></div>
    <div class="bracket-status" v-if="finalsDisplay"><p>Finals bracket processing complete!</p></div>

    <div class="disclaimer">
      <p class="small">
        Our bracket simulation assigns a "favored" team in each matchup based on seed differences and user-selected odds adjustments, then runs a calculation to decide who advances. We repeat this process round by round until we have winners from each region, culminating in a final showdown. This approach reflects a powerful, but fun, weighted die roll (1's versus 16's is historically far from a toss up for example). We
        select out historical matchups that have under 20 meetings due to skewed results, and use a matchup gradient instead.
      </p>
      <br />
      <p class="small">
        All predictions, projections, and suggestions provided on this website are for entertainment purposes only. We do not guarantee the accuracy or outcome of any bracket, and we cannot be held liable for any financial losses, wagering issues, or other damages incurred by following these picks or strategies. By using Buster Brackets, you acknowledge that all final decisions are your own and agree to hold Buster Brackets and its creators harmless for any results or consequences thereof.
      </p>
    </div>
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
  // Reset results
  finalsResults.value = { teams: [], semifinals: [], champion: '' }

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
.title-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(245deg, #FF6801 0%, #FFB278 50%, #fffcee 100%);
  border: 2px solid #e6cc80;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.title-heading h2 { margin: 0; font-size: 1.75rem; font-weight: 700; color: #444; }
.paratool { display: flex; flex-direction: row; }
.user-name { color: #423f3b; }
.blurred { position: relative; padding: 1rem; }
.blur-me { filter: blur(3px); pointer-events: none; opacity: 1; }
.blurred-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(255, 255, 255, 0.5);
  display: flex; align-items: center; justify-content: center;
  text-align: center; font-weight: bold; padding: 4rem;
  box-sizing: border-box; z-index: 1;
}
.autocomplete { width: 500px; }
.centered { display: flex; flex-direction: column; justify-content: center; align-items: center; }
.bracket-status {
  background: rgba(255, 255, 255, 0.5); border-radius: 5px;
  padding: 1rem; margin: 0.5rem 0; text-align: center; font-weight: bold;
}
.disclaimer {
  background: rgba(255, 255, 255, 0.5);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; font-weight: lighter; padding: 1.5rem;
  box-sizing: border-box; z-index: 1; border-radius: 12px;
  margin-bottom: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>