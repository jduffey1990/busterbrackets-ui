<template>
  <div
      v-if="isSubmitting"
      class="text-center"
  >
    <v-progress-linear
        color="primary"
        indeterminate
        class="mb-2"
    ></v-progress-linear>

    <div class="text-h4">Please wait while our algorithm creates your customized portfolio.</div>
  </div>

  <div v-else>
    <div class="text-h4 mb-4">Survey</div>

    <!--this component is the survey page that advisors will either send to their clients to take alone, or they
    may take the survey with them. Updated survey re-runs the algorithm, which is our current use case to see
    changes as nothing else triggers re-run. -->
    <v-alert
        title="Advisor Survey"
        type="secondary"
        v-if="isAdvisorSurvey"
        class="mb-4"
    >You are taking this survey as an advisor. You will need to approve this
      prospect after the survey is submitted.
    </v-alert>

    <v-alert type="warning" v-if="showMultiSelectError" class="mb-4"
    >Please do not include and exclude the same company in your selections.
    </v-alert>


    <div v-if="survey" class="survey_div trans-background">
      <v-stepper v-model="currentStep">
        <template v-slot:default="{ prev, next }">
          <v-stepper-header>
            <template
                v-for="(s, i) in survey.survey_sections.map(({ name }) => name)"
            >
              <v-stepper-item
                  :value="i + 1"
                  :title="s"
                  editable
                  :edit-icon="null"
              ></v-stepper-item>
            </template>
          </v-stepper-header>


          <!--One step into the sections here. Accessing description and sub header-->
          <v-stepper-window>
            <v-stepper-window-item
                v-for="(section, i) in survey.survey_sections"
                :value="i + 1"
            >
              <v-container class="flex-container">

                <div class="eliminations-container">
                  <v-card class="eliminations-card" v-if="section.tag === 'pullYourWeeds'">
                    <v-card-title>Eliminated Companies</v-card-title>
                    <v-card-subtitle class="text-wrap">
                      Your selections have eliminated
                      <span
                          :class="{'animated-eliminations-active': numberChanging}"
                          class="animated-eliminations"
                      >
                        {{ animatedEliminations }}
                      </span>
                      companies
                    </v-card-subtitle>
                  </v-card>
                </div>

                <div
                    class="survey_header"
                    v-if="section.description"
                    v-html="section.description"
                ></div>
                <div class="justify-center">

                  <div
                      v-if="section.sub_header"
                      class="sub_header"
                      v-html="section.sub_header"
                  ></div>
                </div>
              </v-container>

              <v-container v-if="groupsWithMultiSelectBoolean(section.survey_groups) && section.tag==='pullYourWeeds'"
                           fluid
              >

                <v-row class="multi-column">
                  <v-col
                      v-for="group in groupsWithMultiSelect(section.survey_groups)"
                      :key="group.name"
                      class="multi-dropdown"
                      cols="12" md="8"
                  >
                    <!-- Loop through each question in the group -->
                    <div class="autocomplete-div">
                      <span class="my-2 text-h5" v-for="q in group.survey_questions"
                            v-html="formatLabel(q.question.text)"></span>
                      <v-autocomplete
                          v-for="q in group.survey_questions"
                          :key="q.question.id"
                          v-model="q.question.default_value"
                          :items="companies"
                          item-title="name"
                          item-value="ticker"
                          :label="q.question.text"
                          chips
                          closable-chips
                          multiple
                          clear-on-select
                          @update:model-value="updateResponse(q, section.tag)"
                          class="autocomplete"
                      >
                        <template v-slot:label>
                          <span class="auto-complete"
                                v-html="'Start typing the names of companies or tickers here'"></span>
                        </template>

                        <template v-slot:chip="{ props, item }">
                          <v-chip v-bind="props" :text="item.raw.name"></v-chip>
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item v-bind="props" :title="item.raw.name"></v-list-item>
                        </template>
                      </v-autocomplete>
                    </div>
                  </v-col>
                </v-row>
              </v-container>


              <!--Checkbox dropdowns.  Working on the different subgroups has made this not so beautiful,
              but we're getting there-->
              <v-container class="twin-columns">
                <v-row v-if="section.tag === 'aboutYou'" class="rows-center-risk">
                  <!-- First Column: Multi-select and Slider Questions -->
                  <template v-for="group in section.survey_groups" :key="group.name" class="accordion-list-center-risk">
                    <v-container class="about-container">
                      <v-col class="py-0">
                        <!-- Loop through questions in this group -->

                        <div v-for="q in group.survey_questions" :key="q.question.id" class="about-container">

                          <!-- MULTI_SELECT type question -->
                          <div class="autocomplete-invest">
                            <div class="text-h5 mt-8">
                              {{ q.question.text }}
                            </div>
                            <div v-if="multipleQFunction(q.question.tag)">
                              <v-autocomplete
                                  v-model="q.question.default_value"
                                  :items="q.question.slider_ticks"
                                  label="Multiple Responses Possible"
                                  chips
                                  closable-chips
                                  multiple
                                  @update:model-value="updateResponse(q, section.tag)"
                                  class="mt-3"
                              >
                              </v-autocomplete>
                              <v-text-field
                                  v-if="otherSelected && q.question.tag === 'interests'"
                                  v-model="pushToInterests"
                                  label="What else would you like to add?"
                                  maxlength="400"
                                  counter
                                  type="input"
                                  clearable
                                  class="mt-1"
                              ></v-text-field>
                            </div>
                            <div v-else>
                              <v-autocomplete
                                  v-model="q.question.default_value"
                                  :items="q.question.slider_ticks"
                                  label="Single Response Possible"
                                  @update:model-value="updateResponse(q, section.tag)"
                                  class="mt-3"
                                  clearable
                              >
                              </v-autocomplete>
                            </div>
                          </div>
                        </div>
                      </v-col>
                    </v-container>
                  </template>
                </v-row>
                <v-row v-else-if="section.tag === 'pullYourWeeds'" class="rows">
                  <div class="accordion-list">
                    <h5 class="text-h5 mb-1">Avoid Investing in Specific Products or Operations</h5>
                    <template v-for="group in positionExclude(section.survey_groups, 'products')"
                              :key="group.name">
                      <div class="accordion-container">
                        <div class="accordion-item">
                          <!-- Accordion Header -->
                          <div
                              class="accordion-header"
                          >
                            <div>

                              <h4
                                  class="accordion-title"
                                  @mouseover="hoveredGroup = group.name"
                                  @mouseleave="hoveredGroup = null"
                              >
                                <!-- Select All Checkbox -->
                                <v-checkbox
                                    v-if="groupContainsCheckboxes(group)"
                                    :model-value="selectAllCheck(group) || false"
                                    :indeterminate="isIndeterminate(group)"
                                    @change="toggleAllCheckboxes(group)"
                                    label=""
                                    class="mr-3"
                                ></v-checkbox>
                                <h5 class="text-h5 subtitle">{{ group.name }}</h5>
                                <v-tooltip
                                    v-if="group.tooltip && hoveredGroup === group.name"
                                    :text="group.tooltip"
                                    location="top"
                                >
                                  <template v-slot:activator="{ props }">
                                    <transition name="slide-fade">
                                      <v-icon
                                          v-if="hoveredGroup === group.name"
                                          v-bind="props"
                                          small
                                          color="grayblue"
                                          class="ml-2">mdi-information
                                      </v-icon>
                                    </transition>
                                  </template>
                                </v-tooltip>
                              </h4>
                            </div>
                            <!-- Caret Icon -->

                            <span
                                :class="{'caret': true, 'up': isActive[group.name]}"
                                @click="toggleGroup(group.name)"
                                v-if="groupLengthCheck(group)">&#9654;</span>

                          </div>


                          <div class="accordion-content" v-if="isActive[group.name]">
                            <!-- Questions List -->
                            <ul class="question-list">
                              <li
                                  v-for="q in sortValues(group.survey_questions)"
                                  :key="q.question.id"
                                  class="ml-8"
                                  @mouseover="hoveredQuestion = q.question.id"
                                  @mouseleave="hoveredQuestion = null"
                              >
                                <v-checkbox
                                    v-model="q.question.default_value"
                                    @input="updateResponse(q, section.tag)"
                                    :label="q.question.text"
                                    class="mr-3"
                                ></v-checkbox>
                                <v-tooltip
                                    v-if="q.question.tooltip && hoveredQuestion === q.question.id"
                                    :text="q.question.tooltip"
                                    location="top"
                                >
                                  <template v-slot:activator="{ props }">
                                    <v-icon
                                        v-if="hoveredQuestion === q.question.id"
                                        v-bind="props"
                                        small
                                        color="grayblue"
                                        class="icon">mdi-information
                                    </v-icon>
                                  </template>
                                </v-tooltip>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>

                  <!-- Specific industries dropdown -->
                  <div class="accordion-list">
                    <h5 class="text-h5 mb-1">Avoid Investing in Specific Industries</h5>
                    <template v-for="group in positionExclude(section.survey_groups, 'drop')"
                              :key="group.name">
                      <div class="accordion-container">
                        <div class="accordion-item">
                          <!-- Accordion Header -->
                          <div
                              class="accordion-header"
                          >
                            <div>

                              <h4
                                  class="accordion-title"
                                  @mouseover="hoveredGroup = group.name"
                                  @mouseleave="hoveredGroup = null"
                              >
                                <!-- Select All Checkbox -->
                                <v-checkbox
                                    v-if="groupContainsCheckboxes(group)"
                                    :model-value="selectAllCheck(group) || false"
                                    :indeterminate="isIndeterminate(group)"
                                    @change="toggleAllCheckboxes(group)"
                                    label=""
                                    class="mr-3"
                                ></v-checkbox>
                                <h5 class="text-h5 subtitle">{{ group.name }}</h5>
                                <v-tooltip
                                    v-if="group.tooltip && hoveredGroup === group.name"
                                    :text="group.tooltip"
                                    location="top"
                                >
                                  <template v-slot:activator="{ props }">
                                    <transition name="slide-fade">
                                      <v-icon
                                          v-if="hoveredGroup === group.name"
                                          v-bind="props"
                                          small
                                          color="grayblue"
                                          class="ml-2">mdi-information
                                      </v-icon>
                                    </transition>
                                  </template>
                                </v-tooltip>


                              </h4>
                            </div>
                            <!-- Caret Icon -->

                            <span
                                :class="{'caret': true, 'up': isActive[group.name]}"
                                @click="toggleGroup(group.name)"
                                v-if="groupLengthCheck(group)">&#9654;</span>

                          </div>


                          <div class="accordion-content" v-if="isActive[group.name]">
                            <!-- Questions List -->
                            <ul class="question-list">
                              <li
                                  v-for="q in sortValues(group.survey_questions)"
                                  :key="q.question.id"
                                  class="ml-8">
                                <v-checkbox
                                    v-model="q.question.default_value"
                                    @input="updateResponse(q, section.tag)"
                                    :label="q.question.text"
                                    class="mr-3"
                                ></v-checkbox>
                                <v-tooltip
                                    v-if="q.question.tooltip && hoveredQuestion === q.question.id"
                                    :text="q.question.tooltip"
                                    location="top"
                                >
                                  <template v-slot:activator="{ props }">
                                    <transition name="slide-fade">
                                      <v-icon
                                          v-if="hoveredQuestion === q.question.id"
                                          v-bind="props"
                                          small
                                          color="grayblue"
                                          class="ml-2">mdi-information
                                      </v-icon>
                                    </transition>
                                  </template>
                                </v-tooltip>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </template>
                    <!-- Second, dropdown list, but just the ones with single values-->
                    <template v-for="group in positionExclude(section.survey_groups, 'single')"
                              :key="group.name">
                      <div class="accordion-container">
                        <div class="accordion-item">
                          <!-- Accordion Header -->
                          <div
                              class="accordion-header"
                          >
                            <div>

                              <h4
                                  class="accordion-title"
                                  @mouseover="hoveredGroup = group.name"
                                  @mouseleave="hoveredGroup = null"
                              >
                                <!-- Select All Checkbox -->
                                <v-checkbox
                                    v-model="group.survey_questions[0].question.default_value"
                                    @input="updateResponse(group.survey_questions[0], section.tag)"
                                    label=""
                                    class="mr-3"
                                ></v-checkbox>
                                <h5 class="text-h5 subtitle">{{ group.name }}</h5>
                                <v-tooltip
                                    v-if="group.tooltip && hoveredGroup === group.name"
                                    :text="group.tooltip"
                                    location="top"
                                >
                                  <template v-slot:activator="{ props }">
                                    <transition name="slide-fade">
                                      <v-icon
                                          v-if="hoveredGroup === group.name"
                                          v-bind="props"
                                          small
                                          color="grayblue"
                                          class="ml-2">mdi-information
                                      </v-icon>
                                    </transition>
                                  </template>
                                </v-tooltip>


                              </h4>
                            </div>

                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </v-row>

                <v-row v-else-if="section.tag === 'plantYourTrees'" class="rows-center">
                  <div class="accordion-list-center">
                    <template v-for="group in positionExclude(section.survey_groups, 'values')"
                              :key="group.name">
                      <div class="accordion-container">
                        <div class="accordion-item">
                          <!-- Accordion Header -->
                          <div
                              class="accordion-header"
                          >
                            <div>

                              <h4
                                  class="accordion-title"
                                  @mouseover="hoveredGroup = group.name"
                                  @mouseleave="hoveredGroup = null"
                              >
                                <!-- Select All Checkbox -->
                                <v-checkbox
                                    v-if="groupContainsCheckboxes(group)"
                                    :model-value="selectAllCheck(group) || false"
                                    :indeterminate="isIndeterminate(group)"
                                    @change="toggleAllCheckboxes(group)"
                                    label=""
                                    class="mr-3"
                                ></v-checkbox>
                                <h5 class="text-h5 subtitle">{{ group.name }}</h5>
                                <v-tooltip
                                    v-if="group.tooltip && hoveredGroup === group.name"
                                    :text="group.tooltip"
                                    location="top"
                                >
                                  <template v-slot:activator="{ props }">
                                    <transition name="slide-fade">
                                      <v-icon
                                          v-if="hoveredGroup === group.name"
                                          v-bind="props"
                                          small
                                          color="grayblue"
                                          class="ml-2">mdi-information
                                      </v-icon>
                                    </transition>
                                  </template>
                                </v-tooltip>


                              </h4>
                            </div>
                            <!-- Caret Icon -->

                            <span
                                :class="{'caret': true, 'up': isActive[group.name]}"
                                @click="toggleGroup(group.name)"
                                v-if="groupLengthCheck(group)">&#9654;</span>

                          </div>


                          <div class="accordion-content" v-if="isActive[group.name]">
                            <!-- Questions List -->
                            <ul class="question-list">
                              <li
                                  v-for="q in sortValues(group.survey_questions)"
                                  :key="q.question.id"
                                  class="ml-8"
                                  @mouseover="hoveredQuestion = q.question.id"
                                  @mouseleave="hoveredQuestion = null"
                              >
                                <v-checkbox
                                    v-model="q.question.default_value"
                                    @input="updateResponse(q, section.tag)"
                                    :label="q.question.text"
                                    class="mr-3"
                                ></v-checkbox>
                                <v-tooltip
                                    v-if="q.question.tooltip && hoveredQuestion === q.question.id"
                                    :text="q.question.tooltip"
                                    location="top"
                                >
                                  <template v-slot:activator="{ props }">
                                    <v-icon
                                        v-if="hoveredQuestion === q.question.id"
                                        v-bind="props"
                                        small
                                        color="grayblue"
                                        class="icon">mdi-information
                                    </v-icon>
                                  </template>
                                </v-tooltip>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                  <!-- First v-col group -->

                  <template v-if="currentStep === survey.survey_sections.length - 1">
                    <div class="free-form">
                      <div class="survey_header">
                        What did we miss?
                      </div>
                      <div class="free-box">
                        <v-responsive min-width="300px">
                          <v-text-field
                              v-model="userResponse"
                              label="Freeform text entry field"
                              hint="This will be sent to Pomarium"
                              maxlength="400"
                              counter
                              type="input"
                              clearable
                          ></v-text-field>
                        </v-responsive>
                      </div>
                    </div>
                  </template>
                </v-row>
                <v-row v-else class="rows-center-risk">
                  <!-- First Column: Multi-select and Slider Questions -->
                  <template v-for="group in section.survey_groups" :key="group.name" class="accordion-list-center-risk">
                    <v-container class="investments-container">
                      <v-col>
                        <!-- Loop through questions in this group -->
                        <div v-for="q in group.survey_questions" :key="q.question.id" class="investments-container">
                          <!-- SLIDER type question -->
                          <div v-if="q.question.response_type === 'slider'">
                            <div class="text-h5" style="margin-left: 10px;">
                              {{ q.question.text }}
                            </div>
                            <v-radio-group
                                v-model="q.question.default_value"
                                v-for="(option, index) in q.question.slider_ticks"
                            >
                              <v-radio
                                  :label="newRadioLabels[index]"
                                  :value="index"
                                  @change="updateResponse(q, section.tag)"
                                  class="my-2"
                                  style="margin-left: 10px;"
                              ></v-radio>
                              <p style="font-size: 14px;" class="ml-12">{{ radioDescriprions[index] }}</p>
                            </v-radio-group>

                          </div>

                          <v-col v-else-if="q.question.response_type === 'radio'" lass="radio-box">
                            <!-- RADIO type question -->
                            <div>
                              <div class="text-h5">
                                {{ q.question.text }}
                              </div>
                              <v-radio-group v-model="q.question.default_value" @change="updateResponse(q, section.tag)"
                                             row>
                                <v-radio
                                    v-for="(option, index) in q.question.slider_ticks"
                                    :key="index"
                                    :label="option"
                                    :value="option"
                                    class="my-2"
                                ></v-radio>
                              </v-radio-group>
                            </div>
                          </v-col>

                          <!-- MULTI_SELECT type question -->
                          <div v-else class="autocomplete-invest">
                            <div class="text-h5">
                              {{ q.question.text }}
                            </div>
                            <v-autocomplete
                                v-model="q.question.default_value"
                                :items="q.question.slider_ticks"
                                label="Multiple Responses Possible"
                                chips
                                closable-chips
                                multiple
                                @update:model-value="updateResponse(q, section.tag)"
                            >
                            </v-autocomplete>
                          </div>
                        </div>
                      </v-col>
                    </v-container>
                  </template>
                </v-row>


              </v-container>


            </v-stepper-window-item>
          </v-stepper-window>

          <v-stepper-actions @click:next="next" @click:prev="prev">
            <template #next v-if="currentStep === survey.survey_sections.length">
              <v-btn
                  color="primary"
                  @click="submitSurvey()"
                  :disabled="showMultiSelectError"
                  variant="flat"
              >Submit
              </v-btn>
            </template>
          </v-stepper-actions>
        </template>
      </v-stepper>

      <!--For prospects, will show up at the submit stage to include propect's basic info-->
      <v-dialog max-width="500" v-model="showNewProspectModal">
        <v-card title="Register">
          <v-card-text>
            <v-text-field
                v-model="newProspect.first_name"
                label="First name"
            ></v-text-field>
            <br/>
            <v-text-field
                v-model="newProspect.last_name"
                label="Last name"
            ></v-text-field>
            <br/>
            <v-text-field
                label="Email"
                type="email"
                v-model="newProspect.email"
            ></v-text-field>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                text="Cancel"
                @click="
              showNewProspectModal = false;
              resetForm();
            "
            ></v-btn>
            <v-btn
                text="Save"
                color="primary"
                @click="createNewProspect()"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref, onMounted, inject, computed, watch} from 'vue';
