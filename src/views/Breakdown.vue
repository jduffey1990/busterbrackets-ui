<template>
  <div class="breakdown-page">
    <h2 class="mb-4">Bracket Breakdown</h2>

    <div v-if="loading" class="text-center mt-10">
      <v-progress-circular indeterminate color="warning"></v-progress-circular>
      <p>Analyzing your bracket...</p>
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
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
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
const { user } = storeToRefs(userStore)

// ─── State ───
const bracketReturned = ref({})
const htmlBracket = ref({})           // StructuredBracket from the DB
const tournamentTeams = ref({})       // team names from API
const tournamentResults = ref(null)   // actual results from API (null if not available)
const yearBracketString = ref('')
const isPostTournament = ref(false)
const loading = ref(false)
const breakdownDescription = ref('')
const comparisonStats = ref(null)

const bracketId = route.query.id

// ─── Formatting ───
const formatName = (seedString) => {
  return formatTeamDisplay(seedString, tournamentTeams.value)
}

const formattedDescription = computed(() => {
  // Convert newlines to <br> and bold markers if present
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
    isPostTournament.value = !!data.results
  } catch (err) {
    console.log(`No tournament data for ${year}`)
    tournamentTeams.value = baseTeamNames
    tournamentResults.value = null
    isPostTournament.value = false
  }
}

// ─── Analysis ───
function buildPrompt(officialBracket, userBracket, comparison, yearBracketString, teamNames) {
  const { correctPicks, totalGames, upsets } = comparison

  // Map seed codes to team names for the LLM
  const upsetNames = upsets.map(u => {
    const name = teamNames[u] || u
    return `${u} (${name})`
  })

  const teamNamesJson = JSON.stringify(teamNames, null, 2)

  if (isPostTournament.value) {
    return `
      User's bracket: ${JSON.stringify(userBracket)}
      Actual tournament results: ${JSON.stringify(officialBracket)}

      The user had ${correctPicks} correct picks out of ${totalGames}.
      They predicted the following underdogs: ${upsetNames.join(", ")} where the deeper tournament runs are entries towards the end of the string, or values that have higher numerical values in the name.

      Team names mapping: ${teamNamesJson}

      Please write a short (three paragraph max), sportscaster-style summary without copyright infringement describing:
      1. The overall performance compared to the real results.
      2. Two notable upsets they picked correctly (two sentences max) either:
          a. big underdog (seed over 12)
          b. deep run underdogs
      3. Exclude words "March Madness, NCAA, Sweet Sixteen, Elite Eight, Final Four" due to copyright
    `
  } else {
    const baseBracket = buildBaseBracket()
    return `
      benchmark, no-upset bracket: ${JSON.stringify(baseBracket)}
      user's bracket: ${JSON.stringify(userBracket)}

      The user bracket picks seeds that differ from the standard favorites
      in these spots: ${upsetNames.join(", ")} where the deeper tournament runs are entries towards the end of the string, or values that have higher numerical values in the name.

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
    if (window.location.origin === "http://localhost:4000") {
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

const getBreakdown = async () => {
  loading.value = true

  // Determine which official bracket to compare against
  const officialBracket = isPostTournament.value
    ? tournamentResults.value
    : buildBaseBracket()

  // Compare
  const comparison = compareBrackets(officialBracket, htmlBracket.value)
  comparisonStats.value = comparison

  // Build prompt and get LLM description
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

// ─── Lifecycle ───
onMounted(async () => {
  loading.value = true
  await getBracket()
  if (yearBracketString.value) {
    await loadTournamentData(yearBracketString.value)
  }
  await getBreakdown()
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