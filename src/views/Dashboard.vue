<template>
  <div class="px-4 py-6">
    <!-- Dashboard Title & Build Button -->
    <div class="table-title">
      <h2 class="dashboard-title">My Dashboard</h2>
      <v-btn color="warning" class="build-bracket-btn" @click="pickRoute">
        Build a Bracket
      </v-btn>
    </div>

    <!-- Admin link (only visible to admins) -->
    <v-btn
      v-if="isAdmin"
      color="primary"
      variant="outlined"
      class="mb-4"
      @click="$router.push('/admin')"
    >
      Tournament Admin
    </v-btn>

    <v-row>
      <!-- Brackets Table -->
      <v-col cols="12" lg="7">
        <v-card class="card" elevation="0">
          <v-card-title class="card-head">
            <v-icon color="warning" class="mr-2">mdi-tournament</v-icon>
            My Brackets
          </v-card-title>

          <!-- Server warming up -->
          <div v-if="serverStatusStore.bracketsChecking" class="text-center pa-6">
            <v-progress-circular indeterminate color="warning" class="mb-2"></v-progress-circular>
            <p class="text-body-2 text-medium-emphasis">Warming up the brackets server, hang tight...</p>
          </div>

          <!-- Server failed to wake -->
          <div v-else-if="serverStatusStore.bracketsError" class="text-center pa-6">
            <v-icon color="error" size="32" class="mb-2">mdi-server-off</v-icon>
            <p class="text-body-1 text-error">Could not reach the brackets server.</p>
            <p class="text-body-2 text-medium-emphasis">Please refresh the page to try again.</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="!brackets.length" class="text-center pa-8">
            <v-icon size="40" class="mb-2 empty-icon">mdi-tournament</v-icon>
            <p class="text-body-1 mb-1">No brackets yet.</p>
            <p class="text-body-2 text-medium-emphasis mb-4">Build your first one and see how far it goes.</p>
            <v-btn color="warning" @click="pickRoute">Build a Bracket</v-btn>
          </div>

          <!-- Ready -->
          <v-data-table
            v-else
            :headers="bracketHeaders"
            :items="brackets"
            item-value="id"
          >
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            <template v-slot:item.name="{ item }">
              <v-btn variant="text" @click="goToBracket(item)">
                {{ item.name || '(unnamed)' }}
              </v-btn>
            </template>
            <template v-slot:item.breakdown="{ item }">
              <v-btn size="small" color="warning" @click="goToBreakdown(item)">
                Breakdown
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- News Section -->
      <v-col cols="12" lg="5">
        <v-card class="card" elevation="0">
          <v-card-title class="card-head">
            <v-icon color="warning" class="mr-2">mdi-newspaper-variant-outline</v-icon>
            NCAA News
          </v-card-title>
          <v-card-text class="pt-1">
            <div v-if="loadingNews" class="text-center py-6">
              <v-progress-circular indeterminate size="24" color="warning" class="mb-2"></v-progress-circular>
              <p class="text-body-2 text-medium-emphasis mb-0">Loading articles...</p>
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
                <p class="news-title">{{ article.title }}</p>
                <p class="news-snippet">{{ article.snippet }}</p>
                <p class="news-meta">
                  {{ article.source }}
                  <template v-if="article.publishedAt"> · {{ timeAgo(article.publishedAt) }}</template>
                </p>
              </a>
            </div>
            <p v-else class="text-medium-emphasis">No news articles available.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { useServerStatusStore } from '@/store/serverStatus'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import moment from 'moment'

const router = useRouter()

const { show } = inject('toast')
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

const userStore = useUserStore()
const serverStatusStore = useServerStatusStore()
const { user } = storeToRefs(userStore)
const isAdmin = computed(() => userStore.isAdmin)

// ─── State ───
const brackets = ref([])
const loadingNews = ref(true)
const newsArticles = ref([])

const bracketHeaders = [
  { title: 'Bracket Name', value: 'name' },
  { title: 'Created On', value: 'createdAt' },
  { title: 'Bracket Breakdown', value: 'breakdown' },
]

// ─── Lifecycle ───
onMounted(async () => {
  // If server is already confirmed live (e.g. navigating back to dashboard
  // mid-session), fetch immediately. Otherwise watch for the flag to flip.
  if (serverStatusStore.bracketsReady) {
    await Promise.all([fetchUserBrackets(), fetchNewsArticles()])
  } else {
    const unwatch = watch(
      () => serverStatusStore.bracketsReady,
      async (ready) => {
        if (ready) {
          unwatch()
          await Promise.all([fetchUserBrackets(), fetchNewsArticles()])
        }
      }
    )
  }
})

// ─── Fetch user brackets ───
const fetchUserBrackets = async () => {
  try {
    const { data } = await $brackets.get(`get-user-brackets?id=${user.value._id}`)
    data.forEach((brack) => {
      const oGBracket = {
        name: brack.name,
        createdAt: brack.createdAt,
        updatedAt: 'N/A (original bracket creation)',
        id: brack._id,
      }
      brackets.value.push(oGBracket)
    })
    brackets.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Failed to fetch brackets:', error)
  }
}

const goToBracket = (item) => {
  router.push({ name: 'Bracket', query: { id: item.id } })
}

const goToBreakdown = (item) => {
  router.push({ name: 'Breakdown', query: { id: item.id } })
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

function formatDate(date) {
  if (!date) return ''
  if (date === 'N/A (original bracket creation)') return date
  return moment(date).format('MMM DD, YYYY - HH:mm')
}

function timeAgo(date) {
  return moment(date).fromNow()
}

const pickRoute = async () => {
  try {
    let response = await $users.get(`/get-user?id=${user.value._id}`)
    let userReturned = response.data
    if (userReturned.credits === 0) {
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
.card-head {
  display: flex;
  align-items: center;
  padding-top: 16px;
}

.empty-icon {
  color: rgba(7, 21, 42, 0.4);
}

.news-list {
  display: flex;
  flex-direction: column;
}

.news-item {
  display: block;
  text-decoration: none;
  padding: 10px 12px;
  margin: 0 -12px;
  border-radius: 10px;
  transition: background-color 0.15s ease;
}

.news-item:hover {
  background-color: rgba(255, 255, 255, 0.45);
}

.news-item + .news-item {
  border-top: 1px solid rgba(7, 21, 42, 0.08);
}

.news-title {
  font-size: 14px;
  font-weight: 600;
  color: #07152a;
  line-height: 1.35;
  margin: 0 0 2px;
}

.news-item:hover .news-title {
  color: #ff6801;
}

.news-snippet {
  font-size: 13px;
  color: rgba(7, 21, 42, 0.75);
  line-height: 1.4;
  margin: 0 0 4px;
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
  color: rgba(7, 21, 42, 0.5);
  margin: 0;
}

.dashboard-title {
  font-weight: 600;
  text-align: start;
}
.build-bracket-btn {
  min-width: 200px;
  margin-left: 1rem;
}
.table-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding-bottom: 10px;
}
@media (max-width: 700px) {
  .dashboard-title { text-align: center; }
  .elevation-1 { font-size: x-small; }
  .elevation-1 .v-btn { font-size: 7px; padding: 3px; }
  .build-bracket-btn { font-size: 7px; min-width: 0; width: 100px !important; }
}
</style>