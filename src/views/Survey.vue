<template>
  <div class="d-flex my-4">
    <div class="text-h4">Portfolio Guidance and Values Survey</div>
    <v-spacer></v-spacer>
    <v-btn color="primary" @click="submitSurvey()">Submit </v-btn>
  </div>

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
            <v-container>
              <div
                class="pb-6"
                v-if="section.description"
                v-html="section.description"
              ></div>

              <v-row>
                <v-col
                  v-for="group in section.survey_groups"
                  :cols="group.column_width"
                >
                  <div class="text-h6">
                    {{ group.name }}
                  </div>

                  <div v-for="q in group.survey_questions">
                    <v-autocomplete
                      v-if="q.question.response_type === 'multi_select'"
                      class="pb-6"
                      v-model="q.question.default_value"
                      :items="companies"
                      item-title="name"
                      item-value="ticker"
                      :label="q.question.text"
                      chips
                      closable-chips
                      multiple
                      clear-on-select
                      @update:model-value="updateResponse(q)"
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

                    <v-checkbox
                      v-if="q.question.response_type === 'checkbox'"
                      v-model="q.question.default_value"
                      @input="updateResponse(q)"
                      :label="q.question.text"
                    >
                    </v-checkbox>

                    <div
                      v-if="q.question.response_type === 'slider'"
                      class="pb-12"
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
                      ></v-slider>
                    </div>
                  </div>
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
              :disabled="false"
              variant="flat"
              >Submit
            </v-btn>
          </template>
        </v-stepper-actions>
      </template>
    </v-stepper>

    <v-dialog max-width="500" v-model="showEmailModal">
      <v-card title="Register">
        <v-card-text>
          <v-text-field
            v-model="newProspect.first_name"
            label="First name"
          ></v-text-field>
          <br />
          <v-text-field
            v-model="newProspect.last_name"
            label="Last name"
          ></v-text-field>
          <br />
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
              showEmailModal = false;
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
import { useUserStore } from '@/store/user';
import { reactive } from 'vue';
import { onMounted } from 'vue';
import { ref, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();

const {
  user: { id: advisor_id },
  getValuesProfile,
  isLoggedIn,
} = useUserStore();

const {
  query: { user_id, advisor },
} = useRoute();

const $axios = inject('$axios');
const { show } = inject('toast');

const survey = ref();

const surveyResponses = [];

const currentStep = ref();

onMounted(async () => {
  const { data: surveyData } = await $axios.get('/api/surveys/');

  let valuesProfile = [];

  if (isLoggedIn) {
    valuesProfile = await getValuesProfile({
      advisor_id,
      user_id,
      dontRefresh: true,
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

            updateResponse(q);
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
    const { data } = await $axios.get('/api/companies/');

    companies.value = data.map((s) => ({
      ...s,
      name: `${s.name} (${s.ticker})`,
    }));
  } catch (error) {}
};

getCompanies();

const updateResponse = (q) => {
  const position = surveyResponses.findIndex(
    (s) => s.question.id === q.question.id
  );

  if (position > -1) {
    surveyResponses.splice(position, 1);
  }

  surveyResponses.push(q);
};

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

    show({ message: 'Survey saved!' });

    router.push(prospect_id ? '/' : `/clients/${user_id}#values`);
  } catch (error) {
    show({ message: 'Failed to save survey', error: true });
  }
};

const getTicks = (ticks) => {
  const tickObj = {};

  for (let i in ticks) {
    tickObj[i] = ticks[i];
  }

  return tickObj;
};

const showEmailModal = ref(false);

const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

const newProspect = reactive({ ...initialState });

const resetForm = () => {
  Object.assign(newProspect, initialState);
};

resetForm();

const createNewProspect = async () => {
  try {
    const {
      data: { id },
    } = await $axios.post('/api/prospects/', {
      ...newProspect,
      advisor,
    });

    await submit(id);
  } catch (error) {
    show({ message: 'Failed to save', error: true });
  }
};

const submitSurvey = () => {
  if (isLoggedIn) {
    submit();
  } else {
    showEmailModal.value = true;
  }
};
</script>
