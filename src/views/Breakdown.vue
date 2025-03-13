<template>
    <div class="bracket-breakdown-container">
      <!-- Heading text -->
      <h2 class="text-h4 mt-2 title">
        <!-- subheader describing post- vs. pre-tournament -->
        <span v-if="isPostTournament">Post-Tournament Breakdown</span>
        <span v-else>Pre-Tournament Breakdown</span>
      </h2>
  
      <!-- Explanation or subheader -->
      <p class="subtitle">
        Here’s a detailed look at how your bracket is shaping up.  Now for your breakdown, presented by ur AI-sportscaster Buster Brackets!:
      </p>
      <div class="social">
      <span style="font-size: xx-large; text-align: center;">Share Us!</span>
         <div class="social-icons" style="font-size: xx-large;">
          <!-- <v-btn icon @click="shareToInstagramStories" target="_blank">
            <v-icon size="30">mdi-instagram</v-icon>
          </v-btn> -->
          <v-btn icon class="ml-3" href="https://www.facebook.com/sharer/sharer.php?u=https://busterbrackets.com&quote=I%20just%20built%20my%20tournament%20bracket%20with%20Buster%20Brackets!" target="_blank">
            <v-icon size="30">mdi-facebook</v-icon>
          </v-btn>
          <v-btn class="ml-3" icon href="https://twitter.com/intent/tweet?text=I%20just%20built%20my%20tournament%20bracket%20with%20Buster%20Brackets:%20https%3A%2F%2Fbusterbrackets.com" target="_blank">
            <v-icon size="30">mdi-twitter</v-icon>
          </v-btn>
         </div>
        </div>
  
      <!-- Loading state -->
      <div v-if="loading" class="text-center mt-4">
        <v-progress-linear
          color="primary"
          indeterminate
          class="mb-2"
        />
        <div class="text-h4">Loading...</div>
      </div>
  
      <!-- Typewriter effect when loading is done -->
      <div v-else class="matchup-card mt-6">
        <TypewriterText :fullText="breakdownDescription" />
      </div>
    </div>
  </template>

