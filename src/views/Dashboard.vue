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

    <!-- Brackets Table -->
    <v-card class="card mb-6" elevation="1">
      <v-data-table
        :headers="bracketHeaders"
        :items="brackets"
        class="elevation-1"
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

    <!-- News Section -->
    <v-card class="card mb-6" elevation="1">
      <v-card-title>Latest News</v-card-title>
      <v-card-text>
        <div v-if="loadingNews">
          <v-progress-circular indeterminate size="24"></v-progress-circular>
          Loading articles...
        </div>
        <div v-else-if="newsArticles.length">
          <div v-for="article in newsArticles" :key="article.link" class="mb-2">
            <a :href="article.link" target="_blank">{{ article.title }}</a>
            <p class="text-body-2">{{ article.snippet }}</p>
          </div>
        </div>
        <p v-else>No news articles available.</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import moment from 'moment'
const router = useRouter()

const { show } = inject('toast')
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const isAdmin = computed(() => userStore.isAdmin)

// ─── State ───
const currentTab = ref(0)
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
  await fetchUserBrackets()
  await fetchNewsArticles()
})

// ─── Fetch user brackets ───
const fetchUserBrackets = async () => {
  try {
    const { data } = await $brackets.get(`get-user-brackets?id=${user.value._id}`)
    data.forEach((brack) => {
      const oGBracket = {
        name: brack.name,
        createdAt: brack.createdAt,
        updatedAt: "N/A (original bracket creation)",
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
  router.push({
    name: 'Bracket',
    query: { id: item.id },
  })
}

const goToBreakdown = (item) => {
  router.push({
    name: 'Breakdown',
    query: { id: item.id },
  })
}

const fetchNewsArticles = async () => {
  loadingNews.value = true
  try {
    newsArticles.value = [
      {
        title: 'Selection Sunday Insights',
        snippet: 'Experts share their top seeds for the upcoming tournament...',
        link: 'https://www.example.com/selection-sunday'
      },
      {
        title: 'Underdog Stories That Might Surprise You',
        snippet: 'Which unranked teams have the best shot at an upset?',
        link: 'https://www.example.com/underdog-stories'
      },
    ]
  } catch (error) {
    console.error('Failed to fetch news articles:', error)
    newsArticles.value = []
  } finally {
    loadingNews.value = false
  }
}

function formatDate(date) {
  if (!date) return ''
  else if (date === "N/A (original bracket creation)") return date
  return moment(date).format('MMM DD, YYYY - HH:mm')
}

const pickRoute = async () => {
  try {
    let response = await $users.get(`/get-user?id=${user.value._id}`)
    let userReturned = response.data
    if (userReturned.credits === 0) {
      router.push("/payment")
    } else {
      router.push("/builder")
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.card {
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
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