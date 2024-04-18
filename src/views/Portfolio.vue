<template>
  <v-row
    class="fill-height"
    align-content="center"
    justify="center"
    v-if="!usePortfolioStore().portfolio"
  >
    <v-col class="text-subtitle-1 text-center" cols="12">
      Creating your custom portfolio that honors your values, guidance, and
      maximizes return. This can take up to one minute.
    </v-col>
    <v-col cols="6">
      <v-progress-linear
        color="primary"
        indeterminate
        rounded
        height="6"
      ></v-progress-linear>
    </v-col>
  </v-row>

  <div v-else>
    <div class="d-flex my-6">
      <div class="text-h4">Portfolio</div>
      <v-spacer></v-spacer>
      <v-btn class="mx-2" @click="downloadExport()">Download as CSV</v-btn>
      <v-btn
        @click="usePortfolioStore().portfolioEdit.isApproved = true"
        color="primary"
        >Approve Portfolio
      </v-btn>
    </div>

    <v-row>
      <v-col cols="4">
        <v-card class="pa-6 overflow-x-auto">
          <div class="text-h5 text-center mb-3">Values Survey Synopsis</div>
          <div
            v-if="useSurveyStore().isNotEmpty('industryExclusions')"
            class="mb-6"
          >
            <div class="font-weight-black">Industry Exclusions</div>

            <div
              v-for="itemValue in useSurveyStore().surveyEdit.industryExclusions
                .categories"
            >
              <div v-if="itemValue.value" class="ma-2 text-disabled">
                {{ itemValue.name }}
              </div>
            </div>
          </div>

          <div
            v-if="
              useSurveyStore().isNotEmpty(
                'avoidInvestingInSpecificProductsAndOperations'
              )
            "
            class="mb-6"
          >
            <div class="font-weight-black">
              Avoid Investing In Specific Products And Operations
            </div>

            <div
              v-for="itemValue in useSurveyStore().surveyEdit
                .avoidInvestingInSpecificProductsAndOperations.categories"
            >
              <div v-if="itemValue.value" class="ma-2 text-disabled">
                {{ itemValue.name }}
              </div>
            </div>
          </div>

          <div
            v-if="useSurveyStore().isNotEmpty('prioritize.environmentalImpact')"
            class="mb-6"
          >
            <div class="font-weight-black">
              {{
                useSurveyStore().surveyEdit.prioritize.environmentalImpact.name
              }}
            </div>

            <div
              v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                .environmentalImpact.items"
            >
              <div v-if="itemValue.value" class="ma-2 text-disabled">
                {{ itemValue.name }}
              </div>
            </div>
          </div>

          <div
            v-if="
              useSurveyStore().isNotEmpty(
                'prioritize.businessPracticesAndLeadership'
              )
            "
            class="mb-6"
          >
            <div class="font-weight-black">
              {{
                useSurveyStore().surveyEdit.prioritize
                  .businessPracticesAndLeadership.name
              }}
            </div>

            <div
              v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                .businessPracticesAndLeadership.items"
            >
              <div v-if="itemValue.value" class="ma-2 text-disabled">
                {{ itemValue.name }}
              </div>
            </div>
          </div>

          <div
            v-if="
              useSurveyStore().isNotEmpty(
                'prioritize.employeesAndLaborRelations'
              )
            "
            class="mb-6"
          >
            <div class="font-weight-black">
              {{
                useSurveyStore().surveyEdit.prioritize
                  .employeesAndLaborRelations.name
              }}
            </div>

            <div
              v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                .employeesAndLaborRelations.items"
            >
              <div v-if="itemValue.value" class="ma-2 text-disabled">
                {{ itemValue.name }}
              </div>
            </div>
          </div>

          <div
            v-if="
              useSurveyStore().isNotEmpty(
                'prioritize.customerProductAndResponsibility'
              )
            "
            class="mb-6"
          >
            <div class="font-weight-black">
              {{
                useSurveyStore().surveyEdit.prioritize
                  .customerProductAndResponsibility.name
              }}
            </div>

            <div
              v-for="itemValue in useSurveyStore().surveyEdit.prioritize
                .customerProductAndResponsibility.items"
            >
              <div v-if="itemValue.value" class="ma-2 text-disabled">
                {{ itemValue.name }}
              </div>
            </div>
          </div>

          <div
            v-if="useSurveyStore().isNotEmpty('excludedCompanies')"
            class="mb-6"
          >
            <div class="font-weight-black">Excluded Companies:</div>
            <div class="ma-2 text-disabled">
              {{ useSurveyStore().surveyEdit.excludedCompanies }}
            </div>
          </div>

          <div
            v-if="useSurveyStore().isNotEmpty('includedCompanies')"
            class="mb-6"
          >
            <div class="font-weight-black">Included Companies:</div>
            <div class="ma-2 text-disabled">
              {{ useSurveyStore().surveyEdit.includedCompanies }}
            </div>
          </div>

          <div class="font-weight-black">Portfolio Guidance</div>

          <div class="ma-2 text-disabled">
            Risk Tolerance:
            {{ guidanceRisk[useSurveyStore().surveyEdit.riskTolerance] }}
          </div>

          <div class="ma-2 text-disabled">
            Values to Market Tracking:
            {{ guidanceValues[useSurveyStore().surveyEdit.valuesVsTracking] }}
          </div>

          <div class="ma-2 text-disabled">
            Time Horizon:
            {{ guidanceHorizon[useSurveyStore().surveyEdit.timeHorizon] }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="8">
        <v-card class="mb-6" v-if="chartData">
          <BarChart :data="chartData" :options="{ responsive: true }" />
        </v-card>

        <v-card v-if="usePortfolioStore().portfolio.allocation">
          <v-table fixed-header height="500">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Percentage</th>
                <th>Asset Class</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in usePortfolioStore().portfolio
                  .allocation"
                :key="index"
              >
                <td>{{ index }}</td>
                <td>{{ (100 * item).toFixed(2) }}</td>
                <td>{{ usePortfolioStore().portfolio.assetClass[index] }}</td>
                <td>{{ usePortfolioStore().portfolio.description[index] }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import BarChart from '@/components/BarChart.vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { inject } from 'vue';
const $axios = inject('$axios');

const guidanceRisk = usePortfolioStore().guidanceTextRisk;
const guidanceValues = usePortfolioStore().guidanceTextValues;
const guidanceHorizon = usePortfolioStore().guidanceTextHorizon;

const chartData = ref();

onMounted(async () => {
  try {
    await usePortfolioStore().fetchPortfolio();

    const {
      data: { display },
    } = await usePortfolioStore().fetchPortfolioValues();

    if (display) {
      chartData.value = {
        labels: Object.keys(display),
        datasets: [
          {
            label: 'Values Alignment vs Russell 1000',
            backgroundColor: '#5CBBF6',
            data: Object.values(display),
          },
        ],
      };
    }
  } catch (error) {}
});

const downloadExport = async () => {
  try {
    const { data } = await $axios.get('/api/portfolio/', {
      responseType: 'blob',
      headers: {
        Accept: 'text/csv',
      },
    });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([data]));
    link.setAttribute('download', 'portfolio.csv');
    document.body.appendChild(link);
    link.click();
  } catch (error) {}
};
</script>