import {onBeforeRouteLeave, useRoute, useRouter} from 'vue-router';
import {useUserStore} from '@/store/user';
import {parseError} from '@/utils/error';
import {getMSTDate} from '@/utils/number'
import {useOverlayStore} from "@/store/overlay";

const overlayStore = useOverlayStore();

// Composables
const router = useRouter();
const route = useRoute();
const $axios = inject('$axios');
const {show} = inject('toast');

//imported components
import Overlay from '@/components/Overlay.vue';
import {funLookAtFunction} from "@/utils/string";
import {debounce} from "chart.js/helpers";

// Stores
const {
  user: {id: advisor_id},
  getValuesProfile,
  isLoggedIn
} = useUserStore();

// Route Params
const user_id = route.query.user_id;
const advisor = route.query.advisor;

// Reactive State

const surveyResponses = reactive([]);

//reference state
const survey = ref(null);
const currentStep = ref(null);
const isAdvisorSurvey = computed(() => advisor === advisor_id);
const hoveredQuestion = ref(null);
const hoveredGroup = ref(null);
const companies = ref([]);
const touched = ref(false);
const showMultiSelectError = ref(false);
const hasSubmitted = ref(false);
const freeFormSubmitted = ref(false);
const isSubmitting = ref(false);
const showNewProspectModal = ref(false);
const selectAll = ref({})
const isActive = ref({});
const userResponse = ref('')
const clientData = ref({})
const otherSelected = ref(false);
const pushToInterests = ref('')
const eliminations = ref(0);
const animatedEliminations = ref(0);
const numberChanging = ref(false)

