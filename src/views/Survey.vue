<template>
  <div class="d-flex my-6">
    <div class="text-h4">Portfolio Guidance and Values Survey</div>
    <v-spacer></v-spacer>
    <v-btn class="mx-2">Download as CSV</v-btn>
    <v-btn color="primary" @click="submit()">Submit</v-btn>
  </div>

  <div v-if="survey">
    <v-stepper :items="survey.survey_sections.map(({ name }) => name)">
      <template
        v-for="(section, i) in survey.survey_sections"
        v-slot:[`item.${i+1}`]
      >
        <v-container>
          <div
            class="pb-6"
            v-if="section.description"
            v-html="section.description"
          ></div>

          <v-row>
            <v-col
              :cols="section.survey_groups.length > 1 ? 6 : 12"
              v-for="group in section.survey_groups"
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
                >
                  <template v-slot:label>
                    {{ q.question.text }}
                  </template>
                </v-checkbox>

                <div v-if="q.question.response_type === 'slider'" class="pb-12">
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
      </template>
    </v-stepper>
  </div>
</template>

<script setup>
import router from '@/router';
import { useUserStore } from '@/store/user';
import { onMounted } from 'vue';
import { ref, inject } from 'vue';
import { useRoute } from 'vue-router';

const {
  user: { uuid: advisor_uuid },
  getValuesProfile,
} = useUserStore();

const {
  params: { client_uuid },
} = useRoute();

const $axios = inject('$axios');
const { show } = inject('toast');

const survey = ref();

const surveyResponses = [];

onMounted(async () => {
  const valuesProfile = await getValuesProfile({
    advisor_uuid,
    client_uuid,
    dontRefresh: true,
  });

  const { data: surveyData } = await $axios.get('/api/surveys/');

  for (let section of surveyData.survey_sections) {
    for (let group of section.survey_groups) {
      for (let q of group.survey_questions) {
        const foundQuestion = valuesProfile.find(
          (vp) => vp.question.id === q.question.id
        );

        if (foundQuestion) {
          q.question.default_value = JSON.parse(foundQuestion.value);
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

// const downloadExport = async () => {
//   try {
//     const { data } = await $axios.get('/api/survey/', {
//       responseType: 'blob',
//       headers: {
//         Accept: 'text/csv',
//       },
//     });

//     const link = document.createElement('a');
//     link.href = window.URL.createObjectURL(new Blob([surveyData]));
//     link.setAttribute('download', 'survey.csv');
//     document.body.appendChild(link);
//     link.click();
//   } catch (error) {

//   }
// };

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

const submit = async () => {
  try {
    await $axios.post(
      `/api/advisors/${advisor_uuid}/clients/${client_uuid}/responses/`,
      surveyResponses.map((sr) => ({
        ...sr.question,
        default_value: JSON.stringify(sr.question.default_value),
      }))
    );

    show({ message: 'Survey saved!' });

    router.push(`/clients/${client_uuid}`);
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
</script>
