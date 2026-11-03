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

        <div v-if="selectedTeam" class="mt-4">
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
        Every matchup is a weighted roll. The odds come from every tournament game since 1985: each seed earns a strength from that history, and each pairing's actual record is blended with it, so a 1 seed against a 16 is close to a lock while an 8 against a 9 is close to a coin flip. Pairings that rarely happen still get a sensible number instead of a guess. A boost adds its percentage to your team's chance in every one of its games. We roll round by round in each region, then play the Final Four and the championship.
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

const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// ─── Tournament data from API (replaces hardcoded bracketNames) ───
const tournamentTeams = ref({})     // { "e1": "Duke", ... } from API
const yearHasBracket = ref(false)   // true once we've loaded teams for the current year
const yearNowString = String(new Date().getFullYear())

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

// ─── User input ───
// null, not "", or the chips autocomplete renders an empty chip before any pick.
const selectedTeam = ref(null)
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


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// The selected team's seed key ("m1"), which is what the server boosts.
const favoriteKey = computed(() =>
  Object.keys(tournamentTeams.value).find((key) => tournamentTeams.value[key] === selectedTeam.value) || null
)

// The simulation runs on the server (POST /simulate-bracket); this reveals the
// result region by region at the pace the page always had.
const createBracket = async () => {
  simRunning.value = true
  eastDisplay.value = false
  westDisplay.value = false
  southDisplay.value = false
  midwestDisplay.value = false
  finalsDisplay.value = false

  let result
  try {
    const { data } = await $brackets.post('/simulate-bracket', {
      year: Number(yearNowString),
      favorite: favoriteKey.value || undefined,
      boost: favoriteKey.value ? addedBenefit.value : 0,
    })
    result = data
  } catch (error) {
    console.error(error)
    simRunning.value = false
    show({ message: error.response?.data?.error || 'The simulation is unavailable right now. Please try again.' })
    return
  }

  for (const regionDone of [eastDisplay, midwestDisplay, southDisplay, westDisplay]) {
    regionDone.value = true
    await sleep(2000)
  }
  finalsDisplay.value = true
  await sleep(1000)

  newBracket.value.bracket = result.bracket
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