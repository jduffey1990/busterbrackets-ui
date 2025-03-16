<template>
    <div v-show="screenWidthBig === false">
        <div class="title-card">
            <div class="title-heading">
                <h2>
                    <span class="user-name">{{ user.name }}</span>'s {{bracketReturned.name}}
                    <small class="created-at"> (Created {{ formatDate(bracketReturned.createdAt) }})</small>
                </h2>
            </div>
            <div class="champion-banner">
            <div class="champion-title">National Champion:</div>
            <div class="champion-name">{{ yearHasBracket ? formatTitleName(champion) : formatStringName(champion)}}</div>
            </div>
            <div class="mt-4">
                <h4>PDF Download only available on desktop</h4>
            <div class="mt-4">
                <PDFBuilder :mobile="false"/>
            </div>  
            </div>
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
                    {{ yearHasBracket ? formatTitleName(bracketsemifinals[0]) : formatStringName(bracketsemifinals[0])}}
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

                <!-- succulent 16 (winners from bracketEast[8..11]) -->
                <div class="round succulent-16">
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

                <!-- hateful 8 (winners from bracketEast[12..13]) -->
                <div class="round hateful-8">
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

            </div>
        </div>
        <div v-else-if="selectedRegion==='west'">
            <div class="region-champ">
                <p>Region Champion:</p>
                <v-card class="matchup-card">
                    {{ yearHasBracket ? formatTitleName(bracketsemifinals[1]) : formatStringName(bracketsemifinals[1])}}
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

                <!-- succulent 16 (winners from bracketEast[8..11]) -->
                <div class="round succulent-16">
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

                <!-- hateful 8 (winners from bracketEast[12..13]) -->
                <div class="round hateful-8">
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="selectedRegion==='midwest'">
            <div class="region-champ">
                <p>Region Champion:</p>
                <v-card class="matchup-card">
                    {{ yearHasBracket ? formatTitleName(bracketsemifinals[3]) : formatStringName(bracketsemifinals[3])}}
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

                <!-- succulent 16 (winners from bracketEast[8..11]) -->
                <div class="round succulent-16">
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

                <!-- hateful 8 (winners from bracketEast[12..13]) -->
                <div class="round hateful-8">
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="selectedRegion==='south'">
            <div class="region-champ">
                <p>Region Champion:</p>
                <v-card class="matchup-card">
                    {{ yearHasBracket ? formatTitleName(bracketsemifinals[2]) : formatStringName(bracketsemifinals[2])}}
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

               
                <div class="round succulent-16">
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>

               
                <div class="round hateful-8">
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
                        {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                        </v-card>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="selectedRegion==='semifinals'">
            <div class="region-champ">
                <p>National Champion:</p>
                <v-card class="matchup-card">
                    {{ yearHasBracket ? formatTitleName(champion) : formatStringName(champion)}}
                </v-card>
            </div>
            <div class="bracket-region">

            <div class="round semifinals-4">
                <div
                class="matchup"
                v-for="(pair, idx) in chunkArray(bracketsemifinals.slice(0,4), 2)"
                :key="'semifinals-s16-' + idx"
                >
                <v-card
                    v-for="team in pair"
                    :key="team"
                    class="matchup-card"
                >
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                </v-card>
                </div>
            </div>

            <div class="round finals">
                <div
                class="matchup"
                v-for="(pair, idx) in chunkArray(bracketsemifinals.slice(4,6), 2)"
                :key="'semifinals-e8-' + idx"
                >
                <v-card
                    v-for="team in pair"
                    :key="team"
                    class="matchup-card"
                >
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team)}}
                </v-card>
                </div>
            </div>
            </div>
        </div>
    </div>
</div>

    <!--for full screen or pdf builder-->
