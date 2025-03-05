<template>
    <div class="title-card">
        <h2>{{user.name}}'s bracket made {{ bracketReturned.createdAt }}</h2>
        <h4>Champion: {{ findActualName(champion) }}</h4>
    </div>
    <hr>
    <div class="bracket-display">
        <v-select
            label="Select a Region"
            class="mb-4"
            v-model="selectedRegion"
            :items="regions"
            item-title="title"
            item-value="value"
        ></v-select>
        <div class="display-section" v-if="selectedRegion==='east'">
            <!-- Region Champion is bracketEast[13] in this scenario -->
            <div class="region-champ">
                <p>Region Champion:</p>
                <v-card class="matchup-card">
                    {{ findActualName(bracketFinalFour[0]) }}
                </v-card>
            </div>
            <div class="bracket-region">

                <!-- Round of 64 (16 seeds → 8 matchups) -->
                <div class="round round-of-64">
                    <div
                        class="matchup"
                        v-for="(pair, matchIndex) in chunkArray(startingBracketEast, 2)"
                        :key="'east-r64-' + matchIndex"
                    >
                        <!-- Each 'pair' is [e1, e16], for example -->
                        <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Round of 32 (winners from bracketEast[0..7]) -->
                <div class="round round-of-32">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketEast.slice(16, 24), 2)"
                        :key="'east-r32-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Sweet 16 (winners from bracketEast[8..11]) -->
                <div class="round sweet-16">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketEast.slice(24, 28), 2)"
                        :key="'east-s16-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Elite 8 (winners from bracketEast[12..13]) -->
                <div class="round elite-8">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketEast.slice(28,30), 1)"
                        :key="'east-e8-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

            </div>
        </div>
        <div v-else-if="selectedRegion==='west'">
            <div class="region-champ">
                <p>Region Champion:</p>
                <v-card class="matchup-card">
                    {{ findActualName(bracketFinalFour[1]) }}
                </v-card>
            </div>
            <div class="bracket-region">

                <!-- Round of 64 (16 seeds → 8 matchups) -->
                <div class="round round-of-64">
                    <div
                        class="matchup"
                        v-for="(pair, matchIndex) in chunkArray(startingBracketWest, 2)"
                        :key="'west-r64-' + matchIndex"
                    >
                        <!-- Each 'pair' is [e1, e16], for example -->
                        <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Round of 32 (winners from bracketEast[0..7]) -->
                <div class="round round-of-32">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketWest.slice(16, 24), 2)"
                        :key="'west-r32-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Sweet 16 (winners from bracketEast[8..11]) -->
                <div class="round sweet-16">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketWest.slice(24, 28), 2)"
                        :key="'west-s16-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Elite 8 (winners from bracketEast[12..13]) -->
                <div class="round elite-8">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketWest.slice(28,30), 1)"
                        :key="'west-e8-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="selectedRegion==='midwest'">
            <div class="region-champ">
                <p>Region Champion:</p>
                <v-card class="matchup-card">
                    {{ findActualName(bracketFinalFour[1]) }}
                </v-card>
            </div>
            <div class="bracket-region">

                <!-- Round of 64 (16 seeds → 8 matchups) -->
                <div class="round round-of-64">
                    <div
                        class="matchup"
                        v-for="(pair, matchIndex) in chunkArray(startingBracketMidwest, 2)"
                        :key="'midwest-r64-' + matchIndex"
                    >
                        <!-- Each 'pair' is [e1, e16], for example -->
                        <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Round of 32 (winners from bracketEast[0..7]) -->
                <div class="round round-of-32">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketMidwest.slice(16, 24), 2)"
                        :key="'midwest-r32-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Sweet 16 (winners from bracketEast[8..11]) -->
                <div class="round sweet-16">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketMidwest.slice(24, 28), 2)"
                        :key="'midwest-s16-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                <!-- Elite 8 (winners from bracketEast[12..13]) -->
                <div class="round elite-8">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketMidwest.slice(28,30), 1)"
                        :key="'midwest-e8-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="selectedRegion==='south'">
            <div class="region-champ">
                <p>Region Champion:</p>
                <v-card class="matchup-card">
                    {{ findActualName(bracketFinalFour[1]) }}
                </v-card>
            </div>
            <div class="bracket-region">

                
                <div class="round round-of-64">
                    <div
                        class="matchup"
                        v-for="(pair, matchIndex) in chunkArray(startingBracketSouth, 2)"
                        :key="'south-r64-' + matchIndex"
                    >
                        
                        <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

                
                <div class="round round-of-32">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketSouth.slice(16, 24), 2)"
                        :key="'south-r32-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

               
                <div class="round sweet-16">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketSouth.slice(24, 28), 2)"
                        :key="'south-s16-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>

               
                <div class="round elite-8">
                    <div
                        class="matchup"
                        v-for="(pair, idx) in chunkArray(bracketSouth.slice(28,30), 1)"
                        :key="'south-e8-' + idx"
                    >
                    <v-card
                        v-for="team in pair"
                        :key="team"
                        class="matchup-card"
                        >
                        {{ findActualName(team) }}
                        </v-card>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="selectedRegion==='finalFour'">
            <div class="round final-4">
                <div
                class="matchup"
                v-for="(pair, idx) in chunkArray(finalFour.slice(0,4), 2)"
                :key="'finalFour-s16-' + idx"
                >
                <v-card
                    v-for="team in pair"
                    :key="team"
                    class="matchup-card"
                >
                    {{ findActualName(team) }}
                </v-card>
                </div>
            </div>

            <div class="round finals">
                <div
                class="matchup"
                v-for="(pair, idx) in chunkArray(bracketSouth.slice(4,6), 1)"
                :key="'finalFour-e8-' + idx"
                >
                <v-card
                    v-for="team in pair"
                    :key="team"
                    class="matchup-card"
                >
                    {{ findActualName(team) }}
                </v-card>
                </div>
            </div>
            </div>
    </div>
