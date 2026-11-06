<template>
  <div class="dashboard">
    <!-- Status strip -->
    <div class="status-strip">
      <v-card class="status-tile">
        <p class="eyebrow my-0">{{ nextField.year }} field</p>
        <p class="status-value my-0">{{ nextField.headline }}</p>
        <p class="status-note my-0">{{ nextField.note }}</p>
      </v-card>
      <v-card class="status-tile">
        <p class="eyebrow my-0">Credits</p>
        <p class="status-value my-0">
          <template v-if="credits === null">Checking</template>
          <template v-else>{{ credits }} {{ credits === 1 ? 'bracket' : 'brackets' }} left</template>
        </p>
        <p class="status-note my-0">
          <router-link to="/payment" class="status-link">Add credits</router-link>
          <template v-if="credits === 0"> to build your next bracket.</template>
          <template v-else> any time. One credit builds one bracket.</template>
        </p>
      </v-card>
      <v-card class="status-tile">
        <p class="eyebrow my-0">Your brackets</p>
        <p class="status-value my-0">{{ brackets.length }} built</p>
        <p class="status-note my-0">
          <template v-if="bracketYears.length">Across {{ bracketYears.join(', ') }}.</template>
          <template v-else>None yet. The first one is one click away.</template>
        </p>
      </v-card>
    </div>

    <div class="dashboard-body">
      <section class="brackets">
        <div class="section-head">
          <div>
            <h1>My brackets</h1>
            <p class="text-muted my-0 section-sub">Every bracket you have built, newest first.</p>
          </div>
          <div class="section-actions">
            <v-btn v-if="isAdmin" variant="outlined" color="secondary" :to="{ name: 'Admin' }">Tournament admin</v-btn>
            <v-btn color="primary" @click="pickRoute">Build a bracket</v-btn>
          </div>
        </div>

        <div class="card-grid">
          <v-card v-for="item in bracketCards" :key="item.id" class="bracket-card">
            <div class="card-head">
              <div class="card-title">
                <h2>{{ item.name || '(unnamed)' }}</h2>
                <p class="text-muted my-0 card-meta">{{ item.year }} · built {{ item.createdLabel }}</p>
              </div>
              <v-chip v-if="item.upsetCount" size="small" variant="tonal" color="success">
                {{ item.upsetCount }} {{ item.upsetCount === 1 ? 'upset' : 'upsets' }}
              </v-chip>
            </div>

            <TeamRow v-bind="item.champion" champ/>

            <div class="final-four">
              <p class="eyebrow my-0">Final Four</p>
              <div class="chip-row">
                <span v-for="team in item.finalFour" :key="team.seedKey" class="team-chip">
                  <span class="chip-seed">{{ team.seedKey.slice(1) }}</span>{{ team.name }}
                </span>
                <span v-if="!item.finalFour.length" class="text-muted">Not played yet</span>
              </div>
            </div>

            <div class="card-actions">
              <v-btn size="small" color="primary" variant="tonal" :to="{ name: 'Bracket', query: { id: item.id } }">
                View bracket
              </v-btn>
              <v-btn size="small" variant="outlined" color="secondary" :to="{ name: 'Breakdown', query: { id: item.id } }">
                Breakdown
              </v-btn>
            </div>
          </v-card>

          <button type="button" class="new-card" @click="pickRoute">
            <span class="new-plus">+</span>
            <span class="new-title">New bracket</span>
            <span class="text-muted new-note">
              <template v-if="credits === 0">You are out of credits. Add some and build the next one.</template>
              <template v-else-if="credits === null">Name it, pick a team to boost, and let Buster run the field.</template>
              <template v-else>You have {{ credits }} {{ credits === 1 ? 'credit' : 'credits' }}. Name it, pick a team to boost, and let Buster run the field.</template>
            </span>
          </button>
        </div>
      </section>

      <aside class="news">
        <v-card class="news-card">
          <div class="news-head">
            <h2>NCAA news</h2>
          </div>
          <div v-if="loadingNews" class="text-center py-6">
            <v-progress-circular indeterminate size="24" color="primary" class="mb-2"></v-progress-circular>
            <p class="text-muted my-0">Loading articles...</p>
          </div>
          <div v-else-if="newsArticles.length" class="news-list">
            <a
              v-for="article in newsArticles"
              :key="article.link"
              :href="article.link"
              target="_blank"
              rel="noopener"
              class="news-item"
            >
              <span class="news-title">{{ article.title }}</span>
              <span class="news-snippet">{{ article.snippet }}</span>
              <span class="news-meta">
                {{ article.source }}
                <template v-if="article.publishedAt"> · {{ timeAgo(article.publishedAt) }}</template>
              </span>
            </a>
          </div>
          <p v-else class="text-muted my-0">No news articles available.</p>
        </v-card>
      </aside>
    </div>
  </div>