<div id="pdf-generator" :class="{
      // If small screen, push it offscreen, so it's not visible to the user
      'offscreen-pdf': !screenWidthBig
    }">
    <!-- Title, heading, champion banner, etc. -->
    <div class="title-card">
    <div class="title-heading">
        <h2>
        <span class="user-name">{{ user.name }}</span>'s {{ bracketReturned.name }}
        <small class="created-at">
            (Created {{ formatDate(bracketReturned.createdAt) }})
        </small>
        </h2>
    </div>
    <div class="champion-banner">
        <div class="champion-title">National Champion:</div>
        <div class="champion-name">
        {{ yearHasBracket ? formatTitleName(champion) : formatStringName(champion) }}
        </div>
    </div>
    <div class="mt-4">
        <PDFBuilder :mobile="true"/>
    </div>
    </div>
    <div class="big-background">
<div class="lower-section semifinals-four-region mb-6">
  <h3>Semifinals</h3>

  <div class="bracket-region" style="justify-content: center;">
    <div class="round semifinals-4">
      <div
        class="matchup"
        v-for="(pair, idx) in chunkArray(bracketsemifinals.slice(0,4), 2)"
        :key="'semifinals-s16-' + idx"
      >
        <v-card
          v-for="team in pair"
          :key="team"
          class="matchup-card"
        >
          {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
        </v-card>
      </div>
    </div>

    <div class="round finals">
      <div
        class="matchup"
        v-for="(pair, idx) in chunkArray(bracketsemifinals.slice(4,6), 2)"
        :key="'semifinals-e8-' + idx"
      >
        <v-card
          v-for="team in pair"
          :key="team"
          class="matchup-card"
        >
          {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
        </v-card>
      </div>
    </div>
  </div>
</div>
    <!-- The bracket layout with multiple columns/rows -->
    <div class="upper-section">
    <!-- Left side: East, West (or whichever two you want on the left) -->
    <div class="left-regions">

        <!-- East Region -->
        <div class="display-section east-region">
        <h3>East Region</h3>
        <div class="bracket-region">
            <!-- Round of 64 -->
            <div class="round round-of-64">
            <div
                class="matchup"
                v-for="(pair, matchIndex) in chunkArray(startingBracketEast, 2)"
                :key="'east-r64-' + matchIndex"
            >
                <v-card
                v-for="team in pair"
                :key="team"
                class="matchup-card"
                >
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- Round of 32 -->
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- succulent 16 -->
            <div class="round succulent-16">
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- hateful 8 -->
            <div class="round hateful-8">
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
        </div>
        </div>

        <!-- West Region -->
        <div class="display-section west-region">
        <h3>West Region</h3>
        <div class="bracket-region">
            <!-- Round of 64 -->
            <div class="round round-of-64">
            <div
                class="matchup"
                v-for="(pair, matchIndex) in chunkArray(startingBracketWest, 2)"
                :key="'west-r64-' + matchIndex"
            >
                <v-card
                v-for="team in pair"
                :key="team"
                class="matchup-card"
                >
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- Round of 32 -->
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- succulent 16 -->
            <div class="round succulent-16">
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- hateful 8 -->
            <div class="round hateful-8">
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
        </div>
        </div>

    </div>

    <!-- Right side: South, Midwest -->
    <div class="right-regions">

        <!-- South Region -->
        <div class="display-section south-region">
        <h3>South Region</h3>
        <!-- Region champion, bracket rounds, etc. -->
        <div class="bracket-region">
            <!-- hateful 8 -->
            <div class="round hateful-8">
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- succulent 16 -->
            <div class="round succulent-16">
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- Round of 32 -->
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- Round of 64 -->
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
        </div>
        </div>

        <!-- Midwest Region -->
        <div class="display-section midwest-region">
        <h3>Midwest Region</h3>
        <!-- Region champion, bracket rounds, etc. -->
        <div class="bracket-region">
             <!-- hateful 8 -->
            <div class="round hateful-8">
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- succulent 16 -->
            <div class="round succulent-16">
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- Round of 32 -->
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
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            <!-- Round of 64 -->
            <div class="round round-of-64">
            <div
                class="matchup"
                v-for="(pair, matchIndex) in chunkArray(startingBracketMidwest, 2)"
                :key="'midwest-r64-' + matchIndex"
            >
                <v-card
                v-for="team in pair"
                :key="team"
                class="matchup-card"
                >
                {{ yearHasBracket ? formatTeamName(team) : formatStringName(team) }}
                </v-card>
            </div>
            </div>
            
            
        </div>
        </div>
    </div>

  </div>
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
import { bracketNames } from '@/utils/bracketStruc';
import PDFBuilder from '@/components/PDFBuilder.vue'

//Time and bracketr insert management
const timeNow = new Date()
const yearNowString = String(timeNow.getFullYear()) 
const yearBracketString = ref("")
const yearHasBracket = computed(()=> {
  return bracketNames[yearBracketString.value] !== undefined
})
const checkBracketYear = (item) => {
  let bracketYearStr = item.createdAt.slice(0,4)
  return bracketFinalYears[bracketYearStr] !== undefined
}


const bracketId = route.query.id;
const editable = route.query.editable;

/* Inject your bracket & toast APIs if desired */
const $brackets = inject('$bracketsApi')
const $users = inject('$usersApi')

/* Pull user info from store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const regions = ref([
  {value: "east", title: 'East'},
  {value: "west", title: 'West'},
  {value: "south", title: 'South'},
  {value: "midwest", title: 'Midwest'},
  {value: "semifinals", title: 'semifinals'},
]);

//these are stable.  They are not saved with the backend data to keep costs down
const startingBracketEast = ["e1", "e16", "e8", "e9", "e5", "e12", "e4", "e13", "e6", "e11", "e3", "e14", "e7", "e10", "e2", "e15"]
const startingBracketWest = ["w1", "w16", "w8", "w9", "w5", "w12", "w4", "w13", "w6", "w11", "w3", "w14", "w7", "w10", "w2", "w15"]
const startingBracketMidwest = ["m1", "m16", "m8", "m9", "m5", "m12", "m4", "m13", "m6", "m11", "m3", "m14", "m7", "m10", "m2", "m15"]
const startingBracketSouth = ["s1", "s16", "s8", "s9", "s5", "s12", "s4", "s13", "s6", "s11", "s3", "s14", "s7", "s10", "s2", "s15"]

// bracket document downloaded ffrom the internet
const bracketReturned = ref({})
const selectedRegion = ref("east")

// either the main or offshoot bracket depending on what was clicked
const htmlBracket = ref([])
const htmlBracketCopy = ref([])


//brackets to fill for UI
const bracketEast = ref([])
const bracketWest = ref([])
const bracketMidwest = ref([])
const bracketSouth = ref([])
const bracketsemifinals= ref([])
const champion = ref()



const getBracket = async () => {
    try {
        const response = await $brackets.get(`get-bracket?id=${bracketId}`)
        bracketReturned.value = response.data

        htmlBracket.value = bracketReturned.value.bracket
        yearBracketString.value = bracketReturned.value.createdAt.slice(0,4)
        
        let bracketToChop = new Array(...htmlBracket.value)
        bracketEast.value = startingBracketEast.concat(bracketToChop.slice(0, 14))
        bracketWest.value = startingBracketWest.concat(bracketToChop.slice(14, 28))
        bracketSouth.value = startingBracketMidwest.concat(bracketToChop.slice(28, 42))
        bracketMidwest.value = startingBracketSouth.concat(bracketToChop.slice(42, 56))
        bracketsemifinals.value = bracketToChop.slice(56, 62)
        champion.value = bracketToChop.pop()
    } catch (error) {
        console.error(error)
    }
}

const formatTeamName = (seedString) => {
  const yearKey = yearBracketString.value
  const teamName = bracketNames[yearKey]?.[seedString] || bracketNames["base"].seedString
  return seedString.slice(1) + ". " + teamName
}

const formatTitleName = (seedString) => {
  const yearKey = yearBracketString.value
  return bracketNames[yearKey]?.[seedString] || seedString
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



function chunkArray(array, chunkSize) {
  const results = []
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize))
  }
  return results
}


function formatDate(date) {
  if (!date) return ''
  else if(date === "N/A (original bracket creation)"){
    return date
  }
  return moment(date).format('MMM DD, YYYY')
}

const screenWidthBig = ref(window.innerWidth >= 1200)

function handleResize() {
  // 2) Set the ref based on new width
  screenWidthBig.value = window.innerWidth >= 1200
}

onMounted(async () => {
  await getBracket()
  window.addEventListener('resize', handleResize)
});


onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
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

.user-name {
  color: #c1852c; /* “Trophy gold” accent */
}

.created-at {
  font-size: 1rem;
  font-weight: 400;
  margin-left: 0.5rem;
  color: #666;
}

.champion-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 0.75rem 1.25rem;
  background: #fffef0;
  border: 2px solid #f3da94;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.12);
}

