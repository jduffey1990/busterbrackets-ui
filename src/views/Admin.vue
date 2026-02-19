<template>
  <div class="admin-container">
    <h1 class="mb-4">Tournament Admin</h1>

    <!-- ─── Year Selector ─── -->
    <v-card class="mb-6 pa-4" elevation="3">
      <v-card-title>Select or Create Year</v-card-title>
      <v-card-text>
        <div class="d-flex align-center ga-4">
          <v-select
            v-model="selectedYear"
            :items="availableYears"
            label="Existing Years"
            class="year-select"
            @update:model-value="loadYear"
          ></v-select>
          <span class="mx-2">or</span>
          <v-text-field
            v-model.number="newYear"
            label="New Year"
            type="number"
            class="year-input"
          ></v-text-field>
          <v-btn color="primary" @click="startNewYear" :disabled="!newYear">
            Create
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- ─── Teams Entry ─── -->
    <v-card v-if="activeYear" class="mb-6 pa-4" elevation="3">
      <v-card-title>
        {{ activeYear }} Teams
        <v-chip :color="teamsComplete ? 'success' : 'warning'" class="ml-2" size="small">
          {{ teamCount }}/64 filled
        </v-chip>
      </v-card-title>
      <v-card-text>
        <v-tabs v-model="regionTab" color="warning">
          <v-tab value="east">East</v-tab>
          <v-tab value="west">West</v-tab>
          <v-tab value="south">South</v-tab>
          <v-tab value="midwest">Midwest</v-tab>
        </v-tabs>

        <v-tabs-window v-model="regionTab">
          <v-tabs-window-item
            v-for="region in regionConfigs"
            :key="region.prefix"
            :value="region.name"
          >
            <div class="teams-grid mt-4">
              <v-text-field
                v-for="seed in 16"
                :key="`${region.prefix}${seed}`"
                v-model="teams[`${region.prefix}${seed}`]"
                :label="`${seed} Seed`"
                density="compact"
                variant="outlined"
                class="team-input"
              ></v-text-field>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>

        <div class="d-flex ga-2 mt-4">
          <v-btn
            color="warning"
            @click="saveTeams"
            :loading="savingTeams"
            :disabled="!teamsComplete"
          >
            {{ isNewYear ? 'Create Tournament' : 'Update Teams' }}
          </v-btn>
          <v-btn variant="outlined" @click="clearTeams">Clear All</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- ─── Results Entry ─── -->
    <v-card v-if="activeYear && !isNewYear" class="mb-6 pa-4" elevation="3">
      <v-card-title>
        {{ activeYear }} Results
        <v-chip :color="hasResults ? 'success' : 'info'" class="ml-2" size="small">
          {{ hasResults ? 'Results entered' : 'No results yet' }}
        </v-chip>
      </v-card-title>
      <v-card-text>
        <p class="text-body-2 mb-4">
          Enter winners for each round as games complete. Use seed codes like "e1", "w3", "s11", etc.
        </p>

        <v-tabs v-model="resultsRegionTab" color="warning">
          <v-tab value="r-east">East</v-tab>
          <v-tab value="r-west">West</v-tab>
          <v-tab value="r-south">South</v-tab>
          <v-tab value="r-midwest">Midwest</v-tab>
          <v-tab value="r-finals">Finals</v-tab>
        </v-tabs>

        <v-tabs-window v-model="resultsRegionTab">
          <!-- Region results tabs -->
          <v-tabs-window-item
            v-for="region in regionConfigs"
            :key="'r-' + region.name"
            :value="'r-' + region.name"
          >
            <div class="results-section mt-4">
              <h4 class="mb-2">Round of 32 (8 winners)</h4>
              <div class="results-grid">
                <v-autocomplete
                  v-for="i in 8"
                  :key="`${region.name}-r32-${i}`"
                  v-model="results[region.name].round32[i - 1]"
                  :items="regionSeedOptions(region.prefix)"
                  :label="`Game ${i} winner`"
                  density="compact"
                  variant="outlined"
                  class="result-input"
                  clearable
                ></v-autocomplete>
              </div>

              <h4 class="mb-2 mt-4">Sweet 16 (4 winners)</h4>
              <div class="results-grid">
                <v-autocomplete
                  v-for="i in 4"
                  :key="`${region.name}-s16-${i}`"
                  v-model="results[region.name].sweet16[i - 1]"
                  :items="regionSeedOptions(region.prefix)"
                  :label="`Game ${i} winner`"
                  density="compact"
                  variant="outlined"
                  class="result-input"
                  clearable
                ></v-autocomplete>
              </div>

              <h4 class="mb-2 mt-4">Elite 8 (2 winners)</h4>
              <div class="results-grid">
                <v-autocomplete
                  v-for="i in 2"
                  :key="`${region.name}-e8-${i}`"
                  v-model="results[region.name].elite8[i - 1]"
                  :items="regionSeedOptions(region.prefix)"
                  :label="`Game ${i} winner`"
                  density="compact"
                  variant="outlined"
                  class="result-input"
                  clearable
                ></v-autocomplete>
              </div>

              <h4 class="mb-2 mt-4">Region Champion</h4>
              <v-autocomplete
                v-model="results[region.name].regionChamp"
                :items="regionSeedOptions(region.prefix)"
                label="Region champion"
                density="compact"
                variant="outlined"
                class="result-input"
                clearable
              ></v-autocomplete>
            </div>
          </v-tabs-window-item>

          <!-- Finals tab -->
          <v-tabs-window-item value="r-finals">
            <div class="results-section mt-4">
              <h4 class="mb-2">Final Four Teams (4 region champs)</h4>
              <div class="results-grid">
                <v-autocomplete
                  v-for="i in 4"
                  :key="`finals-team-${i}`"
                  v-model="results.finals.teams[i - 1]"
                  :items="allSeedOptions"
                  :label="`Region champ ${i}`"
                  density="compact"
                  variant="outlined"
                  class="result-input"
                  clearable
                ></v-autocomplete>
              </div>

              <h4 class="mb-2 mt-4">Semifinal Winners</h4>
              <div class="results-grid">
                <v-autocomplete
                  v-for="i in 2"
                  :key="`finals-semi-${i}`"
                  v-model="results.finals.semifinals[i - 1]"
                  :items="allSeedOptions"
                  :label="`Semifinal ${i} winner`"
                  density="compact"
                  variant="outlined"
                  class="result-input"
                  clearable
                ></v-autocomplete>
              </div>

              <h4 class="mb-2 mt-4">Champion</h4>
              <v-autocomplete
                v-model="results.finals.champion"
                :items="allSeedOptions"
                label="Tournament champion"
                density="compact"
                variant="outlined"
                class="result-input"
                clearable
              ></v-autocomplete>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>

        <v-btn
          color="warning"
          class="mt-4"
          @click="saveResults"
          :loading="savingResults"
        >
          Save Results
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- ─── Status Messages ─── -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const $brackets = inject('$bracketsApi')

