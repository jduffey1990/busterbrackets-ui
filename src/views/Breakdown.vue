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

    <div v-else-if="comparisonStats || breakdownDescription">
      <v-card class="pa-4 mb-4" elevation="3">
        <v-card-title>
          {{ bracketName || 'Bracket' }} — {{ isPostTournament ? 'Post-Tournament Analysis' : 'Preview' }}
        </v-card-title>
        <v-card-text>
          <div v-if="breakdownDescription" class="breakdown-text" v-html="formattedDescription"></div>
          <p v-else class="text-medium-emphasis mb-0">
            The AI recap is temporarily unavailable. Your stats are below.
          </p>
        </v-card-text>
      </v-card>

      <v-card v-if="comparisonStats" class="pa-4 mb-4" elevation="2">
        <v-card-title>Stats</v-card-title>
        <v-card-text>
          <p v-if="isPostTournament">
            Correct picks: <strong>{{ comparisonStats.correctPicks }}</strong> / {{ comparisonStats.totalGames }}
          </p>
          <p v-if="comparisonStats.upsets.length">
            {{ isPostTournament ? 'Underdog picks you nailed' : 'Bold underdog picks' }}:
            <strong>{{ comparisonStats.upsets.join(', ') }}</strong>
          </p>
          <p v-else-if="isPostTournament" class="text-medium-emphasis mb-0">
            No double-digit-seed upsets called correctly — you played it chalky.
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
import { useServerStatusStore } from '@/store/serverStatus'

const route = useRoute()
const $brackets = inject('$bracketsApi')

const serverStatusStore = useServerStatusStore()

// ─── State ───
const isPostTournament = ref(false)
const bracketName = ref('')
const loading = ref(true) // true from the start — covers both warm-up and data fetching
const serverError = ref(false)
const breakdownDescription = ref('')
const comparisonStats = ref(null)

const bracketId = route.query.id

const formattedDescription = computed(() => {
  return (breakdownDescription.value || '').replace(/\n/g, '<br>')
})

// ─── Data Loading ───
// All comparison + prompt + OpenAI logic now lives server-side. The client
// just asks for the breakdown by id and renders what comes back.
const getBreakdown = async () => {
  loading.value = true
  try {
    // Override the default 8s bracketsApi timeout: a first-time breakdown
    // blocks on an OpenAI call, which can take longer than 8s.
    const { data } = await $brackets.get(`/breakdown?id=${bracketId}`, { timeout: 30000 })
    // content may be null if the AI recap couldn't be generated; stats still render.
    breakdownDescription.value = data.content || ''
    comparisonStats.value = data.stats
    isPostTournament.value = data.isPostTournament
    bracketName.value = data.bracketName
  } catch (err) {
    console.error('Error generating breakdown:', err)
    // Hard failure (server/network) — no stats to show either.
    comparisonStats.value = null
    breakdownDescription.value = ''
  }
  loading.value = false
}

// ─── Lifecycle ───
onMounted(() => {
  // loading starts true — spinner shows immediately regardless of path below

  if (serverStatusStore.bracketsReady) {
    getBreakdown()
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
          getBreakdown()
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