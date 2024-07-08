<template>
  <div class="text-h4 mb-4">Values Profile</div>

  <v-alert
      title="Advisor Survey"
      type="info"
      v-if="isAdvisorSurvey"
      class="mb-4"
  >You are taking this survey as an advisor. You will need to approve this
    prospect after the survey is submitted.
  </v-alert>

  <v-alert type="warning" v-if="showMultiSelectError" class="mb-4"
  >Please do not include and exclude the same company in your selections.
  </v-alert>

  <div v-if="survey">
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

        <v-stepper-window>
          <v-stepper-window-item
              v-for="(section, i) in survey.survey_sections"
              :value="i + 1"
          >
            <v-container class="flex-container">
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

              <v-row class="rows">
                <v-col
                    v-for="group in section.survey_groups"
                    :cols="group.column_width"
                >
                  <div class="group_header">
                    {{ group.name }}
                    <v-checkbox
                        v-if="groupContainsCheckboxes(group)"
                        v-model="group.selectAll"
                        @change="toggleAllCheckboxes(section)"
                        label="Select All"
                        class="ml-3"
                    ></v-checkbox>
                  </div>

                  <div v-for="q in group.survey_questions">


                    <!-- Tooltip added to info symbol -->
                    <div v-if="q.question.response_type === 'checkbox'" class="d-flex">
                      <v-checkbox
                          v-model="q.question.default_value"
                          @input="updateResponse(q)"
                          :label="q.question.text"
                      ></v-checkbox>
                      <v-tooltip
                          v-if="q.question.tooltip"
                          :text="q.question.tooltip"
                          location="top"
                      >
                        <template v-slot:activator="{ props }">
                          <v-icon small v-bind="props" color="info" class="ml-2">mdi-information</v-icon>
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
                  <v-autocomplete
                      v-if="section.survey_groups.some(group => group.survey_questions.some(q => q.question.response_type === 'multi_select'))"
                      v-model="section.survey_groups.find(group => group.survey_questions.some(q => q.question.response_type === 'multi_select')).survey_questions.find(q => q.question.response_type === 'multi_select').question.default_value"
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
import {useUserStore} from '@/store/user';
import {reactive} from 'vue';
import {onMounted} from 'vue';
import {ref, inject} from 'vue';
import {onBeforeRouteLeave, useRoute, useRouter} from 'vue-router';
import {parseError} from '@/utils/error';

const router = useRouter();

const {
  user: {id: advisor_id},
  getValuesProfile,
  isLoggedIn,
} = useUserStore();

const {
  query: {user_id, advisor},
} = useRoute();

const $axios = inject('$axios');
const {show} = inject('toast');

const survey = ref();

const surveyResponses = [];

const currentStep = ref();

const isAdvisorSurvey = ref(advisor === advisor_id);

onMounted(async () => {
  const {data: surveyData} = await $axios.get('/api/surveys/');

  let valuesProfile = [];

  if (isLoggedIn && !isAdvisorSurvey.value) {
    valuesProfile = await getValuesProfile({
      advisor_id,
      user_id,
    });
  }

  for (let section of surveyData.survey_sections) {
    for (let group of section.survey_groups) {
      for (let q of group.survey_questions) {
        const foundQuestion = valuesProfile.find(
            (vp) => vp.question.id === q.question.id
        );

        if (foundQuestion) {
          q.question.default_value = foundQuestion.value;
        }

        if (q.question.response_type === 'slider') {
          if (q.question.default_value === undefined) {
            q.question.default_value = 0;

            updateResponse(q, true);
          }
        }
      }
    }
  }

  survey.value = surveyData;
});

const companies = ref([]);

const getCompanies = async () => {
  try {
    const {data} = await $axios.get('/api/companies/');

    companies.value = data.map((s) => ({
      ...s,
      name: `${s.name} (${s.ticker})`,
    }));
  } catch (error) {
  }
};

getCompanies();

const touched = ref(false);
const showMultiSelectError = ref(false);
const updateResponse = (q, setInitial) => {
  const position = surveyResponses.findIndex(
      (s) => s.question.id === q.question.id
  );

  if (position > -1) {
    surveyResponses.splice(position, 1);
  }

  surveyResponses.push(q);

  if (!setInitial) {
    touched.value = true;
  }

  const multiSelect = surveyResponses
      .filter((r) => r.question.response_type === 'multi_select')
      .map((r) => r.question.default_value);

  if (multiSelect.length > 1) {
    showMultiSelectError.value = !!multiSelect.reduce(
        (p, c) => p.filter((e) => c.includes(e)).length
    );
  }
};

function groupContainsCheckboxes(group) {
  return group.survey_questions.some(q => q.question.response_type === 'checkbox');
}

function toggleAllCheckboxes(section) {
  section.survey_groups.forEach(group => {
    if (group.selectAll) {
      group.survey_questions.forEach(q => {
        if (q.question.response_type === 'checkbox') {
          q.question.default_value = true;
        }
      });
    } else {
      group.survey_questions.forEach(q => {
        if (q.question.response_type === 'checkbox') {
          q.question.default_value = false;
        }
      });
    }
  });
}

addEventListener('beforeunload', (event) => {
  if (touched.value && !hasSubmitted.value) {
    if (!confirm('Do you really want to leave? you have unsaved changes!')) {
      event.preventDefault();
    }
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

const hasSubmitted = ref(false);
const submit = async (prospect_id) => {
  try {
    // if saving for a client
    const url = prospect_id
        ? `/api/prospects/${prospect_id}/responses/`
        : `/api/advisors/${advisor_id}/clients/${user_id}/responses/`;

    await $axios.post(
        url,
        surveyResponses.map((sr) => ({
          ...sr.question,
          default_value: JSON.stringify(sr.question.default_value),
        }))
    );

    if (!prospect_id) {
      await $axios.post(
          `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`
      );
    }

    show({message: 'Survey saved!'});

    hasSubmitted.value = true;

    setTimeout(() => {
      router.push(
          prospect_id ? '/?success=true' : `/clients/${user_id}#values`
      );
    });
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};


const getTicks = (ticks) => {
  const tickObj = {};

  for (let i in ticks) {
    tickObj[i] = ticks[i];
  }

  return tickObj;
};

const showNewProspectModal = ref(false);

const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

const newProspect = reactive({...initialState});

const resetForm = () => {
  Object.assign(newProspect, initialState);
};

resetForm();

let newProspectId;
const createNewProspect = async () => {
  try {
    if (!newProspectId) {
      const {
        data: {id},
      } = await $axios.post('/api/prospects/', {
        ...newProspect,
        advisor,
      });

      newProspectId = id;
    }

    await submit(newProspectId);
  } catch (error) {
    if (error.response.status === 409) {
      return show({
        message: 'A user with that email already exists',
        error: true,
      });
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
</script>

<style>
.v-overlay__content {
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
  min-width: 500px !important;
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
  border: 2px solid #5CBBF6;
  border-radius: 8px;
  font-size: 1.5rem;
  background-color: #f0f4f8;
  color: #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

@media only screen and (max-width: 1275px) {

  .group_header {
    font-size: 1rem;
    flex-direction: column; /* Change layout to column */
    align-items: flex-start;
  }

  .rows {
    display: flex;
    justify-content: center;
  }

}


@media only screen and (max-width: 700px) {

  .survey_header {
    font-size: 1rem;
  }

}

</style>