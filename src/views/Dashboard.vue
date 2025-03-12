<template>
  <v-container fluid>

    <!-- Top section with user dashboard header -->
    <div class="top_line_dash mb-6 d-flex align-center">
      <div>
        <!-- User dashboard title displaying either full name or email -->
        <div class="text-h4 mb-2 dashboard-title">
          {{ user.name ? user.name + "'s Dashboard" : user.email + "'s Dashboard" }}
        </div>
      </div>
      <v-spacer></v-spacer>
    </div>

    <!-- Tabs for switching between brackets and news -->
    <v-tabs v-model="currentTab" background-color="primary" class="white--text">
      <v-tab>
        My Brackets
      </v-tab>
      <!-- <v-tab>
        News
      </v-tab> -->
    </v-tabs>

    <!-- Content of the selected tab -->
    <v-tabs-window v-model="currentTab" class="mt-4">
      <!-- My Brackets tab content -->
      <v-tabs-window-item>
        <v-card elevation="3" class="p-4 mt-4 card">
          <div class="d-flex justify-space-between align-center pb-4" style="background-color: whitesmoke;">
            <div class="text-h6 ml-4 mt-2">Manage Your Brackets</div>
            <v-btn
              color="warning"
              class="build-bracket-btn mt-4 mr-4"
              @click="pickRoute"
              elevation="2"
              :disabled="makeNewBracketDisabled"
            >
              {{ makeNewBracketDisabled ? "Tourney started, builder disabled" : "Build me a bracket!" }}
            </v-btn>
          </div>
          
          <!-- Table of the user's brackets -->
          <v-data-table
            :headers="bracketHeaders"
            :items="brackets"
            :items-per-page="5"
            class="elevation-1"
          >
            <!-- Define how each row looks in the table body (optional slot) -->
            <template #item.name="{ item }">
              <v-btn @click="goToBracket(item)">
              {{ item.name || 'Untitled Bracket' }}
            </v-btn>
            </template>
            <template #item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            <template #item.updatedAt="{ item }">
              {{ formatDate(item.updatedAt) }}
            </template>
            <template #item.breakdown="{ item }" v-slot:activator="{ props }">
            <v-btn @click="goToBreakdown(item)">
              {{checkBracketYear(item) ? 'Post-tourney breakdown' : 'Pre-tourny breakdown' }}
            </v-btn>
            </template>
            <!-- Provide a slot for actions or other columns if needed -->
          </v-data-table>
        </v-card>
      </v-tabs-window-item>

      <!-- News tab content -->
      <v-tabs-window-item>
        <v-card elevation="3" class="p-4">
          <div class="text-h6 mb-4">Latest College Basketball Headlines</div>
          
          <!-- If we're still loading articles, show a skeleton loader -->
          <template v-if="loadingNews">
            <v-skeleton-loader
              class="mx-auto"
              type="table"
              :loading="true"
              elevation="0"
            />
          </template>

          <template v-else>
            <div v-if="newsArticles.length === 0">
              <em>No news articles found. Check again later!</em>
            </div>
            <!-- Display articles in a list or cards -->
            <v-row v-else dense>
              <v-col
                v-for="(article, i) in newsArticles"
                :key="i"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card class="mb-4" elevation="2">
                  <v-card-title class="headline">
                    {{ article.title }}
                  </v-card-title>
                  <v-card-subtitle v-if="article.snippet">
                    {{ article.snippet }}
                  </v-card-subtitle>
                  <v-card-actions>
                    <v-btn
                      :href="article.link"
                      target="_blank"
                      color="secondary"
                      text
                    >
                      Read More
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
/* Imports */
import { ref, onMounted, watch, inject } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import moment from 'moment'
const router = useRouter()

/* Inject your bracket & toast APIs if desired */
const { show } = inject('toast')
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

/* Pull user info from store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)


/* Get the correct year's bracket */
import { bracketNames, recordsOver20, fixRecords, bracketFinalYears } from '@/utils/bracketStruc';


/* Local state */
const currentTab = ref(0)
const brackets = ref([])
const basicBrackets = ref([])
const offshootBrackets = ref([])
const loadingNews = ref(true)
const newsArticles = ref([])
const makeNewBracketDisabled = ref(false)

/* Define table headers for brackets */
const bracketHeaders = [
  { title: 'Bracket Name', value: 'name' },
  { title: 'Created On', value: 'createdAt' },
  { title: 'Last Updated', value: 'updatedAt' },
  { title: 'Bracket Breakdown', value: "breakdown" }
]

/* Lifecycle hooks */
onMounted(async () => {
  await fetchUserBrackets()
  await fetchNewsArticles()

  console.log(user)
})


/**
 * Fetch brackets for the current user
 * GET /get-user-brackets?id=<userId>
 */
const fetchUserBrackets = async () => {
  console.log("user", user.value)
  try {
    const {data} = await $brackets.get(`get-user-brackets?id=${user.value._id}`)
    console.log("here is data", data)
    data.forEach((brack) =>{
      const oGBracket = {
        name:brack.name,
        createdAt:brack.createdAt,
        updatedAt:"N/A (original bracket creation)",
        id:brack._id,
        // editable:false
      }
      // const copyBracket = {
      //   name:`copy of ${brack.name}`,
      //   createdAt:brack.createdAt,
      //   updatedAt:brack.updatedAt,
      //   id:brack._id,
      //   editable:true
      // }
      brackets.value.push(oGBracket)
      // brackets.value.push(copyBracket)
    })
  } catch (error) {
    console.error('Failed to fetch brackets:', error)
    // Optionally display a toast or alert
  }
}

const goToBracket = (item) => {
  router.push({
        name: 'Bracket',
        query: {
          id: item.id,
          // editable: item.editable
        }
      });
}

const goToBreakdown = (item) => {
  router.push({
        name: 'Breakdown',
        query: {
          id: item.id,
        }
      });
}

const checkBracketYear = (item) => {
  let bracketYearStr = item.createdAt.slice(0,4)
  return bracketFinalYears[bracketYearStr] !== undefined
}

/**
 * Fetch news articles from your external Google search or another API
 */
const fetchNewsArticles = async () => {
  loadingNews.value = true
  try {
    // Mock data for demonstration:
    // In reality, you'd do an axios/fetch call to your server endpoint 
    // that queries Google or other news sources.
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

/* Utility function to format dates in your table */
function formatDate(date) {
  if (!date) return ''
  else if(date === "N/A (original bracket creation)"){
    return date
  }
  return moment(date).format('MMM DD, YYYY')
}

const pickRoute = async ()=> {
  try {
    let response = await $users.get(`/get-user?id=${user.value._id}`);
    let userReturned = response.data
      if(userReturned.credits === 0) {
        router.push("/payment")
      }else{
        router.push("/builder")
      }
    }catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.top_line_dash {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.card {
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
}

/* Example custom style for the dashboard title */
.dashboard-title {
  font-weight: 600;
}

/* Just to show you can style the bracket build button separately */
.build-bracket-btn {
  min-width: 200px;
  margin-left: 1rem;
}
</style>