// ─── State ───
const availableYears = ref([])
const selectedYear = ref(null)
const newYear = ref(new Date().getFullYear())
const activeYear = ref(null)
const isNewYear = ref(false)

const regionTab = ref('east')
const resultsRegionTab = ref('r-east')

const savingTeams = ref(false)
const savingResults = ref(false)

const snackbar = ref({ show: false, text: '', color: 'success' })

const regionConfigs = [
  { name: 'east', prefix: 'e', label: 'East' },
  { name: 'west', prefix: 'w', label: 'West' },
  { name: 'south', prefix: 's', label: 'South' },
  { name: 'midwest', prefix: 'm', label: 'Midwest' },
]

// ─── Teams ───
const teams = ref({})

function initEmptyTeams() {
  const t = {}
  for (const { prefix } of regionConfigs) {
    for (let seed = 1; seed <= 16; seed++) {
      t[`${prefix}${seed}`] = ''
    }
  }
  return t
}

const teamCount = computed(() => {
  return Object.values(teams.value).filter(v => v && v.trim()).length
})

const teamsComplete = computed(() => teamCount.value === 64)

function clearTeams() {
  teams.value = initEmptyTeams()
}

// ─── Results ───
const results = ref(emptyResults())
const hasResults = ref(false)

function emptyResults() {
  const emptyRegion = () => ({
    round32: Array(8).fill(''),
    sweet16: Array(4).fill(''),
    elite8: Array(2).fill(''),
    regionChamp: '',
  })
  return {
    east: emptyRegion(),
    west: emptyRegion(),
    south: emptyRegion(),
    midwest: emptyRegion(),
    finals: {
      teams: Array(4).fill(''),
      semifinals: Array(2).fill(''),
      champion: '',
    },
  }
}