</template>

<script setup>
/* Imports */
import { ref, onMounted, inject } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
const route = useRoute();
const router = useRouter();

const bracketId = route.query.id;
const editable = route.query.editable;

/* Inject your bracket & toast APIs if desired */
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

/* Pull user info from store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const regions = ref([
  {value: "west", title: 'West'},
  {value: "east", title: 'East'},
  {value: "south", title: 'South'},
  {value: "midwest", title: 'Midwest'},
  {value: "finalFour", title: 'Final Four'},
]);

const bracketNames = {
  // EAST (e1–e16)
  e1: "East Eagles",
  e2: "East Lions",
  e3: "East Huskies",
  e4: "East Bulldogs",
  e5: "East Warriors",
  e6: "East Cougars",
  e7: "East Tigers",
  e8: "East Bulls",
  e9: "East Owls",
  e10: "East Hawks",
  e11: "East Knights",
  e12: "East Cardinals",
  e13: "East Wolves",
  e14: "East Bears",
  e15: "East Spartans",
  e16: "East Gators",

  // WEST (w1–w16)
  w1: "West Eagles",
  w2: "West Lions",
  w3: "West Huskies",
  w4: "West Bulldogs",
  w5: "West Warriors",
  w6: "West Cougars",
  w7: "West Tigers",
  w8: "West Bulls",
  w9: "West Owls",
  w10: "West Hawks",
  w11: "West Knights",
  w12: "West Cardinals",
  w13: "West Wolves",
  w14: "West Bears",
  w15: "West Spartans",
  w16: "West Gators",

  // MIDWEST (m1–m16)
  m1: "Midwest Eagles",
  m2: "Midwest Lions",
  m3: "Midwest Huskies",
  m4: "Midwest Bulldogs",
  m5: "Midwest Warriors",
  m6: "Midwest Cougars",
  m7: "Midwest Tigers",
  m8: "Midwest Bulls",
  m9: "Midwest Owls",
  m10: "Midwest Hawks",
  m11: "Midwest Knights",
  m12: "Midwest Cardinals",
  m13: "Midwest Wolves",
  m14: "Midwest Bears",
  m15: "Midwest Spartans",
  m16: "Midwest Gators",

  // SOUTH (s1–s16)
  s1: "South Eagles",
  s2: "South Lions",
  s3: "South Huskies",
  s4: "South Bulldogs",
  s5: "South Warriors",
  s6: "South Cougars",
  s7: "South Tigers",
  s8: "South Bulls",
  s9: "South Owls",
  s10: "South Hawks",
  s11: "South Knights",
  s12: "South Cardinals",
  s13: "South Wolves",
  s14: "South Bears",
  s15: "South Spartans",
  s16: "South Gators",
};

const startingBracketEast = ["e1", "e16", "e8", "e9", "e5", "e12", "e4", "e13", "e6", "e11", "e3", "e14", "e7", "e10", "e2", "e15"]
const startingBracketWest = ["w1", "w16", "w8", "w9", "w5", "w12", "w4", "w13", "w6", "w11", "w3", "w14", "w7", "w10", "w2", "w15"]
const startingBracketMidwest = ["m1", "m16", "m8", "m9", "m5", "m12", "m4", "m13", "m6", "m11", "m3", "m14", "m7", "m10", "m2", "m15"]
const startingBracketSouth = ["s1", "s16", "s8", "s9", "s5", "s12", "s4", "s13", "s6", "s11", "s3", "s14", "s7", "s10", "s2", "s15"]

const bracketReturned = ref({})
const selectedRegion = ref("east")

const htmlBracket = ref(["e1", "e8", "e5", "e4", "e6", "e3", "e7", "e2", "e1", "e5", "e6", "e2", "e1", "e2", "w1", "w8", "w5", "w4", "w6", "w3", "w7", "w2", "w1", "w5", "w6", "w2", "w1", "w2", "m1", "m8", "m5", "m4", "m6", "m3", "m7", "m2", "m1", "m5", "m6", "m2", "m1", "m2", "s1", "s8", "s5", "s4", "s6", "s3", "s7", "s2", "s1", "s5", "s6", "s2", "s1", "s2", "e1", "w1", "m1", "s1", "e1", "s1", "e1"])
const htmlBracketCopy = ref([])



const bracketEast = ref(["e1", "e8", "e5", "e4", "e6", "e3", "e7", "e2", "e1", "e5", "e6", "e2", "e1", "e2"])
const bracketWest = ref(["w1", "w8", "w5", "w4", "w6", "w3", "w7", "w2", "w1", "w5", "w6", "w2", "w1", "w2"])
const bracketMidwest = ref(["m1", "m8", "m5", "m4", "m6", "m3", "m7", "m2", "m1", "m5", "m6", "m2", "m1", "m2"])
const bracketSouth = ref(["s1", "s8", "s5", "s4", "s6", "s3", "s7", "s2", "s1", "s5", "s6", "s2", "s1", "s2"])
const bracketFinalFour= ref(["e1", "w1", "m1", "s1", "e1", "s1"])
const champion = ref("e1")

// const getBracket = () => {
//     htmlBracketCopy.value = new Array(...htmlBracket.value)

//     let bracketToChop = new Array(...htmlBracket.value)
//     bracketEast.value = startingBracketEast.concat(bracketToChop.slice(0, 14))
//     bracketWest.value = startingBracketWest.concat(bracketToChop.slice(0, 14))
//     bracketMidwest.value = startingBracketMidwest.concat(bracketToChop.slice(0, 14))
//     bracketSouth.value = startingBracketSouth.concat(bracketToChop.slice(0, 14))
//     champion.value = bracketToChop.pop()
    
// }

const getBracket = async () => {
    try {
        response = await $brackets.get(`get-bracket?id=${bracketId}`)
        bracketReturned.value = response.data

        if(editable===true){
            htmlBracket.value = bracketReturned.value.offshootBracket
            htmlBracketCopy.value = new Array(...htmlBracket.value)
        }else{
            htmlBracket.value = bracketReturned.value.bracket
        }

        bracketToChop = new Array(...htmlBracket.value)
        bracketEast.value = startingBracketEast.concat(bracketToChop.slice(0, 14))
        bracketWest.value = startingBracketWest.concat(bracketToChop.slice(0, 14))
        bracketMidWest.value = startingBracketMidwest.concat(bracketToChop.slice(0, 14))
        bracketSouth.value = startingBracketSouth.concat(bracketToChop.slice(0, 14))
        champion.value = bracketToChop.pop()
    } catch (error) {
        console.error(error)
    }
}

const findActualName = (seedString) =>{
    return bracketNames[seedString] || seedString
}

function chunkArray(array, chunkSize) {
  const results = []
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize))
  }
  return results
}

onMounted(async () => {
  await getBracket()
});
// onMounted(() => {
//   getBracket()
// });
</script>

<style>
.display-section{
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.bracket-display {
  margin: 2rem auto;
  max-width: 1200px; /* keep bracket content centered within a max width */
}

