<template>
  <div class="text-h4 mb-4">Values Profile</div>

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

  <!--steps are "weeds" "trees" "boundaries". First step into the survey_seed file found
  at app/surveys/management/survey_seed.py by accessing the section to create the header -->
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
            <v-container class="flex-container description">
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


              <!--now we are getting the questions. We can very nicely get the groups and questions, and
              dynamically populate the form. Added are some conditionals that help differentiate different
              windows based on the question type a la multi-select or checkbox etc -->
              <v-row class="rows">
                <v-col
                    v-for="group in section.survey_groups"
                    :cols="group.column_width"
                    :key="group.name"
                >
                  <div v-if="groupContainsCheckboxes(group)" class="group_header text-h5">
                    {{ group.name }}


                    <!--this checkbox is the select all. Toggles the associated checkboxes and selectAll state managed
                    by the group.name and updates the survey state -->
                    <v-checkbox
                        v-if="groupContainsCheckboxes(group) && section.name === 'Plant your Trees'"
                        :model-value="selectAll[group.name] || false"
                        @change="toggleAllCheckboxes(group)"
                        label="Select All"
                        class="ml-3"
                    ></v-checkbox>
                  </div>


                  <!--checkboxes and tooltips. Tooltips were added to survey_seed.py. Transition is not functional
                  but is a TODO to make them not just immediately appear and disappear.-->
                  <div v-for="q in sortValues(group.survey_questions)" :key="q.question.id">
                    <div
                        v-if="q.question.response_type === 'checkbox'"
                        class="d-flex align-center"
                        @mouseover="hoveredQuestion = q.question.id"
                        @mouseleave="hoveredQuestion = null"
                    >
                      <v-checkbox
                          v-model="q.question.default_value"
                          @input="updateResponse(q)"
                          :label="q.question.text"

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
                    </div>

                    <div
                        v-if="q.question.response_type === 'slider'"
                        class="pb-8"
                    >
                      <div class="text-h5">
                        {{ q.question.text }}
                      </div>

                      <v-slider
                          v-model="q.question.default_value"
                          :min="0"
                          :max="q.question.slider_ticks.length - 1"
                          :step="1.0"
                          :ticks="getTicks(q.question.slider_ticks)"
                          @end="updateResponse(q)"
                          show-ticks="always"
                          color="primary"
                          max-width="1000px"
                      ></v-slider>

                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
            <v-container class="flex-container justify-center mt-6">
              <v-row class="d-flex justify-center">
                <v-col cols="12" md="8">

                  <!--confusing looking v-model and :label, but remember the survey_seed structure, just getting down
                  the tree to the level of the question names and such. The companies are the Russell 1000 index
                  companies and Nathan is updating manually versus automatically at this time.-->
                  <v-autocomplete
                      v-if="section.survey_groups.some(group => group.survey_questions
                        .some(q => q.question.response_type === 'multi_select'))"
                      v-model="section.survey_groups.find(group => group.survey_questions
                        .some(q => q.question.response_type === 'multi_select')).survey_questions
                        .find(q => q.question.response_type === 'multi_select').question.default_value"
                      :items="companies"
                      item-title="name"
                      item-value="ticker"
                      :label="section.survey_groups.find(group => group.survey_questions
                        .some(q => q.question.response_type === 'multi_select')).survey_questions
                        .find(q => q.question.response_type === 'multi_select').question.text"
                      chips
                      closable-chips
                      multiple
                      clear-on-select
                      @update:model-value="updateResponse(section.survey_groups.find(group => group.survey_questions
                      .some(q => q.question.response_type === 'multi_select')).survey_questions
                      .find(q => q.question.response_type === 'multi_select'))"
                      class="autocomplete"
                  >
                    <template v-slot:chip="{ props, item }">
                      <v-chip v-bind="props" :text="item.raw.name"></v-chip>
                    </template>

                    <template v-slot:item="{ props, item }">
                      <v-list-item
                          v-bind="props"
                          :title="item.raw.name"
                      ></v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>
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
</template>

<script setup>
import {reactive, ref, onMounted, inject, computed} from 'vue';
import {onBeforeRouteLeave, useRoute, useRouter} from 'vue-router';
import {useUserStore} from '@/store/user';
import {parseError} from '@/utils/error';
import {useOverlayStore} from "@/store/overlay";

const overlayStore = useOverlayStore();