.champion-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #444;
}

.champion-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #bb9528; /* Another gold hue */
}

.display-section{
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.bracket-display {
  margin: 2rem auto;
  max-width: 1200px; /* keep bracket content centered within a max width */
  background-color: rgba(255, 255, 255, 0.2)
}

.big-background {
    background-color: rgba(255, 255, 255, 0.2)
}


/* The overall container holding the four rounds in a row */
.bracket-region {
  display: flex;
  align-items: stretch;
  justify-content: start;
  gap: 1rem;
  position: relative;
  padding-left:90px
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
  align-items: start;
  margin-bottom: 10px;
  position: relative;
}

/* Style the actual team cards. */
.matchup-card {
  margin: 0.25rem 0;
  width: 120px;
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
  font-size: 12;
  width:120px
}

/* Example for a connecting line to the right of each 'matchup' 
   (like a bracket tree trunk). Adjust as you see fit. */
.matchup::after {
  content: '';
  position: absolute;
  right: -1.2rem;
  top: 50%;
  width: 20px;
  height: 3px;
  background: #6d6d6d;
  transform: translateY(-50%);
}

.hateful-8 .matchup::after {
  content: none;
}

.finals .matchup::after {
  content: none;
}

.round-of-32 {
  justify-content: space-around !important;
}

.succulent-16 {
  justify-content: space-around !important;
}

.hateful-8 {
  justify-content: space-around !important;
}

.finals{
    align-items: center;
    justify-content: center;
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

.offscreen-pdf {
  visibility: hidden;
  position: absolute;
  top: -9999px;
  left: -9999px;
  background-color: rgba(255, 255, 255, 0.2)
  /* Possibly a fixed width/height if needed */
}

.lower-section {
    transform:translateX(-70px)
}
@media only screen and (max-width: 700px) {
  .v-card {
    padding: 0.4rem 0.1rem;
    font-size: 7px;
  }
  .matchup-card{
    min-width: none;
    width: 60px !important;
  }
  .round {
  max-width: 130px;
}

.bracket-region {
    padding-left: 20px;
}
}
@media only screen and (min-width: 1200px) {
    .bracket-pdf-container {
  /* So that html2canvas captures properly if needed */
  background-color: rgba(255, 255, 255, 0.3);
  color: #000;
  width: 100%;
  /* etc... */
}

.upper-section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-left:90px
}

.bracket-region {
    padding-left:0px
}

.left-regions, .right-regions {
  display: flex;
  flex-direction: column;
  width: 45%; /* Example widths */
}

.lower-section {
  margin-top: 2rem;
  text-align: center;
}

/* Adjust these classes as you see fit. Use your existing bracket styling: */
.display-section {
  margin-bottom: 2rem;
}

.v-card {
    padding: 0.2rem 0.1rem;
    width: 100px !important;
  }
  .matchup-card{
    min-width: none;
    width: 100px !important;
  }
  .round {
  max-width: 130px;
}

.right-regions .matchup::after{
    content: none;
}

.right-regions .matchup::before{
    content: none;
}
 .right-regions .matchup::after{
  content: '';
  position: absolute;
  left: -1rem;
  top: 50%;
  width: 20px;
  height: 3px;
  background: #6d6d6d;
  transform: translateY(-50%);
 }

 .right-regions .bracket-region {
    margin-right:0 !important;
 }

 .right-regions .hateful-8 .matchup::after {
  content: none;
}

}
</style>