</template>

<script setup>
import TeamRow from '@/components/bracket/TeamRow.vue'
import { useUserStore } from '@/store/user'
import { buildBracketModel } from '@/utils/bracketModel'
import { baseTeamNames, formatTeamTitle } from '@/utils/bracketStruc'
import { selectionSunday } from '@/utils/tournamentDates'
import moment from 'moment'
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const isAdmin = computed(() => userStore.isAdmin)

// ─── State ───
const brackets = ref([])
const teamsByYear = ref({})       // { 2026: { e1: 'Duke', ... } }
const credits = ref(null)         // null until /get-user answers
const fieldYears = ref([])        // years that have tournament data
const loadingNews = ref(true)
const newsArticles = ref([])

// ─── Next field ───
// After the championship (first Monday in April at the latest) the next
// tournament is next year's.
const nextField = computed(() => {
  const today = moment()
  const year = today.month() >= 4 ? today.year() + 1 : today.year()
  const sunday = moment(selectionSunday(year))
  const days = sunday.diff(today.startOf('day'), 'days')
  if (fieldYears.value.includes(year)) {
    return { year, headline: 'The field is set', note: 'Team boosts are live in the builder.' }
  }
  if (days > 0) {
    return {
      year,
      headline: `Selection Sunday in ${days} ${days === 1 ? 'day' : 'days'}`,
      note: `Team boosts unlock when the field is announced, ${sunday.format('MMM D')}.`,
    }
  }
  return { year, headline: 'Selection Sunday has passed', note: 'The field will appear here once it is entered.' }
})

// ─── Bracket cards ───
const teamNameFor = (year) => (seedKey) => formatTeamTitle(seedKey, teamsByYear.value[year] || baseTeamNames)

const bracketCards = computed(() =>
  brackets.value.map((item) => {
    const model = buildBracketModel(item.bracket || {}, teamNameFor(item.year))
    return {
      id: item.id,
      name: item.name,
      year: item.year,
      createdLabel: moment(item.createdAt).format('MMM D, YYYY'),
      champion: model.champion,
      finalFour: model.finalFour,
      upsetCount: model.upsetCount,
    }
  })
)

const bracketYears = computed(() => [...new Set(brackets.value.map((item) => item.year))].sort())

// ─── Lifecycle ───
onMounted(async () => {
  fetchCredits()
  await Promise.all([fetchUserBrackets(), fetchNewsArticles(), fetchFieldYears()])
})

