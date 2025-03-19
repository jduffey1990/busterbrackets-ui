<template>
    <div class="title-card">
        <div class="title-heading">
            <h2>
                <span class="user-name">{{ user.name }}</span>'s bracket builder
            </h2>
        </div>
    </div>

    <div>
      <div v-if="yearHasBracket">
          <v-autocomplete
              v-model="selectedTeam"
              :items="teamsThisYear"
              label="Select Your Team If you want to increase their odds"
              chips
              clear-on-select
              class="autocomplete"
          ></v-autocomplete>
          <p class="small mb-10">The team you choose will receive a benefit if you please.</p>
          <div v-if="selectedTeam.length">
            <v-select
                label="Select a handicap to help your team against opponents"
                class="autocomplete"
                v-model="addedBenefit"
                :items="benefitLevels"
                item-title="title"
                item-value="value"
            ></v-select>
            <div class="paratool">
            <p class="small mb-6">The percentage is not an overall percentage.  
            </p>
            <v-tooltip
                text="It is an added chance each round to pass the opposing team.  Win chances can't go over 100, and 100% means that your team will win the bracket automation. A 9 seed team with a 40% chance of winning and a 10% increase will have a 50% chance of winning that round"
                location="top"
            >
              <template v-slot:activator="{ props }">
                <v-icon
                    v-bind="props"
                    small
                    color="grayblue"
                    class="icon">mdi-information
                </v-icon>
              </template>
            </v-tooltip>
          </div>
            
          </div>
      </div>
      <div v-else class="blurred">
        <div class="blurred-overlay">
          There is not a bracket officially released for this year.  If you would like to increase a specific team's odds, please wait until the bracket is released.
        </div>
        <div class="blur-me">
          <v-autocomplete
            v-model="selectedTeam"
            :items="teamsThisYear"
            label="Select Your Team If you want to increase their odds"
            chips
            closable-chips
            clear-on-select
            class="autocomplete"
          ></v-autocomplete>
          <p class="small mb-6">The team you choose will receive a benefit if you please.</p>
          <v-select
              label="Select a handicap to help your team against opponents"
              v-model="addedBenefit"
              :items="benefitLevels"
              item-title="title"
              item-value="value"
              class="autocomplete"
          ></v-select>
          <p class="small mb-6">The percentage is not an overall percentage.  It is an added chance each round to pass the opposing team.  
            Win chances can't go over 100, and 100% means that your team will win the bracket automation.
          </p>
        </div>
      </div>
    </div>
    <hr class="mb-10">
    <div class="centered">

      <v-text-field v-model="newBracket.name" label="Name Your Bracket" width="400" class="mb-6"></v-text-field>
  
      <v-btn @click="createBracket" color="warning" class="mb-10">Create Bracket Now!</v-btn>

      <!-- Display sections based on processing status -->
      <div class="bracket-status" v-if="eastDisplay">
        <p>East bracket processing complete!</p>
      </div>
      <div class="bracket-status" v-if="westDisplay">
        <p>West bracket processing complete!</p>
      </div>
      <div class="bracket-status" v-if="southDisplay">
        <p>South bracket processing complete!</p>
      </div>
      <div class="bracket-status" v-if="midwestDisplay">
        <p>Midwest bracket processing complete!</p>
      </div>
      <div class="bracket-status" v-if="finalsDisplay">
        <p>Finals bracket processing complete!</p>
      </div>
      
      <div class="disclaimer">
        <p class="small">
          Our bracket simulation assigns a “favored” team in each matchup based on seed differences and user-selected odds adjustments, then runs a caluculation to decide who advances. We repeat this process round by round until we have winners from each region, culminating in a final showdown. This approach reflects a powerful, but fun, weighted die roll (1's versus 16's is historically far from a toss up for example).  We
          select out historical matchups that have under 20 meetings due to skewed results, and use a matchup gradient instead.
        </p>
        <br />
        <p class="small">
          All predictions, projections, and suggestions provided on this website are for entertainment purposes only. We do not guarantee the accuracy or outcome of any bracket, and we cannot be held liable for any financial losses, wagering issues, or other damages incurred by following these picks or strategies. By using Buster Brackets, you acknowledge that all final decisions are your own and agree to hold Buster Brackets and its creators harmless for any results or consequences thereof.
        </p>
      </div>

    </div>
    
    