// ─── Autocomplete options ───
function regionSeedOptions(prefix) {
  return Array.from({ length: 16 }, (_, i) => {
    const key = `${prefix}${i + 1}`
    const name = teams.value[key]
    return {
      title: name ? `${key} — ${name}` : key,
      value: key,
    }
  })
}

const allSeedOptions = computed(() => {
  return regionConfigs.flatMap(({ prefix }) =>
    Array.from({ length: 16 }, (_, i) => {
      const key = `${prefix}${i + 1}`
      const name = teams.value[key]
      return {
        title: name ? `${key} — ${name}` : key,
        value: key,
      }
    })
  )
})

// ─── API Calls ───
async function loadAvailableYears() {
  try {
    const { data } = await $brackets.get('/tournament-data/years')
    availableYears.value = data.years || []
  } catch (err) {
    console.error('Failed to load years:', err)
  }
}

async function loadYear(year) {
  if (!year) return
  try {
    const { data } = await $brackets.get(`/tournament-data?year=${year}`)
    activeYear.value = year
    isNewYear.value = false

    // Populate teams
    teams.value = { ...initEmptyTeams(), ...data.teams }

    // Populate results if they exist
    if (data.results) {
      results.value = JSON.parse(JSON.stringify(data.results))
      hasResults.value = true
    } else {
      results.value = emptyResults()
      hasResults.value = false
    }
  } catch (err) {
    console.error('Failed to load year data:', err)
    notify('Failed to load tournament data', 'error')
  }
}

function startNewYear() {
  if (!newYear.value) return
  activeYear.value = newYear.value
  isNewYear.value = true
  teams.value = initEmptyTeams()
  results.value = emptyResults()
  hasResults.value = false
}

async function saveTeams() {
  savingTeams.value = true
  try {
    if (isNewYear.value) {
      await $brackets.post('/tournament-data', {
        year: activeYear.value,
        teams: teams.value,
      })
      isNewYear.value = false
      await loadAvailableYears()
      notify('Tournament created successfully!')
    } else {
      await $brackets.put('/tournament-data/teams', {
        year: activeYear.value,
        teams: teams.value,
      })
      notify('Teams updated successfully!')
    }
  } catch (err) {
    const msg = err.response?.data?.error || 'Failed to save teams'
    notify(msg, 'error')
  } finally {
    savingTeams.value = false
  }
}

async function saveResults() {
  savingResults.value = true
  try {
    // Clean out empty strings → null for partial results
    const cleaned = JSON.parse(JSON.stringify(results.value))
    await $brackets.put('/tournament-data/results', {
      year: activeYear.value,
      results: cleaned,
    })
    hasResults.value = true
    notify('Results saved successfully!')
  } catch (err) {
    const msg = err.response?.data?.error || 'Failed to save results'
    notify(msg, 'error')
  } finally {
    savingResults.value = false
  }
}

function notify(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

// ─── Lifecycle ───
onMounted(async () => {
  await loadAvailableYears()
  // Auto-load current year if available
  const currentYear = new Date().getFullYear()
  if (availableYears.value.includes(currentYear)) {
    selectedYear.value = currentYear
    await loadYear(currentYear)
  }
})
</script>

<style scoped>
.admin-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.year-select {
  max-width: 200px;
}

.year-input {
  max-width: 120px;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.team-input {
  min-width: 180px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
}

.result-input {
  min-width: 200px;
}

@media (max-width: 600px) {
  .teams-grid,
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>