//Non-composition API global variables
const previousResponses = [];
const allWeeds = [];
let newProspectId = null;


// Initial State
const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};
// below must be after initial state initialization
const newProspect = reactive({...initialState});


// Utility Functions
const groupContainsCheckboxes = (group) => {
  return group.survey_questions.some(q => q.question.response_type === 'checkbox');
};

const groupsWithMultiSelectBoolean = (section) => {
  let newArray = section.filter((group) => group.survey_questions.some(q => q.question.response_type === 'multi_select'))
  return newArray.length > 0
};

const groupsWithMultiSelect = (section) => {
  return section.filter((group) => group.survey_questions.some(q => q.question.response_type === 'multi_select'))
};

const formatLabel = (text) => {
  // Check if 'want' or 'avoid' is present and wrap them in bold tags
  // return text.replace(/(want|avoid)/gi, '<b>$1</b>');
  return text.includes('want') ? 'Which companies (if any) do you want to invest in?' : text.includes('avoid') ? 'Which companies (if any) do you want to avoid in your investments?' : text;
};

const toggleAllCheckboxes = (group) => {
  //updates selectALL state.  Needed a non-db variable so created selectALL for that function
  if (!(group.name in selectAll.value)) {
    selectAll.value[group.name] = true;
  } else {
    selectAll.value[group.name] = !selectAll.value[group.name];
  }

  //updates the checkbox and the question in the survey state
  group.survey_questions.forEach(q => {
    if (q.question.response_type === 'checkbox') {
      q.question.default_value = selectAll.value[group.name];
      updateResponse(q, null, true)

    }
  });
  // only call get Elims for groups on the companies page
  if (group.position > -1 && group.position < 18) {
    getElims()
  }

};