<script setup>
/* Imports */
import { ref, onMounted, onUnmounted, inject, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
const route = useRoute();
const router = useRouter();
import moment from 'moment'
import { bracketNames, bracketFinalYears } from '@/utils/bracketStruc';
import TypewriterText from '@/components/TypewriterText.vue'

//Time and bracketr insert management
const timeNow = new Date()
const yearNowString = String(timeNow.getFullYear()) 
const yearBracketString = ref("")
const yearHasBracketNames = computed(()=> {
  return bracketNames[yearBracketString.value] !== undefined
})
const checkBracketYear = (item) => {
  let bracketYearStr = item.createdAt.slice(0,4)
  return bracketFinalYears[bracketYearStr] !== undefined
}

const bracketId = route.query.id;
const loading = ref(false)

/* Inject your bracket & toast APIs if desired */
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')
import axios from 'axios';

/* Pull user info from store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// bracket document downloaded ffrom the internet
const bracketReturned = ref({})
const selectedRegion = ref("east")

// either the main or offshoot bracket depending on what was clicked
const htmlBracket = ref([])
const htmlBracketCopy = ref([])
const isPostTournament = ref(false)

const getBracket = async () => {
    try {
        const response = await $brackets.get(`get-bracket?id=${bracketId}`)
        bracketReturned.value = response.data

        htmlBracket.value = bracketReturned.value.bracket
        yearBracketString.value = bracketReturned.value.createdAt.slice(0,4)
        
        let bracketToChop = new Array(...htmlBracket.value)
    } catch (error) {
        console.error(error)
    }
}

function compareBrackets(officialBracket, userBracket) {
  let correctPicks = 0
  let upsets = []

  for (let i = 0; i < officialBracket.length; i++) {
    if (officialBracket[i] === userBracket[i]) {
      correctPicks++
    } else {
      // Example: determine if user picked an underdog
      const officialSeed = Number(officialBracket[i].replace(/\D/, ''))  // e.g., "e12" -> 12
      const userSeed = Number(userBracket[i].replace(/\D/, ''))
      if (userSeed > officialSeed) {
        upsets.push(userBracket[i]) // user picked a bigger number (higher seed = underdog)
      }
    }
  }

  return {
    correctPicks,
    totalGames: officialBracket.length,
    upsets
  }
}

function buildPrompt(
  officialBracket,
  userBracket,
  comparison,
  yearBracketString,
  bracketNames
) {
  const { correctPicks, totalGames, upsets } = comparison;
  
  // Convert bracketNames object to a string so the LLM sees the data
  const bracketNamesJson = JSON.stringify(bracketNames, null, 2);

  if (isPostTournament.value) {
    return `
      resulting real bracket: ${officialBracket}
      user's bracket generated before the tourny: ${userBracket}

      The user had ${correctPicks} correct picks out of ${totalGames}. 
      They predicted the following underdogs: ${upsets.join(", ")}.

      Map values like "e1" to bracketNames[${yearBracketString}] 
      bracketNames JSON:
      ${bracketNamesJson}

      Please write a short (three paragraph max), sportscaster-style summary without copyright infringment describing:
      1. The overall performance compared to the real results.
      2. Two notable upsets they picked correctly (two sentences max) either:
          a. big underdog (seed over 12)
          b. appear multiple times in the upset array
    `;
  } else {
    return `
      benchmark, no-upset bracket: ${officialBracket}
      user's bracket: ${userBracket}

      The user bracket picks seeds that differ from the standard favorites 
      in these spots: ${upsets.join(", ")}.

      Map values like "e1" to bracketNames[${yearBracketString}] if exists, else bracketNames["base"]
      bracketNames JSON:
      ${bracketNamesJson}

      Please write a short (three paragraph max), sportscaster-style preview without copyright infringment describing:
      1. Two notable upsets they picked compared to benchmark (two sentences max) either:
          a. big underdog wins (seed 12 or more)
          b. appear multiple times in the upset array
      2. Bracket winner (two sentences max)
      3. Remember that the tournament hasn't actually happened, yet, so these are prospective picks.
      4. Do not halucinate past years results or storylines
    `;
  }
}


async function buildLlmDescription(prompt) {
    const openAIURL = 'https://api.openai.com/v1/chat/completions';

    const localKey = `llmCache::${bracketReturned.value._id}`;
    const cached = localStorage.getItem(localKey);
    if (cached) {
        console.log('Returning cached LLM response from localStorage for prompt:', bracketReturned.value._id);
        return JSON.parse(cached); // stored as JSON
    }
  

    try {
    if(window.location.origin === "http://localhost:4000"){
        const response = {
            data: `
            Welcome, sports fans, to the thrilling prelude of the tournament season! We’re diving into a unique bracket filled with intriguing upset picks that could turn convention on its head this year. Let's break down the key aspects of this user’s bold choices and what we might see unfold.

            1. **Big Upset Picks**: This user has a knack for taking the road less traveled with picks like e12 and e13, which consistently challenge the convention of the higher seeds. Notably, we have a potential clash brewing with w12 and w9, both looking to dethrone their more favored opponents. Additionally, keep an eye on s11—these teams are a common breeding ground for surprises and have a history of delivering jaw-dropping moments when the pressure is on.

            2. **Potential Storylines**: If these upsets come to fruition, we could witness some thrilling narratives. Imagine a Cinderella story unfolding with the w12 advancing deep into the tournament, sparking conversations about the underdog mentality and resilience. With e12 and e13 pulling off surprises, we would also likely see the drama of elite teams facing early eliminations, leading to heated debates about team depth and coaching strategies, as well as the ever-popular "Did they overlook their opponent?" storyline.

            3. **Overall Bracket-Building Strategy**: This user's approach seems to be rooted in an underdog philosophy, banking on the unpredictable nature of the tournament. By selecting lower-seeded teams in critical matchups, they are clearly leaning into the chaos that often defines this time of year. It appears they believe that the tournament is won not just by the favorites but by those hungry teams ready to seize the moment and rewrite their narratives against the odds.

            As the tournament draws near, keep your eye on how these selections pan out—because in the world of sports, anything can happen!
            `
            };
        userStore.setCachedResponse(bracketReturned.value._id, response.data);
        localStorage.setItem(localKey, JSON.stringify(response.data));
        return response.data
    }else{
        // Make a POST request using axios
        const response = await axios.post(
            openAIURL,
            {
            // The data payload (JSON body),
            // matching your curl command
            model: 'gpt-4o-mini', 
            store: true,
            messages: [
                { role: 'user', content: prompt }
            ]
            },
            {
            // HTTP headers
            headers: {
                'Content-Type': 'application/json',
                // Grab your secret from an environment variable (Vite style)
                'Authorization': `Bearer ${import.meta.env.VITE_GPT_API_KEY}`
            }
            }
        );
        userStore.setCachedResponse(bracketReturned.value._id, response.data.choices[0].message.content);
        localStorage.setItem(localKey, JSON.stringify(response.data.choices[0].message.content));
        return response.data.choices[0].message.content;
    }

    } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error; // or return a fallback
    }
}

const shareToInstagramStories = () => {
  window.location.href = 'instagram-stories://share';
}


const breakdownDescription = ref("")

const getBreakdown = async () => {
    loading.value = true
  // bracket's year exists in bracketFinalYears
  isPostTournament.value = checkBracketYear(bracketReturned.value)
  
  // 2. Decide which official bracket we use
  const officialBracket = isPostTournament.value 
    ? bracketFinalYears[yearBracketString.value] 
    : bracketFinalYears["base"]

  // 3. Compare the official bracket vs. user's bracket
  const comparison = compareBrackets(officialBracket, htmlBracket.value)

  // 4. Build a prompt for the LLM
  const prompt = buildPrompt(officialBracket, htmlBracket.value, comparison, yearBracketString.value, bracketNames)

  // 5. Get the LLM-based bracket description
  breakdownDescription.value = await buildLlmDescription(prompt)
  loading.value = false
}

const formatStringName = (seedString = "") =>{
    let regionStr = seedString.slice(0,1)
    let seed = seedString.slice(1,seedString.length)

    if(regionStr === "e"){
        return "East " + seed
    }
    else if(regionStr === "w"){
        return "West" + seed
    }
    else if(regionStr === "s"){
        return "South " + seed
    }
    else{
        return "Midwest " + seed
    }
}

onMounted(async () => {
  await getBracket()
  await getBreakdown()
});

</script>

<style scoped>
.bracket-breakdown-container {
  max-width: 600px;
  margin: 0 auto;
  display:flex;
  flex-direction:column;
  justify-content:left;
  align-items:center;
}

.social {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  text-align: center;
}

.subtitle {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  font-size: large;
  text-align: center;
}

.matchup-card {
  padding:2px 10px;
  width: 900px;
  font-weight: 500;
  /* You can also style the v-card itself with additional props, e.g. "outlined", etc. */
}

@media only screen and (max-width: 700px) {
  .matchup-card {
    width:600px
  }
}
</style>