/* The overall container holding the four rounds in a row */
.bracket-region {
  display: flex;
  align-items: stretch;
  justify-content: start;
  gap: 3rem; /* space between each round's column */
  position: relative;
}

/* Each round is a column. */
.round {
  display: flex;
  flex-direction: column;
  align-items: start;
  position: relative;
}

/* Each matchup is stacked vertically with some spacing. */
.matchup {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

/* Style the actual team cards. */
.matchup-card {
  margin: 0.25rem 0;
  min-width: 130px;
  text-align: center;
  font-weight: 500;
  /* You can also style the v-card itself with additional props, e.g. "outlined", etc. */
}

/* Let's give v-card a bit more styling or spacing if you like: */
.v-card {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 3px rgba(0,0,0,0.1);
}

/* Example for a connecting line to the left of each 'matchup' 
   (like a bracket tree trunk). Adjust as you see fit. */
.matchup::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 50%;
  width: 1.5rem;
  height: 2px;
  background: #ccc;
  transform: translateY(-50%);
}

.round-of-64 .matchup::before {
  content: none;
}

.round-of-32 {
  justify-content: space-around !important;
}

.sweet-16 {
  justify-content: space-around !important;
}

.elite-8 {
  justify-content: space-around !important;
}

/* Some optional text styling for the region champion row: */
.region-champ {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  text-align: center;
  margin-bottom: 4rem;
}
.region-champ p {
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 1.1rem;
}
</style>