const toggleGroup = (groupName) => {
  //this function is for opening up the table dropdown
  if (!(groupName in isActive.value)) {
    isActive.value[groupName] = true;
  } else {
    isActive.value[groupName] = !isActive.value[groupName]; // Toggle state
  }
};

const selectAllCheck = (group) => {
  //functionality: if all the questions in the group are selected, group will display selected state
  let selectedCount = 0;
  group.survey_questions.forEach(q => {
    if (q.question.default_value === true) {
      selectedCount++;
    }
  });
  // Make sure to check survey_questions length, not values length
  if (selectedCount === group.survey_questions.length) {
    selectAll[group.name === true]
    return true
  } else if (selectedCount === 0) {
    selectAll[group.name === false]
  } else return false;
}

const isIndeterminate = (group) => {
  //Gives us the "-" in the select all checkboxes
  let selectedCount = 0;
  group.survey_questions.forEach(q => {
    if (q.question.default_value === true) {
      selectedCount++;
    }
  });
  // Make sure to check survey_questions length, not values length
  return selectedCount > 0 && selectedCount < group.survey_questions.length;
};


const positionExclude = (groupArray, keyword = null) => {
  //We split groups up by position (db field)
  if (keyword === "drop") {
    return groupArray.filter((group) => group.position < 8);
  } else if (keyword === "single")
    return groupArray.filter((group) => group.position > 7 && group.position < 11);
  else if (keyword === "products") {
    return groupArray.filter((group) => group.position > 11 && group.position < 18);
  } else if (keyword === 'values') {
    return groupArray.filter((group) => group.position > 19 && group.position < 25);
  }
};