// ─── Fetches ───
const fetchUserBrackets = async () => {
  try {
    const { data } = await $brackets.get(`get-user-brackets?id=${user.value._id}`)
    brackets.value = data
      .map((brack) => ({
        id: brack._id,
        name: brack.name,
        createdAt: brack.createdAt,
        year: Number(String(brack.createdAt).slice(0, 4)),
        bracket: brack.bracket,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    await Promise.all(bracketYears.value.map(loadTeamsForYear))
  } catch (error) {
    console.error('Failed to fetch brackets:', error)
  }
}

const loadTeamsForYear = async (year) => {
  if (teamsByYear.value[year]) return
  try {
    const { data } = await $brackets.get(`/tournament-data?year=${year}`)
    teamsByYear.value = { ...teamsByYear.value, [year]: data.teams }
  } catch {
    // No tournament data for that year: cards fall back to "East 1 Seed" names.
  }
}

const fetchFieldYears = async () => {
  try {
    const { data } = await $brackets.get('/tournament-data/years')
    fieldYears.value = (data.years || []).map(Number)
  } catch (error) {
    console.error('Failed to fetch tournament years:', error)
  }
}

const fetchCredits = async () => {
  try {
    const { data } = await $users.get(`/get-user?id=${user.value._id}`)
    credits.value = Number(data.credits) || 0
  } catch (error) {
    console.error('Failed to fetch credits:', error)
  }
}

const fetchNewsArticles = async () => {
  loadingNews.value = true
  try {
    const { data } = await $brackets.get('/news')
    newsArticles.value = data
  } catch (error) {
    console.error('Failed to fetch news articles:', error)
    newsArticles.value = []
  } finally {
    loadingNews.value = false
  }
}

function timeAgo(date) {
  return moment(date).fromNow()
}

const pickRoute = async () => {
  try {
    const { data } = await $users.get(`/get-user?id=${user.value._id}`)
    if (data.credits === 0) {
      router.push('/payment')
    } else {
      router.push('/builder')
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ─── Status strip ─── */
.status-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.status-tile {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-value {
  font-family: var(--bb-font-display);
  font-weight: 700;
  font-size: 26px;
  line-height: 1;
  text-transform: uppercase;
}

.status-note {
  font-size: 13px;
  color: var(--bb-muted);
}

.status-link {
  color: var(--bb-ball);
  font-weight: 600;
  text-decoration: none;
}

.status-link:hover {
  color: var(--bb-gold);
}

/* ─── Body ─── */
.dashboard-body {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}

.brackets {
  flex: 999 1 560px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 16px;
}

.section-sub {
  margin-top: 6px;
  font-size: 13px;
}

.section-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.bracket-card {
  padding: 18px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.card-title {
  min-width: 0;
}

.card-title h2 {
  font-size: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  margin-top: 4px;
  font-size: 12px;
}

.final-four {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
}

.team-chip {
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.chip-seed {
  color: var(--bb-muted);
  margin-right: 4px;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--bb-line);
}

.new-card {
  min-height: 240px;
  padding: 18px;
  border: 1px dashed var(--bb-line-strong);
  border-radius: 8px;
  background: transparent;
  color: var(--bb-paper);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  text-align: left;
  cursor: pointer;
}

.new-card:hover {
  border-color: var(--bb-ball);
}

.new-plus {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--bb-ball-tint);
  color: var(--bb-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--bb-font-display);
  font-weight: 800;
  font-size: 26px;
}

.new-title {
  font-family: var(--bb-font-display);
  font-weight: 700;
  font-size: 24px;
  line-height: 1;
  text-transform: uppercase;
}

.new-note {
  font-size: 13px;
  line-height: 1.5;
}

/* ─── News ─── */
.news {
  flex: 1 1 320px;
  max-width: 380px;
  min-width: 0;
}

.news-card {
  padding: 18px;
}

.news-head {
  margin-bottom: 6px;
}

.news-head h2 {
  font-size: 24px;
}

.news-list {
  display: flex;
  flex-direction: column;
}

.news-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 0;
  border-top: 1px solid var(--bb-line);
  text-decoration: none;
  color: var(--bb-paper);
}

.news-item:first-child {
  border-top: 0;
}

.news-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
}

.news-item:hover .news-title {
  color: var(--bb-ball);
}

.news-snippet {
  font-size: 13px;
  line-height: 1.4;
  color: var(--bb-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--bb-muted);
}

@media (max-width: 900px) {
  .status-strip {
    grid-template-columns: 1fr;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .news {
    max-width: none;
  }
}
</style>
