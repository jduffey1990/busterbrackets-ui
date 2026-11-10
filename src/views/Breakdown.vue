<template>
  <div class="breakdown-page">
    <!-- Loading -->
    <div v-if="loading" class="text-center mt-10">
      <v-progress-circular indeterminate color="warning" class="mb-2"></v-progress-circular>
      <p>Analyzing your bracket...</p>
    </div>

    <div v-else-if="comparisonStats || breakdownDescription">
      <!-- Page header -->
      <div class="breakdown-header">
        <h2>{{ bracketName || 'Bracket' }}</h2>
        <v-chip
          size="small"
          variant="flat"
          :color="isPostTournament ? 'secondary' : 'warning'"
          :prepend-icon="isPostTournament ? 'mdi-flag-checkered' : 'mdi-crystal-ball'"
        >
          {{ isPostTournament ? 'Post-Tournament Analysis' : 'Preview' }}
        </v-chip>
      </div>

      <!-- Stat tiles -->
      <div v-if="comparisonStats" class="stat-row">
        <v-card v-if="isPostTournament" class="stat-tile" elevation="0">
          <v-progress-circular
            :model-value="accuracyPct"
            :size="92"
            :width="9"
            color="warning"
            bg-color="rgba(255, 255, 255, 0.12)"
          >
            <span class="ring-score">{{ comparisonStats.correctPicks }}<small>/{{ comparisonStats.totalGames }}</small></span>
          </v-progress-circular>
          <div class="stat-tile-text">
            <h4>Correct picks</h4>
            <p class="text-body-2 mb-0">{{ accuracyPct }}% of games called right</p>
          </div>
        </v-card>

        <v-card class="stat-tile" elevation="0">
          <v-icon size="40" color="warning">mdi-rocket-launch</v-icon>
          <div class="stat-tile-text">
            <h4>{{ isPostTournament ? 'Underdog picks you nailed' : 'Bold underdog picks' }}</h4>
            <div v-if="comparisonStats.upsets.length" class="upset-chips">
              <v-chip
                v-for="upset in comparisonStats.upsets"
                :key="upset"
                size="small"
                variant="flat"
                color="success"
                class="upset-chip"
              >
                {{ upset }}
              </v-chip>
            </div>
            <p v-else class="text-body-2 text-medium-emphasis mb-0">
              {{ isPostTournament
                ? 'No double-digit-seed upsets called correctly — you played it chalky.'
                : 'No big swings this time — a chalk-heavy bracket.' }}
            </p>
          </div>
        </v-card>
      </div>

      <!-- AI narrative -->
      <v-card class="narrative-card" elevation="0">
        <div class="narrative-title">
          <v-avatar color="warning" size="36">
            <v-icon>mdi-basketball</v-icon>
          </v-avatar>
          <h4>Buster's Take</h4>
        </div>
        <div v-if="breakdownDescription" class="breakdown-text" v-html="formattedDescription"></div>
        <p v-else class="text-medium-emphasis mb-0">
          The AI recap is temporarily unavailable. Your stats are above.
        </p>
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

const route = useRoute()
const $brackets = inject('$bracketsApi')

// ─── State ───
const isPostTournament = ref(false)
const bracketName = ref('')
const loading = ref(true)
const breakdownDescription = ref('')
const comparisonStats = ref(null)

const bracketId = route.query.id

const formattedDescription = computed(() => {
  return (breakdownDescription.value || '').replace(/\n/g, '<br>')
})

const accuracyPct = computed(() => {
  const stats = comparisonStats.value
  if (!stats?.totalGames) return 0
  return Math.round((stats.correctPicks / stats.totalGames) * 100)
})

// ─── Data Loading ───
// All comparison + prompt + OpenAI logic now lives server-side. The client
// just asks for the breakdown by id and renders what comes back.
const getBreakdown = async () => {
  loading.value = true
  try {
    const { data } = await $brackets.get(`/breakdown?id=${bracketId}`)
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
  getBreakdown()
})
</script>

<style scoped>
.breakdown-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 1rem;
}

.breakdown-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.breakdown-header h2 {
  margin: 0;
}

.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-tile {
  flex: 1 1 280px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
}

.stat-tile-text h4 {
  margin: 0 0 0.25rem;
  font-size: 16px;
}

.ring-score {
  font-size: 18px;
  font-weight: 700;
  color: var(--bb-paper);
}

.ring-score small {
  font-size: 12px;
  font-weight: 500;
  color: var(--bb-muted);
}

.upset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.upset-chip {
  font-weight: 600;
  height: auto;
  max-width: 100%;
  padding-top: 4px;
  padding-bottom: 4px;
  white-space: normal;
}

.upset-chip :deep(.v-chip__content) {
  white-space: normal;
}

.narrative-card {
  padding: 1.5rem 1.75rem;
}

.narrative-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.narrative-title h4 {
  margin: 0;
}

.breakdown-text {
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>
