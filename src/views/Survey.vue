<template>
  <div class="d-flex my-6">
    <div class="text-h4">Portfolio Guidance and Values Survey</div>
    <v-spacer></v-spacer>
    <v-btn class="mx-2">Download as CSV</v-btn>
    <v-btn color="primary">Submit</v-btn>
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

          <v-textarea
            v-if="section.notes_placeholder"
            v-model="section.notes"
            class="pb-10"
            :label="section.notes_placeholder"
            variant="outlined"
          ></v-textarea>

          <v-row>
            <v-col
              :cols="section.survey_groups.length > 1 ? '6' : '12'"
              v-for="group in section.survey_groups"
            >
              <div class="text-h6">
                {{ group.name }}
              </div>

              <div v-for="q in group.survey_questions">
                <v-checkbox
                  v-if="q.question.response_type === 'checkbox'"
                  v-model="q.question.default_value"
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
import { onMounted } from 'vue';
import { ref, inject } from 'vue';

const $axios = inject('$axios');

const survey = ref();

onMounted(async () => {
  const { data } = await $axios.get('/api/surveys/');
  survey.value = data;
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
//     link.href = window.URL.createObjectURL(new Blob([data]));
//     link.setAttribute('download', 'survey.csv');
//     document.body.appendChild(link);
//     link.click();
//   } catch (error) {
//     console.log(error);
//   }
// };

const getTicks = (ticks) => {
  const tickObj = {};

  for (let i in ticks) {
    tickObj[i] = ticks[i];
  }

  return tickObj;
};
</script>
