<template>
  <div>
    <v-alert
      v-model="showFeedbackSuccess"
      type="success"
      title="Survey Submitted"
      closable
      text="Your Survey was successfully submitted."
    >
    </v-alert>
    <v-spacer></v-spacer>
    <v-alert
      v-model="showFeedbackFail"
      type="error"
      title="Survey Submit Failed."
      closable
      text="A problem occurred contact support.  Unable to submit your Survey."
    >
    </v-alert>
  </div>

  <div class="d-flex my-6">
    <div class="text-h4">Portfolio Guidance and Values Survey</div>
    <v-spacer></v-spacer>
    <v-btn class="mx-2" @click="downloadExport()">Download as CSV</v-btn>
    <v-btn @click="submit()" color="primary">Submit</v-btn>
  </div>

  <v-expansion-panels multiple>
    <v-expansion-panel>
      <v-expansion-panel-title>
        <div>
          <div class="d-flex align-center text-h5 mb-4">
            <v-icon icon="mdi-compass-rose"></v-icon>
            <div class="mx-3">Plant Your Trees</div>
          </div>

          <p>
            Make sure that you are building a portfolio that reflects your
            values, and only includes what you want. Start by entering in
            specific companies you know you want to invest in (if there are not
            any you can leave it blank). Then, select the issues that you want
            to support through your investments. If you are unsure what the
            issues include, read the metrics below each one.
          </p>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <v-textarea
          class="py-6"
          v-model="useSurveyStore().surveyEdit.includedCompanies"
          label="Are there any specific companies you would want to invest in? (comma separated list)"
          variant="outlined"
        ></v-textarea>

        <div class="text-h5 mb-4">
          Do you prioritize investing in companies based on:
        </div>

        <v-row>
          <v-col>
            <div class="pb-6">
              <div class="text-h6">
                {{
                  useSurveyStore().surveyEdit.prioritize.environmentalImpact
                    .name
                }}
              </div>
              <div
                v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                  .environmentalImpact.items"
              >
                <v-checkbox v-model="itemValue.value">
                  <template v-slot:label>
                    {{ itemValue.name }}
                  </template>
                </v-checkbox>
              </div>
            </div>

            <div class="pb-6">
              <div class="text-h6">
                {{
                  useSurveyStore().surveyEdit.prioritize
                    .employeesAndLaborRelations.name
                }}
              </div>
              <div
                v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                  .employeesAndLaborRelations.items"
              >
                <v-checkbox v-model="itemValue.value">
                  <template v-slot:label>
                    {{ itemValue.name }}
                  </template>
                </v-checkbox>
              </div>
            </div>

            <div class="pb-6">
              <div class="text-h6">
                {{
                  useSurveyStore().surveyEdit.prioritize
                    .businessPracticesAndLeadership.name
                }}
              </div>
              <div
                v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                  .businessPracticesAndLeadership.items"
              >
                <v-checkbox v-model="itemValue.value">
                  <template v-slot:label>
                    {{ itemValue.name }}
                  </template>
                </v-checkbox>
              </div>
            </div>
          </v-col>

          <v-col>
            <div class="pb-6">
              <div class="text-h6">
                {{
                  useSurveyStore().surveyEdit.prioritize
                    .customerProductAndResponsibility.name
                }}
              </div>
              <div
                v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                  .customerProductAndResponsibility.items"
              >
                <v-checkbox v-model="itemValue.value">
                  <template v-slot:label>
                    {{ itemValue.name }}
                  </template>
                </v-checkbox>
              </div>
            </div>

            <div class="pb-6">
              <div class="text-h6">
                {{
                  useSurveyStore().surveyEdit.prioritize
                    .communityAndSocialImpact.name
                }}
              </div>
              <div
                v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                  .communityAndSocialImpact.items"
              >
                <v-checkbox v-model="itemValue.value">
                  <template v-slot:label>
                    {{ itemValue.name }}
                  </template>
                </v-checkbox>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title>
        <div>
          <div class="d-flex align-center text-h5 mb-4">
            <v-icon icon="mdi-compass-rose"></v-icon>
            <div class="mx-3">Pull Your Weeds</div>
          </div>

          <p>
            Take out the companies in your portfolio that do not belong. Start
            by entering in specific companies you know you do not want to invest
            in (if there are not any you can leave it blank). Then, add any
            business types or practices you do not want to invest in. Lastly,
            you can add broad industries to avoid,
            <b
              >but caution that there may be some unintended consequences to
              taking out whole industries with a broad stroke.
            </b>
          </p>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <v-textarea
          class="py-6"
          v-model="useSurveyStore().surveyEdit.excludedCompanies"
          label="Are there any specific companies you would avoid investing in? (comma separated list)"
          variant="outlined"
        ></v-textarea>

        <div class="text-h5 mb-4">
          Avoid Investing in Specific Products and Operations:
        </div>

        <v-row>
          <v-col>
            <div
              v-for="itemValue in useSurveyStore().surveyEdit.avoidInvestingInSpecificProductsAndOperations.categories.slice(
                0,
                19,
              )"
            >
              <v-checkbox v-model="itemValue.value">
                <template v-slot:label>
                  {{ itemValue.name }}
                </template>
              </v-checkbox>
            </div>
          </v-col>
          <v-col>
            <div
              v-for="itemValue in useSurveyStore().surveyEdit.avoidInvestingInSpecificProductsAndOperations.categories.slice(
                20,
              )"
            >
              <v-checkbox v-model="itemValue.value">
                <template v-slot:label>
                  {{ itemValue.name }}
                </template>
              </v-checkbox>
            </div>
          </v-col>
        </v-row>
        <br />

        <div class="text-h5 mb-4">Avoid Investing in Specific Industries:</div>
        <v-row>
          <v-col>
            <div
              v-for="itemValue in useSurveyStore().surveyEdit.industryExclusions.categories.slice(
                0,
                18,
              )"
            >
              <v-checkbox v-model="itemValue.value">
                <template v-slot:label>
                  {{ itemValue.name }}
                </template>
              </v-checkbox>
            </div>
          </v-col>
          <v-col>
            <div
              v-for="itemValue in useSurveyStore().surveyEdit.industryExclusions.categories.slice(
                19,
              )"
            >
              <v-checkbox v-model="itemValue.value">
                <template v-slot:label>
                  {{ itemValue.name }}
                </template>
              </v-checkbox>
            </div>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel>
      <v-expansion-panel-title>
        <div>
          <div class="d-flex align-center text-h5 mb-4">
            <v-icon icon="mdi-compass-rose"></v-icon>
            <div class="mx-3">Build Your Boundaries</div>
          </div>

          <p>
            Provide some guidance on how you want your portfolio to be managed
            for you. Enter in how much risk you are okay taking, if you want
            your portfolio to focus solely on your values versus tracking the
            overall market-index, and how long you expect to have your money
            invested.
          </p>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <div class="py-8">
          <div class="text-h5 mb-5">
            Risk Tolerance: How compact are you with fluctuations in the value
            of your investments?
          </div>
          <v-slider
            v-model="useSurveyStore().surveyEdit.riskTolerance"
            :ticks="{
              0: 'Low Risk',
              1: 'Moderate Risk',
              2: 'High Risk',
            }"
            :min="0"
            :max="2"
            :step="1.0"
            show-ticks="always"
            color="primary"
          ></v-slider>
        </div>
        <div class="py-8">
          <div class="text-h5 mb-5">
            Investment Focus: What is more important to you?
          </div>
          <v-slider
            v-model="useSurveyStore().surveyEdit.valuesVsTracking"
            :ticks="{
              0: 'Values Based Focus',
              1: 'Balanced Focus',
              2: 'Market-Index Tracking Focus',
            }"
            :min="0"
            :max="2"
            :step="1.0"
            show-ticks="always"
            color="primary"
          ></v-slider>
        </div>
        <div class="py-8">
          <div class="text-h5 mb-5">
            Investment Horizon: How long do you plan to keep your money
            invested?
          </div>
          <v-slider
            v-model="useSurveyStore().surveyEdit.timeHorizon"
            :ticks="{
              0: 'Short Term',
              1: 'Medium Term',
              2: 'Long Term',
            }"
            :min="0"
            :max="2"
            :step="1.0"
            show-ticks="always"
            color="primary"
          ></v-slider>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { useSurveyStore } from '@/store/survey';
import { ref, inject } from 'vue';

const $axios = inject('$axios');

const showFeedbackSuccess = ref(false);
const showFeedbackFail = ref(false);

const downloadExport = async () => {
  try {
    const { data } = await $axios.get('/api/survey/', {
      responseType: 'blob',
      headers: {
        Accept: 'text/csv',
      },
    });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([data]));
    link.setAttribute('download', 'survey.csv');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.log(error);
  }
};

const submit = async () => {
  try {
    await useSurveyStore().submitSurvey();
    showFeedbackSuccess.value = true;
  } catch (error) {
    showFeedbackFail.value = true;
  }
};
</script>