const groupLengthCheck = (group) => {
  //if the group is only one question long, we don't have a dropdown caret and functionality
  return group.survey_questions.length > 1
}

const multipleQFunction = (tag) => {
  // Could be phased out with some work, was used initially to signify multiresponse with multiple responses possible,
  // We don't use position at the level of the question, so this is how we are splitting up the investment page
  const qArray = ["annualIncome", "ageRange", "gender"]
  return !qArray.includes(tag)
}

//dev tools showed the position value was created for
const sortValues = (values) => {
  if (values[0].question.response_type === 'checkbox') {
    let switched;
    do {
      switched = false;
      for (let i = 0; i < values.length - 1; i++) {
        if (values[i].question.text > values[i + 1].question.text) {
          // Swap the question objects
          let temp = values[i];
          values[i] = values[i + 1];
          values[i + 1] = temp;

          // Swap the positions
          let tempPosition = values[i].position;
          values[i].position = values[i + 1].position;
          values[i + 1].position = tempPosition;

          switched = true;
        }
      }
    } while (switched);
  }
  return values;
};

const updateResponse = async (q, section, setInitial = false) => {
  // Find if this question's response is already in surveyResponses
  const position = surveyResponses.findIndex(s => s.question.id === q.question.id);

  // If found, remove it to replace with the updated response
  if (position > -1) {
    surveyResponses.splice(position, 1);
  }

  // Push the updated question response into surveyResponses
  surveyResponses.push(q);

  // Mark the form as touched, unless it's an initial set
  if (!setInitial) {
    touched.value = true;
  }

  // Handle multi-select validation
  const multiSelect = surveyResponses
      .filter(r => r.question.response_type === 'multi-select') // Adjust the response_type name if needed
      .map(r => r.question.default_value);

  // Ensure there are no duplicate values in the multi-select responses
  if (multiSelect.length > 1) {
    showMultiSelectError.value = !!multiSelect.reduce(
        (p, c) => p.filter(e => c.includes(e)).length
    );
  }

  if (q.question.tag === "interests" && q.question.default_value.indexOf("Other") !== -1) {
    otherSelected.value = true
  }

  if (section === "pullYourWeeds") {
    await getElims()
  }
};


const sendFreeResponse = async (prospect_id = null) => {
  freeFormSubmitted.value = true;

  try {
    // Check if the response is for a prospect
    if (prospect_id !== null) {
      if (window.pendo) {
        // Send the data to Pendo for a prospect
        pendo.track('User Freeform Response', {
          response: userResponse.value,  // Capture the user's freeform response
          timestamp: getMSTDate(),       // Capture the current time
          user_name: newProspect.first_name + " " + newProspect.last_name,
          user_email: newProspect.email,
          user_firm: "Not associated at this time",
          response_type: "Prospect Response"
        });

      } else {
        console.error('Pendo is not initialized.');
      }
    }
    // If no prospect_id, then it's a client
    else {
      // Check if Pendo is available for client data
      if (window.pendo) {
        // Send the data to Pendo for a client
        pendo.track('User Freeform Response', {
          response: userResponse.value,  // Capture the user's freeform response
          timestamp: getMSTDate(),       // Capture the current time
          user_name: clientData.value.full_name,
          user_email: clientData.value.email,
          user_firm: clientData.value.firm.name,
          response_type: "Client Response",
        });

      } else {
        console.error('Pendo is not initialized.');
      }
    }
  } catch (error) {
    console.error('Error sending freeform response:', error);
  }
};

