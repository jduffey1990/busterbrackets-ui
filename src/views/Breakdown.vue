<template>
  <div class="breakdown-page">
    <h2 class="mb-4">Bracket Breakdown</h2>

    <!-- Loading / warming up -->
    <div v-if="loading" class="text-center mt-10">
      <v-progress-circular indeterminate color="warning" class="mb-2"></v-progress-circular>
      <p v-if="serverStatusStore.bracketsChecking" class="text-body-2 text-medium-emphasis">
        Warming up the brackets server...
      </p>
      <p v-else>Analyzing your bracket...</p>
    </div>

    <!-- Server failed to wake -->
    <div v-else-if="serverError" class="text-center mt-10">
      <v-icon color="error" size="40" class="mb-2">mdi-server-off</v-icon>
      <p class="text-body-1">Could not reach the brackets server.</p>
      <p class="text-body-2 text-medium-emphasis">Please refresh the page to try again.</p>
    </div>

    <div v-else-if="breakdownDescription">
      <v-card class="pa-4 mb-4" elevation="3">
        <v-card-title>
          {{ bracketReturned.name || 'Bracket' }} — {{ isPostTournament ? 'Post-Tournament Analysis' : 'Preview' }}
        </v-card-title>
        <v-card-text>
          <div class="breakdown-text" v-html="formattedDescription"></div>
        </v-card-text>
      </v-card>

      <v-card v-if="comparisonStats" class="pa-4 mb-4" elevation="2">
        <v-card-title>Stats</v-card-title>
        <v-card-text>
          <p v-if="isPostTournament">
            Correct picks: <strong>{{ comparisonStats.correctPicks }}</strong> / {{ comparisonStats.totalGames }}
          </p>
          <p v-if="comparisonStats.upsets.length">
            Underdog picks: <strong>{{ comparisonStats.upsets.map(u => formatName(u)).join(', ') }}</strong>
          </p>
        </v-card-text>
      </v-card>
    </div>

    <div v-else class="text-center mt-10">
      <p>Unable to generate breakdown.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useServerStatusStore } from '@/store/serverStatus'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import {
  compareBrackets,
  buildBaseBracket,
  formatTeamDisplay,
  formatTeamTitle,
  baseTeamNames,
} from '@/utils/bracketStruc'

const route = useRoute()
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

const userStore = useUserStore()
const serverStatusStore = useServerStatusStore()
const { user } = storeToRefs(userStore)

// ─── State ───
const bracketReturned = ref({})
const htmlBracket = ref({})
const tournamentTeams = ref({})
const tournamentResults = ref(null)
const yearBracketString = ref('')
const isPostTournament = ref(false)
const loading = ref(true) // true from the start — covers both warm-up and data fetching
const serverError = ref(false)
const breakdownDescription = ref('')
const comparisonStats = ref(null)

const bracketId = route.query.id

// ─── Formatting ───
const formatName = (seedString) => {
  return formatTeamDisplay(seedString, tournamentTeams.value)
}

const formattedDescription = computed(() => {
  return (breakdownDescription.value || '').replace(/\n/g, '<br>')
})

// ─── Data Loading ───
const getBracket = async () => {
  try {
    const response = await $brackets.get(`get-bracket?id=${bracketId}`)
    bracketReturned.value = response.data
    htmlBracket.value = response.data.bracket
    yearBracketString.value = response.data.createdAt.slice(0, 4)
  } catch (error) {
    console.error(error)
  }
}

const loadTournamentData = async (year) => {
  try {
    const { data } = await $brackets.get(`/tournament-data?year=${year}`)
    tournamentTeams.value = data.teams || {}
    tournamentResults.value = data.results || null
    isPostTournament.value = !tournamentResults.value
  } catch (error) {
    console.error(error)
  }
}

const getBreakdown = async () => {
  loading.value = true

  const officialBracket = isPostTournament.value
    ? tournamentResults.value
    : buildBaseBracket()

  const comparison = compareBrackets(officialBracket, htmlBracket.value)
  comparisonStats.value = comparison

  const prompt = buildPrompt(
    officialBracket,
    htmlBracket.value,
    comparison,
    yearBracketString.value,
    tournamentTeams.value
  )

  try {
    breakdownDescription.value = await buildLlmDescription(prompt)
  } catch (err) {
    breakdownDescription.value = 'Unable to generate AI analysis at this time.'
  }

  loading.value = false
}