// Composables
const router = useRouter();
const route = useRoute();
const $axios = inject('$axios');
const {show} = inject('toast');

//imported components
import Overlay from '@/components/Overlay.vue';

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
const survey = ref(null);
const surveyResponses = reactive([]);
const currentStep = ref(null);
const isAdvisorSurvey = computed(() => advisor === advisor_id);
const hoveredQuestion = ref(null);
const companies = ref([]);
const touched = ref(false);
const showMultiSelectError = ref(false);
const hasSubmitted = ref(false);
const showNewProspectModal = ref(false);
const selectAll = ref({})
const showOverlay = ref(false);

// Initial State
const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};
const newProspect = reactive({...initialState});

// Utility Functions
const groupContainsCheckboxes = (group) => {
  return group.survey_questions.some(q => q.question.response_type === 'checkbox');
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
      updateResponse(q, true)
    }
  });
};

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

const updateResponse = (q, setInitial = false) => {
  const position = surveyResponses.findIndex(s => s.question.id === q.question.id);
  if (position > -1) {
    surveyResponses.splice(position, 1);
  }
  surveyResponses.push(q);
  if (!setInitial) {
    touched.value = true;
  }

  const multiSelect = surveyResponses
      .filter(r => r.question.response_type === 'multi_select')
      .map(r => r.question.default_value);

  //cannot have the same value in both included and excluded, thus it would be in there more than once
  if (multiSelect.length > 1) {
    showMultiSelectError.value = !!multiSelect.reduce(
        (p, c) => p.filter(e => c.includes(e)).length
    );
  }
};

//submit is called in the client pathway without an id.  it is called in createNewProspect with the prospect_id
const submit = async (prospect_id) => {
  try {
    const url = prospect_id
        ? `/api/prospects/${prospect_id}/responses/`
        : `/api/advisors/${advisor_id}/clients/${user_id}/responses/`;

    let mappedSurveyResponses = surveyResponses.map(sr => ({
      ...sr.question,
      default_value: JSON.stringify(sr.question.default_value),
    }))
    console.log("here is your map", mappedSurveyResponses)

    await $axios.post(
        url,
        mappedSurveyResponses
    );

    if (!prospect_id) {
      await $axios.post(`/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`);
    }

    show({message: 'Survey saved!'});
    hasSubmitted.value = true;

    overlayStore.openOverlay(
        'Thank you for submitting your survey!',
        'Consult with your advisor for next steps',
        '/UI-IMGs/Values-ss.png'
    );

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

let newProspectId = null;
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
    submit();
  } else {
    showNewProspectModal.value = true;
  }
};

// Lifecycle Hooks
onMounted(async () => {
  const {data: surveyData} = await $axios.get('/api/surveys/');
  let valuesProfile = [];

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
      for (let q of group.survey_questions) {
        const foundQuestion = valuesProfile.find(vp => vp.question.id === q.question.id);
        if (foundQuestion) {
          q.question.default_value = foundQuestion.value;
        }
        if (q.question.response_type === 'slider' && q.question.default_value === undefined) {
          q.question.default_value = 1;
          updateResponse(q, true);
        }
      }
    }
  }

  survey.value = surveyData;
  await getCompanies();
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

.autocomplete {
  text-align: center;
  max-width: 100%;
}

.autocomplete .v-input__control {
  display: flex;
  justify-content: center;
}

.survey_header {
  padding: 10px 20px;
  text-align: center;
  margin-bottom: 20px;
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

.group_header {
  display: flex;
  align-items: center; /* Aligns items vertically in the center */
  font-size: 1.25rem; /* Adjust the size as needed to match text-h6 */
  font-weight: 500; /* Adjust the weight as needed to match text-h6 */
  margin-bottom: 5px; /* Add margin to separate from other elements */
  justify-content: start; /* Space between the text and the checkbox */
}

/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}


@media only screen and (max-width: 1275px) {

  .group_header {
    font-size: 1rem;
    flex-direction: column; /* Change layout to column */
    align-items: flex-start;
  }

}


@media only screen and (max-width: 700px) {

  .survey_header {
    font-size: 1rem;
  }

  .v-slider-track__tick-label {
    font-size: x-small;
  }

  .rows {
    display: flex;
    justify-content: center;
  }

  ::v-deep(.v-overlay__content) {
    max-width: 70% !important;
  }

}

</style>