const sendEmail = async () => {
  try {
    // Fetch advisor details
    const advisorResponse = await $axios.get(`/api/users/advisor/${advisor}`);
    const advisorEmail = advisorResponse.data.email;
    const advisorWantsEmail = advisorResponse.data.email_surveys;
    console.log("advisor email check", advisorEmail)
    console.log("do the want it?", advisorWantsEmail)
    if (advisorWantsEmail === false) {
      return;
    }
    //If the advisor takes this from client route, they won't need an update.  This comes from prospect.
    let message = `
      <p>Hi ${advisorResponse.data.full_name},</p>

      <p>Great news - you’ve got a new prospect! 🎉 ${newProspect.first_name} ${newProspect.last_name} completed a
      Pomarium survey from your unique advisor link.</p>


      <p>Here are your next steps:</p>
      <ul>
        <li>Review their results here @ <a href="https://app.getpomarium.com">Pomarium</a>.</li>
        <li>Reach out to them at <a href="mailto:${newProspect.email}">${newProspect.email}</a> with a sneak peek.</li>
        <li>Schedule a call to review their results together!</li>
      </ul>

      <p>PS: Keep sharing your link, it’s working! 👍🏽</p>
    `;
    let subject = "New Prospect Alert! ✨ A Potential Client Just Completed Your Survey";


    // Post the advisor's email and the message to the email-sending endpoint
    await $axios.post('/api/surveys/email-survey-complete/', {
      advisor_email: advisorEmail,
      message: message,
      subject: subject,
    });

  } catch (error) {
    console.error('Error sending email:', error);
    show({message: parseError(error), error: true});  // Display error message to the user
  }
};

const getElims = async () => {
  // Initialize mappedSurveyResponses as an empty array
  let mappedSurveyResponses = [];

  // Check if surveyResponses is not empty
  if (surveyResponses.length > 0) {
    mappedSurveyResponses = surveyResponses.map(sr => {
      // Construct the response object
      let response = {
        ...sr.question,
        default_value: JSON.stringify(sr.question.default_value), // Convert to string for backend
        name: sr.question["text"]
      };

      return response
    });
  }

  // Filter out duplicate questions in previousResponses (based on question id)
  let filteredPreviousResponses = []
  if (previousResponses.length) {
    filteredPreviousResponses = previousResponses.filter(prevResp => {
      return !surveyResponses.some(surveyResp => surveyResp.question.id === prevResp.id);
    });
  }

  // Check if there are previous responses and concatenate them
  let finalResponses = mappedSurveyResponses.concat(filteredPreviousResponses);


  // Check if mappedSurveyResponses is not empty before making API call
  if (finalResponses.length !== 0) {

    finalResponses.forEach(answeredQuestion => {
      let foundQuestion = allWeeds.find(q => q.tag === answeredQuestion.tag);
      if (foundQuestion) {
        foundQuestion.default_value = answeredQuestion.default_value;
      }
    });

    // console.log(finalResponses);
    // console.log(allWeeds);

    try {
      // Send the mapped responses to the backend
      const result = await $axios.post(
          `/api/advisors/eliminations/`,
          allWeeds //finalResponses
      );

      // Assuming the response contains eliminations count, update it
      eliminations.value = result.data.eliminations_count; // Update the reactive state

    } catch (error) {
      console.error("API call failed", error);
    }
  }
};


watch(eliminations, (newValue, oldValue) => {
  // watches for an update from eliminations (changed through getElim), animates the change
  const duration = 1000; // Animation duration (1 second)
  const frameRate = 60; // 60 frames per second for smooth animation
  const totalFrames = Math.round((duration / 1000) * frameRate);
  let frame = 0;

  const counter = setInterval(() => {
    numberChanging.value = true
    frame++;
    // Calculate the animated value for each frame
    animatedEliminations.value = Math.round(
        oldValue + (newValue - oldValue) * (frame / totalFrames)
    );
    // Clear the interval when the animation is done
    if (frame === totalFrames) {
      clearInterval(counter);
      numberChanging.value = false
    }
  }, 1000 / frameRate);
});