function buildPrompt(officialBracket, userBracket, comparison, year, teamNames) {
  const teamNamesJson = JSON.stringify(teamNames)
  if (isPostTournament.value) {
    return `
      You are a sports analyst reviewing a college basketball tournament bracket.
      Year: ${year}
      User's bracket: ${JSON.stringify(userBracket)}
      Official results: ${JSON.stringify(officialBracket)}
      Comparison stats: ${JSON.stringify(comparison)}
      Team names mapping: ${teamNamesJson}

      Please write a short (three paragraph max), sportscaster-style post-tournament analysis without copyright infringement describing:
      1. Notable correct upset picks (two sentences max)
      2. How the bracket winner prediction fared (two sentences max)
      3. Overall bracket performance summary
      4. Do not hallucinate storylines not present in the data.
      5. Exclude words "March Madness, NCAA, Sweet Sixteen, Elite Eight, Final Four" due to copyright
    `
  } else {
    return `
      You are a sports analyst previewing a college basketball tournament bracket.
      Year: ${year}
      User's bracket: ${JSON.stringify(userBracket)}
      Benchmark bracket: ${JSON.stringify(officialBracket)}
      Comparison stats: ${JSON.stringify(comparison)}
      Team names mapping: ${teamNamesJson}

      Please write a short (three paragraph max), sportscaster-style preview without copyright infringement describing:
      1. Two notable upsets they picked compared to benchmark (two sentences max) either:
          a. big underdog (seed over 12)
          b. deep run underdogs
      2. Bracket winner (two sentences max)
      3. Remember that the tournament hasn't actually happened, yet, so these are prospective picks.
      4. Do not hallucinate past years results or storylines.
      5. Exclude words "March Madness, NCAA, Sweet Sixteen, Elite Eight, Final Four" due to copyright
    `
  }
}

async function buildLlmDescription(prompt) {
  const openAIURL = 'https://api.openai.com/v1/chat/completions'

  const localKey = `llmCache::${bracketReturned.value._id}`
  const cached = localStorage.getItem(localKey)
  if (cached) {
    return JSON.parse(cached)
  }

  try {
    if (window.location.origin === 'http://localhost:4000') {
      const response = {
        data: `This bracket features some bold picks that challenge conventional seeding wisdom. The user isn't afraid to back underdogs in key matchups, showing confidence in teams that many would overlook.

        Notable upset selections include some intriguing lower-seeded teams advancing deeper than expected, which could create exciting narratives if the tournament unfolds this way.

        Overall, this bracket balances favorite picks in the early rounds with some calculated risks in the later stages, making for a compelling set of predictions.`
      }
      userStore.setCachedResponse(bracketReturned.value._id, response.data)
      localStorage.setItem(localKey, JSON.stringify(response.data))
      return response.data
    } else {
      const response = await axios.post(
        openAIURL,
        {
          model: 'gpt-4o-mini',
          store: true,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GPT_API_KEY}`
          }
        }
      )
      const content = response.data.choices[0].message.content
      userStore.setCachedResponse(bracketReturned.value._id, content)
      localStorage.setItem(localKey, JSON.stringify(content))
      return content
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    throw error
  }
}

// ─── Lifecycle ───
const runDataLoad = async () => {
  await getBracket()
  if (yearBracketString.value) {
    await loadTournamentData(yearBracketString.value)
  }
  await getBreakdown()
}

onMounted(() => {
  // loading starts true — spinner shows immediately regardless of path below

  if (serverStatusStore.bracketsReady) {
    runDataLoad()
  } else if (serverStatusStore.bracketsError) {
    loading.value = false
    serverError.value = true
  } else {
    // Server still warming up — watch for resolution
    const unwatch = watch(
      () => [serverStatusStore.bracketsReady, serverStatusStore.bracketsError],
      ([ready, error]) => {
        if (ready) {
          unwatch()
          runDataLoad()
        } else if (error) {
          unwatch()
          loading.value = false
          serverError.value = true
        }
      }
    )
  }
})
</script>

<style scoped>
.breakdown-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.breakdown-text {
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>