</template>

<script setup>
/* Imports */
import { ref, onMounted, inject, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
const route = useRoute();
const router = useRouter();
import moment from 'moment'
const {show} = inject('toast');

/* util functions and other static bracket info */
import { bracketNames, recordsOver20, fixRecords } from '@/utils/bracketStruc';

/* Get the correct year's bracket */
const timeNow = new Date()
const yearNowString = String(timeNow.getFullYear()) 
const yearHasBracket = computed(()=> {
  return bracketNames[yearNowString] !== undefined
})


/* params to pick the right bracket from the backend */
const bracketId = route.query.id;
const editable = route.query.editable;

/* Inject your bracket & toast APIs if desired */
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

/* Pull user info from store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
/* bracket starters by region*/
const startingBracketEast = ["e1", "e16", "e8", "e9", "e5", "e12", "e4", "e13", "e6", "e11", "e3", "e14", "e7", "e10", "e2", "e15"]
const startingBracketWest = ["w1", "w16", "w8", "w9", "w5", "w12", "w4", "w13", "w6", "w11", "w3", "w14", "w7", "w10", "w2", "w15"]
const startingBracketMidwest = ["m1", "m16", "m8", "m9", "m5", "m12", "m4", "m13", "m6", "m11", "m3", "m14", "m7", "m10", "m2", "m15"]
const startingBracketSouth = ["s1", "s16", "s8", "s9", "s5", "s12", "s4", "s13", "s6", "s11", "s3", "s14", "s7", "s10", "s2", "s15"]
const startingFinalFour = ref([])

/* ending bracket stuff*/
const eastDisplay = ref(false)
const westDisplay = ref(false)
const southDisplay = ref(false)
const midwestDisplay = ref(false)
const finalsDisplay = ref(false)


/* ending bracket stuff*/
const bracketEast = ref([])
const bracketWest = ref([])
const bracketMidwest = ref([])
const bracketSouth = ref([])
const bracketFinalFour= ref([])
const bracketToSend = ref([])
const champion = ref()
/* get actual decimal odds*/
const oddsTable = fixRecords(recordsOver20)

/* User input stuff*/
const selectedTeam = ref("")
const teamsThisYear = ref([])
const addedBenefit = ref(0)
const benefitLevels = ref([
  {value: 0, title: 'None, Why did I select a team at all?'},
  {value: 3, title: "3% - I'm modest, what can I say?"},
  {value: 5, title: '5% - Puts a little more fight in the underdogs.'},
  {value: 10, title: '10% - A 10% swing can be a boon!'},
  {value: 25, title: '25% - Close matchups are close no more!'},
  {value: 50, title: '50% - Like bringing a gun to a knife fight.'},
  {value: 80, title: '80% - Only the lowest seeds can still have odds against them with this'},
  {value: 100, title: '100% - Just build my team a championship, bub.'},
]);

const newBracket = ref({
  name: "",
  bracket: [],
  userId: user.value._id
})


/* functions!*/
const round = (region = [], regionStr = "") => {
    if(region.length === 1){
        startingFinalFour.value.push(region[0])
        return region
    }
    
    for(let i = 0; i <= region.length - 2; i++){
        let j = i+1
        let favored = 0
        let notFavored = 0


        let slicedFirst = parseInt(region[i].slice(1, region[i].length))
        let slicedSecond = parseInt(region[j].slice(1, region[j].length))

        if(slicedFirst < slicedSecond){
            favored = slicedFirst
            notFavored = slicedSecond
        }
        else{
            favored = slicedSecond
            notFavored = slicedFirst
        }
        let matchup = favored.toString() + "vs" + notFavored.toString()
        
        let odd = getOdds(matchup, favored, notFavored)

        // if the user added a different percentage favorite
        if(selectedTeam.value !== ""){
          odd = checkOddForAlterations(favored, notFavored, odd, regionStr)
        }

        //my goofy odds maker that I like
        let over = new Array(odd).fill("win")
        let under = new Array(100-odd).fill("lose")
        let totalOdds = over.concat(under)
        let pick = Math.floor(Math.random() * 100)
        let result = totalOdds[pick]

        //have to add back the letters for the final saving of the brackets
        let revampedFavored = addBack(favored, regionStr)
        let revampedUnfavored = addBack(notFavored, regionStr)

        if(result === "win"){
            region.splice(region.indexOf(revampedUnfavored), 1)
        }
        else{
            region.splice(region.indexOf(revampedFavored), 1)
        }
    }
    addRegionBrackets(region, regionStr)
    return round(region, regionStr)    
}

function finalsFunction(teams){
  if(teams.length === 1){
        champion.value = teams[0].seed
        return teams
    }

  for (let i = 0; i <= teams.length - 2; i++) {
      let team1 = teams[i];
      let team2 = teams[i + 1];
      let favored, notFavored;

      let slicedFirst = parseInt(team1.seed.slice(1, team1.seed.length))
      let slicedSecond = parseInt(team2.seed.slice(1, team2.seed.length))

      if (slicedFirst < slicedSecond) {
          favored = { seed: slicedFirst, region: team1.region };
          notFavored = { seed: slicedSecond, region: team2.region };
      } else {
          favored = { seed: slicedSecond, region: team2.region };
          notFavored = { seed: slicedFirst, region: team1.region };
      }

      let matchup = `${favored.seed}vs${notFavored.seed}`;

      let odd = getOdds(matchup, favored, notFavored)

      if(selectedTeam.value !== ""){
        odd = checkFinalOddForAlterations(favored, notFavored, odd)
      }

      let revampedFavored = addBack(favored.seed, favored.region)
      let revampedUnfavored = addBack(notFavored.seed, notFavored.region)
      let teamsArray = teams.map((team)=> team.seed)

      let result = Math.random() < (odd / 100) ? "win" : "lose";
      if (result === "win") {
          teams.splice(teamsArray.indexOf(revampedUnfavored), 1);
      } else {
          teams.splice(teamsArray.indexOf(revampedFavored), 1);
      }
  }  
  for(let team of teams){
    bracketFinalFour.value.push(team.seed)
  }
  finalsFunction(teams);
  return teams[0]; // Return the winner for external use if needed
}


const getOdds = (matchup, favored, notFavored) => {
  if(oddsTable.has(matchup)){
          return oddsTable.get(matchup)
      }else if((notFavored - favored) < 3){
          return 60
      }else if((notFavored - favored) < 6){
          return 65
      }
      else if((notFavored - favored) < 9){
          return 75
      }
      else if((notFavored - favored) < 12){
          return 80
      }
      else{
          return 85
      }
}


const checkOddForAlterations = (favored, notFavored, odd, regionStr) =>{ 
  let favoredStr = addBack(favored, regionStr)
  let unfavoredStr = addBack(notFavored, regionStr)
  if(selectedTeam.value === bracketNames[yearNowString][favoredStr]){
    if(addedBenefit.value === 100 || (odd + addedBenefit.value) >= 100){
      return 100
    }else{
      return odd + addedBenefit.value
    }
  }else if(selectedTeam.value === bracketNames[yearNowString][unfavoredStr]){
    if(addedBenefit.value === 100 || (odd - addedBenefit.value) <= 0){
      return 0
    }else{
      return odd - addedBenefit.value
    }
  }
  else return odd
}

const checkFinalOddForAlterations = (favored, notFavored, odd) =>{ 
  let favoredStr = addBack(favored.seed, favored.region)
  let unfavoredStr = addBack(notFavored.seed, notFavored.region)

  if(selectedTeam.value === bracketNames[yearNowString][favoredStr]){
    if(addedBenefit.value === 100 || (odd + addedBenefit.value) >= 100){
      return 100
    }else{
      return odd + addedBenefit.value
    }
  }else if(selectedTeam.value === bracketNames[yearNowString][unfavoredStr]){
    if(addedBenefit.value === 100 || (odd - addedBenefit.value) <= 0){
      return 0
    }else{
      return odd - addedBenefit.value
    }
  }
  else return odd
}

const addBack = (num, regionStr) => {
    if(regionStr === "east"){
        return "e" + num.toString()
    }
    else if(regionStr === "west"){
        return "w" + num.toString()
    }
    else if(regionStr === "south"){
        return "s" + num.toString()
    }
    else{
        return "m" + num.toString()
    }
}

const addRegionBrackets = (bracket = [], regionStr = "") => {
  if (regionStr === "east") {
    bracketEast.value = bracketEast.value.concat(bracket);
  } else if (regionStr === "west") {
    bracketWest.value = bracketWest.value.concat(bracket);
  } else if (regionStr === "south") {
    bracketSouth.value = bracketSouth.value.concat(bracket);
  } else {
    bracketMidwest.value = bracketMidwest.value.concat(bracket);
  }
};


const makeNamesArray = () =>{
  let short = bracketNames[yearNowString]
  for(let key in short){
    teamsThisYear.value.push(short[key])
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createBracket = async () => {
  // Process East bracket and display its status
  round(startingBracketEast, "east");
  eastDisplay.value = true;
  await sleep(2000); // Delay 1 second

  // Process Midwest bracket and display its status
  round(startingBracketMidwest, "midwest");
  midwestDisplay.value = true;
  await sleep(2000);

  // Process South bracket and display its status
  round(startingBracketSouth, "south");
  southDisplay.value = true;
  await sleep(2000);

  // Process West bracket and display its status
  round(startingBracketWest, "west");
  westDisplay.value = true;
  await sleep(2000);

  // Get winners from each region
  const eastWinner = bracketEast.value.pop();
  const westWinner = bracketWest.value.pop();
  const southWinner = bracketSouth.value.pop();
  const midwestWinner = bracketMidwest.value.pop();

  let final4 = [
    { seed: eastWinner, region: 'east' },
    { seed: midwestWinner, region: 'midwest' },
    { seed: southWinner, region: 'south' },
    { seed: westWinner, region: 'west' }
  ];
  // Concatenate the final four bracket
  bracketFinalFour.value = bracketFinalFour.value.concat(startingFinalFour.value);
  
  // Process finals and show final bracket display
  finalsFunction(final4);
  finalsDisplay.value = true;
  await sleep(1000);

  // Final processing before sending the bracket
  bracketFinalFour.value.pop();
  bracketToSend.value = bracketToSend.value.concat(bracketEast.value);
  bracketToSend.value = bracketToSend.value.concat(bracketMidwest.value);
  bracketToSend.value = bracketToSend.value.concat(bracketSouth.value);
  bracketToSend.value = bracketToSend.value.concat(bracketWest.value);
  
  
  bracketToSend.value = bracketToSend.value.concat(bracketFinalFour.value);
  bracketToSend.value.push(champion.value);

  newBracket.value.bracket = bracketToSend.value;
  submitNewBracket();
};

const submitNewBracket = async () => {

  try {
    const response = await $brackets.post('/create-bracket', newBracket.value);
    if (response.status === 200) {
      decrementCredits()
    }
  } catch (error) {
    console.error(error)
  }
};

const decrementCredits = async () => {

try {
  const response = await $users.patch('/decrement-credits');
  if (response.status === 200) {
    show({message: 'Thanks for creating a bracket with us. You will be redirected to your dashboard to view your bracket.'});
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  }
} catch (error) {
    console.error(error)
}
  }

onMounted(async () => {
  makeNamesArray()
});

</script>

<style scoped>
.title-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* A subtle gradient “trophy” effect */
  background: linear-gradient(
  245deg, 
  #FF6801 0%, 
  #FFB278 50%, 
  #fffcee 100%
);
  border: 2px solid #e6cc80;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.title-heading h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #444;
}

.paratool {
  display: flex;
  flex-direction: row;
}

.user-name {
  color: #423f3b; /* “Trophy gold” accent */
}

.blurred {
  position: relative; /* So the overlay can position itself over .blur-me */
  padding: 1rem;
}

/* The container of the inputs we want to blur/disable */
.blur-me {
  filter: blur(3px);
  pointer-events: none; 
  /* This prevents clicks/focus in the blurred section */
  opacity: 1; 
  /* Optional: slight transparency if you like */
}

/* The overlay text that remains clear and readable above the blur */
.blurred-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  /* Light background behind your text, so it’s clearly visible 
     against the blurred content beneath */
  background: rgba(255, 255, 255, 0.5);

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: bold;
  padding: 4rem;
  box-sizing: border-box;
  z-index: 1;
}

.autocomplete {
  width: 500px;
}

.centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.bracket-status {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  padding: 1rem;
  margin: 0.5rem 0;
  text-align: center;
  font-weight: bold;
}

.disclaimer {
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: lighter;
  padding: 1.5rem;
  box-sizing: border-box;
  z-index: 1;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
@media only screen and (max-width: 700px) {
  
}

</style>