//submit is called in the client pathway without an id (no params).  it is called in createNewProspect with the
// prospect_id
const submit = async (prospect_id) => {
  isSubmitting.value = true;
  overlayStore.openOverlay(
      'Thank you for submitting your survey!',
      'Consult with your advisor for next steps',
      '/UI-IMGs/Values-ss.png'
  );
  try {
    const url = prospect_id
        ? `/api/prospects/${prospect_id}/responses/`
        : `/api/advisors/${advisor_id}/clients/${user_id}/responses/`;

    //prepare data for API call
    let mappedSurveyResponses = surveyResponses.map(sr => {
      if (sr.question.tag === "interests" && pushToInterests.value.length > 0) {
        if (Array.isArray(sr.question.default_value)) {
          sr.question.default_value.push(pushToInterests.value);  // Use spread to push items individually
        }
      }


      let response = {
        ...sr.question,
        default_value: JSON.stringify(sr.question.default_value),
      };

      return response;
    });

    await $axios.post(
        url,
        mappedSurveyResponses
    );

    if (!prospect_id) {
      if (userResponse.value.length) {
        await sendFreeResponse(null)
      }
      await $axios.post(`/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`);
    } else {
      if (userResponse.value.length) {
        await sendFreeResponse(prospect_id)
      }
      await sendEmail()
    }

    show({message: 'Survey saved!'});
    hasSubmitted.value = true;

    setTimeout(() => {
      router.push(prospect_id ? '/?success=true' : `/clients/${user_id}#values`);
    });
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

const getCompanies = async () => {
  try {
    const {data} = await $axios.get('/api/companies/');
    //update the companies state using the db values for the russell 1000 companies
    companies.value = data.map(s => ({
      ...s,
      name: `${s.name} (${s.ticker})`,
    }));
  } catch (error) {
    // Handle error
    show({message: parseError(error), error: true});
  }
};

const getClientData = async () => {
  const response = await $axios.get(`/api/users/simple/${user_id}`);
  clientData.value = response.data;
}

//I am unsure why the list of ticks needs to be moved into an object, but it doesn't take much space so...
const getTicks = (ticks) => {
  const tickObj = {};
  for (let i in ticks) {
    tickObj[i] = ticks[i];
  }
  return tickObj;
};

const resetForm = () => {
  Object.assign(newProspect, initialState);
};


const createNewProspect = async () => {
  try {
    if (!newProspectId) {
      const {data: {id}} = await $axios.post('/api/prospects/', {
        ...newProspect,
        advisor,
      });
      newProspectId = id;
    }
    await submit(newProspectId);
  } catch (error) {
    if (error.response.status === 409) {
      return show({message: 'A user with that email already exists', error: true});
    }
    show({message: parseError(error), error: true});
  }
};

const submitSurvey = () => {
  if (isLoggedIn && !isAdvisorSurvey.value) {
    //client model submit.  We already have the client info
    submit();
  } else {
    //collect prospect info, submit happens after modal submission
    showNewProspectModal.value = true;
  }
};

// Lifecycle Hooks
onMounted(async () => {
  let useful_id
  if (advisor_id) {
    useful_id = advisor_id //on the app, advisor_id is a store var
  } else {
    useful_id = advisor //for the link, advisor is the route params advisor id
  }

  const {data: surveyData} = await $axios.get(`/api/surveys/?advisor_id=${useful_id}`);
  let valuesProfile = [];

  for (let section of surveyData.survey_sections) {
    for (let group of section.survey_groups) {
      //count is for survey mounting so the selectAll logic works upon load
      let count = 0
      for (let q of group.survey_questions) {
        if (section.tag === "pullYourWeeds") {
          allWeeds.push({
            default_value: JSON.stringify(false),
            response_type: q.question.response_type,
            tag: q.question.tag,
            text: q.question.text,
            slider_ticks: q.question.slider_ticks,
          });
        }
      }
    }
  }

  //mounting previous results to valuesProfile if they are present
  if (isLoggedIn && !isAdvisorSurvey.value) {
    valuesProfile = await getValuesProfile({
      advisor_id,
      user_id,
    });
  }

  //adding values profile to visual state of the survey.  small survey so not super concerned about O = n^3
  for (let section of surveyData.survey_sections) {
    for (let group of section.survey_groups) {
      //count is for survey mounting so the selectAll logic works upon load
      let count = 0
      for (let q of group.survey_questions) {
        const foundQuestion = valuesProfile.find(vp => vp.question.id === q.question.id);
        if (foundQuestion) {
          q.question.default_value = foundQuestion.value;
          //let's make something for eliminations to use from valuesProfile
          const {
            sections: {tag: sectionTag}, // Aliasing the `tag` from `sections` to `sectionTag`
            value,
            question: {id, text, response_type, slider_ticks, tag: questionTag} // Aliasing the `tag` from `question` to `questionTag`
          } = foundQuestion;

          if (sectionTag === "pullYourWeeds" && foundQuestion.value !== false) {
            //we are packaging the values profile responses for eliminations mounting
            previousResponses.push({
              default_value: JSON.stringify(value),
              id: id,
              name: text,
              response_type: response_type,
              slider_ticks: slider_ticks,
              tag: questionTag, // This is the `tag` from `question`
              text: text,
            });
          }
          if (foundQuestion.value === true) {
            //if true, one more towards select All being true
            count++
          }
        }
        if (q.question.response_type === 'slider' && q.question.default_value === undefined) {
          q.question.default_value = 1;
          updateResponse(q, null, true);
        }

      }
      if (count === group.survey_questions.length) {
        //all questions are true, selectAll for the group key is true
        selectAll.value[group.name] = true;
      }
    }
  }

  await getElims()
  survey.value = surveyData;
  await getCompanies();
  if (user_id) {
    await getClientData();
  }
});

onBeforeRouteLeave((to, from, next) => {
  if (touched.value && !hasSubmitted.value) {
    if (confirm('Do you really want to leave? you have unsaved changes!')) {
      next();
    }
    return;
  }
  next();
});

window.addEventListener('beforeunload', (event) => {
  if (touched.value && !hasSubmitted.value) {
    if (!confirm('Do you really want to leave? you have unsaved changes!')) {
      event.preventDefault();
    }
  }
});

const radioValue = [0, 1, 2]

const newRadioLabels = ["Personal Values", 'Balance', "Market Focus"]
const radioDescriprions = ["Prioritize investments in companies that align with your values", "Find a middle ground between your values and traditional investment scores", "Prioritize investments based on traditional investment scores"]
</script>


<style scoped>
::v-deep(.v-overlay__content) {
  max-width: 40% !important;
}

.v-input--horizontal {
  justify-content: center;
}

.v-col-12 {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.v-col-6 {
  min-width: 300px !important;
}

.eliminations-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  transform: translateY(-20px);
}

.eliminations-card {
  background-color: #FFFFFF; /* Light brand background color */
  color: #07152A; /* Dark text color */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Soft shadow for elevation */
  width: fit-content;
  max-width: 600px; /* Set a reasonable max width */
  text-align: center;

}

.v-card-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #000000; /* Brand color for the title */
}

.v-card-subtitle {
  font-size: 1rem;
  color: #636970; /* Slightly lighter text color for subtitle */
  margin-top: 0px;
  text-wrap: auto;
}

.animated-eliminations {
  transition: all 0.3s ease;
}

.animated-eliminations-active {
  font-size: 3em; /* Larger font size */
  color: red; /* Red color */
}

.twin-columns {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.multi-dropdown {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1000px;
}

.autocomplete {
  text-align: center;
  align-items: center;
  width: 80%;
}

.autocomplete-div {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.autocomplete .v-input__control {
  display: flex;
  justify-content: center;
}

.survey_header {
  padding: 0px 20px;
  text-align: center;
  margin-bottom: 0px;
  align-items: center;
  border: 2px solid rgba(99, 105, 112, 0.5);
  border-radius: 8px;
  font-size: 1.5rem;
  color: #333;
  box-shadow: None;
  font-weight: 600;
  letter-spacing: 1px;
}

.justify-center {
  display: flex;
  justify-content: center;
}

.sub_header {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 40px;
  font-size: 1.25rem;
  color: #666;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-bottom: 2px solid black;
  padding-bottom: 5px;
  width: fit-content;
}

.subtitle {
  font-size: 20px !important;
}

.rows-center {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  min-width: 80%;
}

.rows-center-risk {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 0;
}

.accordion-list {
  display: block; /* Ensures all items are part of one continuous list */
  margin: 0px;
  padding: 0px 12px 12px 12px;
  width: 50%;
  background-color: transparent;
}

.accordion-list-center {
  display: block; /* Ensures all items are part of one continuous list */
  margin: 0px;
  padding: 0px 12px 12px 12px;
  width: 60%;
  background-color: transparent;
}

.accordion-list-center-risk {
  display: block; /* Ensures all items are part of one continuous list */
  margin: 0px;
  padding: 0px 12px 12px 12px;
  width: 70%;
  background-color: transparent;
}

.accordion-container {
  margin-bottom: 0; /* Remove any default margin */
  padding: 0; /* Remove padding to avoid extra spacing */
  border-bottom: 1px solid #ddd; /* Optional: separator between items */
  background-color: transparent;
}


.accordion-item {
  border: none; /* Light border between items */
  background-color: transparent;
}

.accordion-column {
  margin: 0px !important;
  padding-block: 0px !important;
  background-color: transparent;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px; /* Adjust for a cleaner look */
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  background-color: transparent;
}

.accordion-title {
  display: flex;
  justify-content: start; /* Space out caret and text */
  align-items: center;
  background-color: transparent;
}

.accordion-header:hover {
  background-color: #e6e6e6; /* Slightly darker on hover */
}

.accordion-header h4 {
  margin: 0; /* Remove default margin */
  font-size: 16px; /* Adjust font size */
  font-weight: 500; /* Slightly bolder font */
}

.caret {
  transition: transform 0.3s; /* Smooth rotation transition */
  padding: 10px;
}

.caret.up {
  transform: rotate(180deg); /* Rotate caret for 'up' direction */
  padding: 10px
}

.caret:hover {
  transform: translateY(-3px); /* Slight upward movement on hover */
  color: #007BFF; /* Change color on hover (adjust the color as needed) */
}

.caret.up:hover {
  transform: rotate(180deg) translateY(-3px); /* Rotate caret and apply upward movement on hover */
}

.accordion-content {
  padding: 10px 15px;
  background-color: rgba(255, 255, 255, 0.3);
}

.accordion-content.is-active {
  max-height: 500px; /* Allow content to expand, adjust as needed */
}

.question-list {
  list-style: none; /* Remove list styling */
  margin: 0;
  padding: 0;
}

.question-list li {
  padding: 8px 0; /* Padding for spacing between questions */
  border-bottom: 1px solid #eee; /* Light border between questions */
  display: flex;
  flex-direction: row;
  justify-content: start;
}

.icon {
  transform: translateY(10px);
  margin-left: 5px;
}

.question-list li:last-child {
  border-bottom: none; /* Remove border for the last item */
}

.multi-column {
  display: flex !important;
  justify-content: start !important;
  align-items: center !important;
  flex-direction: column !important;
  width: 100%;
}

.free-form {
  display: flex;
  flex-direction: column; /* Align items in a column */
  justify-content: center; /* Center items vertically */
  align-items: center; /* Center items horizontally */
  width: 100%;
  padding: 20px; /* Add some padding for spacing */
}


.free-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 90% !important; /* Ensure the responsive container takes full width */
  max-width: 1000px; /* Limit the max width to keep the input field manageable */
  margin-bottom: 20px; /* Space between input and button */
}

.radio-box {
  margin-bottom: 20px; /* Remove any default margin */
  padding: 10px; /* Remove padding to avoid extra spacing */
  background-color: transparent;
  min-width: 50%;
}

.autocomplete-invest {
  text-align: center;
  align-items: center;
  width: 80%;
}

.investments-container {
  display: flex;
  justify-content: left;
  align-items: left;
}

.about-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 !important;
}

@media only screen and (max-width: 1275px) {

  .eliminations-container {
    justify-content: center;
  }

  .rows {
    align-items: center;
    justify-content: center;
    margin-top: 0;
  }

  .accordion-list {
    width: 80%;
    margin-top: 12px;
  }

  .accordion-list-center {
    display: block; /* Ensures all items are part of one continuous list */
    margin: 0;
    padding: 0;
    width: 80%;
  }

  .free-box {
    flex-direction: column;
  }

  .radio-box {
    min-width: 80%;
  }

  .autocomplete-invest {
    width: 100%;
  }
}


@media only screen and (max-width: 700px) {

  .eliminations-card {
    max-width: 90%; /* Make it more responsive for small screens */
    padding: 15px;
  }

  .v-card-title {
    font-size: 1.25rem;
  }

  .v-card-subtitle {
    font-size: 1rem;
  }


  .survey_header {
    font-size: 1rem;
  }

  .v-slider-track__tick-label {
    font-size: x-small;
  }

  .rows {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  ::v-deep(.v-overlay__content) {
    max-width: 70% !important;
  }

  .accordion-list {
    width: 100%;
  }

  .multi-dropdown {
    width: 120%;
    transform: translatex(-40px);
  }

  .auto-complete {
    text-wrap: wrap;
    font-size: 14px;
  }

}

@media only screen and (max-width: 400px) {
  .slider {
    max-width: 100%;
    width: 110%;
    transform: translatex(-7.5%);
  }

  .autocomplete-div {
    transform: translateX(10%);
  }
}

</style>
