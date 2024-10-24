<template>
  <div
      v-if="clientLoading || portfoliosLoading || valuesLoading || metricsLoading"
      class="text-center"
  >
    <v-progress-linear
        color="primary"
        indeterminate
        class="mb-2"
    ></v-progress-linear>

    <div class="text-h4">Loading...</div>
  </div>

  <div v-else>
    <div class="text-h4 my-4">{{ client.full_name }}</div>

    <v-tabs v-model="currentTab">
      <v-tab ref="tab" :href="`#${t.label.toLowerCase()}`" v-for="t in tabs"
      >{{ t.label }}

        <span v-if="t.count !== undefined">({{ t.count }})</span>
        <v-badge
            v-if="t.showAlertBadge"
            color="error"
            content="!"
            inline
        ></v-badge>
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item class="py-2" id="values-profile">
        <div class="d-flex justify-end mb-4">
          <router-link
              :to="{ name: 'Survey', query: { user_id: client.id } }"
              custom
              v-slot="{ navigate }"
          >
            <v-btn
                class="btn"
                color="primary"
                :text="`${hasValuesProfile ? 'Edit' : 'Start'} Values Profile`"
                @click="navigate"
            >
            </v-btn>
            <PDFBuilder  v-if="(screenWidth > 700)" pdfElementId="values-profile" class="mx-4 btn"></PDFBuilder>
          </router-link>
        </div>

        <v-alert
            title="No values profile yet..."
            type="secondary"
            v-if="!hasValuesProfile"
        >Please click "Start Values Profile" to fill out the survey!
        </v-alert>

        <div v-for="(value, i) in valuesProfile" class="mb-4 canvas-content">
          <div class="text-h4 mb-2">{{ value[0].sections.name }}</div>

          <v-table>
            <tbody>
            <tr v-for="val in value">
              <td class="text-no-wrap">{{ val.question.text }}</td>
              <td class="w-100">
                <v-chip
                    v-for="v in getValue(val)"
                    :color="v?.color"
                    class="mr-2 my-1"
                >
                  <v-icon :icon="v.icon" v-if="v.icon"></v-icon>
                  <span v-else-if="v.text">{{ v.text }}</span>
                </v-chip>
              </td>
            </tr>
            </tbody>
          </v-table>
        </div>
      </v-tabs-window-item>

      <v-tabs-window-item class="py-2" id="recommendations">
        <v-alert
            title="No recommendations yet..."
            type="secondary"
            v-if="!allocations.length"
        >
          No recommendations have been generated yet. If you haven't taken the
          survey, please do that before you can generate the recommendation.
        </v-alert>

        <div v-else>

          <div class="my-8 canvas-item" v-if="portfolioValues">
            <div  v-if="(screenWidth > 700)" class="d-flex justify-end mx-7">
              <PDFBuilder pdfElementId="recommendations" canvasClass="canvas-item" :excludeColumns="excludedHeaders"/>
            </div>

            <div class="text-h4">Portfolio vs. Market</div>


            <div class="bar_div">
              <v-col class="bar_graph">
                <BarChart
                    :data="getBarChart(portfolioValues)"
                    :options="screenWidth < 700 ? barOptionsSmall : barOptions"
                />
              </v-col>
              <v-col class="bar_graph_table">
                <v-table>
                  <tbody>
                  <tr>
                    <th class="text-h6">Client Value</th>
                    <th class="text-center text-h6">Pomarium vs. Market</th>
                  </tr>
                  <tr v-for="p in portfolioValuesComparison">
                    <td class="text-no-wrap">{{ p.title }}</td>
                    <td class="text-no-wrap text-center">
                      {{ p.value }}
                    </td>
                  </tr>
                  </tbody>
                </v-table>
              </v-col>
            </div>

          </div>
          <hr/>

          <div class="my-8 canvas-item" v-if="portfolioSectors">
            <div class="text-h4">Sectors</div>

            <div class="pie_section">
              <v-col class="pie_graph">
                <div class="d-flex justify-center align-center h-100">
                  <PieChart
                      :data="getPieChart(portfolioSectors, 'sectors')"
                      :options="{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }"
                  />
                </div>
              </v-col>
              <v-col class="pie_table">
                <v-table>
                  <tbody>
                  <tr v-for="(p, index) in portfolioSectors" :key="index" class="pl-10">
                    <td class="sector-dot">
                      <v-icon :color="orderedColorsSectors[index]">mdi-circle</v-icon>
                    </td>
                    <td class="text-no-wrap">{{ p.title }}</td>
                    <td class="text-no-wrap">{{ p.value }}%</td>
                  </tr>
                  </tbody>
                </v-table>
              </v-col>
            </div>
          </div>

          <hr/>

          <div class="my-8 canvas-item" v-if="Object.keys(eliminatedCount).length">
            <div class="text-h4">Total Excluded Companies (Value Based)</div>
            <div class="pie_section">

              <v-col class="pie_table">
                <v-table>
                  <tbody>
                  <tr v-for="(e, index) in eliminatedCount" :key="index" class="pl-10">
                    <td class="sector-dot">
                      <v-icon :color="orderedColorsElim[index]">mdi-circle</v-icon>
                    </td>
                    <td class="text-no-wrap">{{ e.title }}</td>
                    <td class="text-no-wrap" style="color: red">{{ e.value }}</td>
                  </tr>
                  </tbody>
                </v-table>
              </v-col>

              <v-col class="pie_graph">
                <div class="d-flex justify-center align-center h-100">
                  <PieChart
                      :data="getPieChart(eliminatedCount, 'elim')"
                      :options="{
                            responsive: true,
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                          }"
                  />
                </div>
              </v-col>
            </div>
          </div>
          <hr/>
          <v-row v-if="Object.keys(worstCompanies).length">
            <v-col cols="12" md="6">
              <div class="my-8 table-content">
                <div class="d-flex justify-start flex-row">
                  <v-tooltip
                      text="These companies were excluded from your portfolio, likely among others."
                      location="top">
                    <template v-slot:activator="{ props }">
                      <div class="text-h4" v-bind="props">Lowest Value Scores</div>
                      <v-icon
                          v-bind="props"
                          size="20"
                          color="grayblue"
                          class="ml-1 translate">mdi-information
                      </v-icon>
                    </template>
                  </v-tooltip>
                </div>

                <v-data-table
                    :items="worstCompanies"
                    :headers="worstHeaders"
                    :items-per-page="-1"
                    hide-default-header
                    mobile-breakpoint="700"
                >
                  <!-- Custom Header Slot -->
                  <template
                      v-for="header in worstHeaders"
                      :key="header.key"
                      v-slot:[`header.${header.key}`]="{ column }">
                    <span>{{ column.title }}</span>
                    <v-tooltip
                        v-if="column.tooltip"
                        :text="column.tooltip"
                        location="top"
                    >
                      <template v-slot:activator="{ props }">
                        <v-icon
                            v-bind="props"
                            small
                            color="grayblue"
                            class="ml-1">mdi-information
                        </v-icon>
                      </template>
                    </v-tooltip>
                  </template>


                  <template v-slot:item="{ item }">
                    <tr>
                      <td style="padding: 0px;">
                        <LazyImage
                            :src="item.image"
                            :alt="item.ticker"
                            style="display: flex; margin: auto; max-height: 20px; max-width: 40px;"/>
                      </td>
                      <td style="white-space: nowrap;">{{ item.name }}</td>
                      <td>{{ item.ticker }}</td>
                      <td>{{ item.worst_value }}</td>
                    </tr>
                  </template>
                  <template #bottom></template>
                </v-data-table>
              </div>
            </v-col>
          </v-row>


        </div>

        <hr/>

        <div class="my-8 table-content">
          <div class="text-h4">Pomarium Allocations</div>
          <div class="d-flex justify-end" v-if="!edditingAllocations">
            <v-btn class="mx-6" color="primary" @click="switchEditAllocations();">Edit</v-btn>
            <v-btn color="primary" @click="refresh">Refresh</v-btn>
          </div>
          <div class="d-flex justify-end" v-else>
            <v-btn class="mx-6" @click="saveAllocationsToDelete">Save</v-btn>
            <v-btn @click="switchEditAllocations">Cancel</v-btn>
          </div>
          <v-data-table
              :items="allocations"
              :headers="allocationHeaders"
              :items-per-page="-1"
              hide-default-header
              mobile-breakpoint="700"
          >
            <!-- Custom Header Slot -->
            <template
                v-for="header in allocationHeaders"
                :key="header.key"
                v-slot:[`header.${header.key}`]="{ column }">
              <span>{{ column.title }}</span>
              <v-tooltip
                  v-if="column.tooltip"
                  :text="column.tooltip"
                  location="top"
              >
                <template v-slot:activator="{ props }">
                  <v-icon
                      v-bind="props"
                      small
                      color="grayblue"
                      class="ml-2">mdi-information
                  </v-icon>
                </template>
              </v-tooltip>
            </template>


            <template v-slot:item="{ item }">
              <tr>
                <td>
                  <v-checkbox-btn v-if="edditingAllocations"
                                  @input="addOrRemoveAllocationToDelete(item.ticker)"></v-checkbox-btn>
                </td>
                <td style="padding: 0px;">
                  <LazyImage
                      :src="item.image"
                      :alt="item.ticker"
                      style="display: flex; margin: auto; max-height: 20px; max-width: 40px;"/>
                </td>
                <td style="white-space: nowrap;">{{ item.company }}</td>
                <td>{{ item.ticker }}</td>
                <td>{{ item.allocation }}</td>
                <td>{{ item.values_fit }}</td>
                <td>{{ item.investment_fit }}</td>
              </tr>
            </template>
            <template #bottom></template>
          </v-data-table>

          <div class="d-flex justify-end" v-if="edditingAllocations">
            <v-btn class="mx-6" @click="saveAllocationsToDelete">Save</v-btn>
            <v-btn @click="switchEditAllocations">Cancel</v-btn>
          </div>
        </div>

      </v-tabs-window-item>

      <v-tabs-window-item class="py-2">
            <v-alert style="background-color: white;" class="profile">
              <div class="pb-6">
                <p>Profile</p>
              </div>

              <v-text-field
                  label="First Name"
                  type="text"
                  v-model="client.first_name"
                  class="mb-4"
              ></v-text-field>

              <v-text-field
                  label="Last Name"
                  type="text"
                  v-model="client.last_name"
                  class="mb-4"
              ></v-text-field>

              <v-text-field
                  label="Email"
                  type="email"
                  v-model="client.email"
                  class="mb-4"
              ></v-text-field>
              <div class="d-flex justify-end">
                <v-btn @click="saveClient()" color="primary"> Save</v-btn>
              </div>
            </v-alert>

        <div class="d-flex justify-end mb-4">
          <router-link
              :to="{ name: 'Accounts', params: { user_id } }"
              v-slot="{ navigate }"
          >
            <v-btn @click="navigate" role="link" color="primary">
              Create New Account
            </v-btn>
          </router-link>
          <v-tooltip
              v-if="accounts.length >= 2"
              location="top"
              color="primary"
              text="Click to download a CSV of all accounts allocations combined."
          >
            <template v-slot:activator="{ props }">
              <v-btn
                  class="ml-3"
                  @click="downloadAccountCSVAll()"
                  v-bind="props"
              >
                Download Combined CSV
              </v-btn>
            </template>
          </v-tooltip>
        </div>

        <v-alert title="No accounts yet..." type="secondary" v-if="!accounts.length"
        >No accounts have been created yet. Please click "Create New Account"
          to do so.
        </v-alert>

        <v-data-table v-else :items="accounts" :headers="accountHeaders" :items-per-page="-1">
          <template v-slot:item.actions="{ item }">
            <v-btn
                color="primary"
                size="small"
                class="ml-2"
                append-icon="mdi-chevron-down"
            >Download CSV
              <v-menu activator="parent">
                <v-list>
                  <v-list-item
                      v-for="i in templateItems"
                      :title="i.title"
                      :key="i.value"
                      @click="downloadAccountCSV(item, i.value)"
                  >
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>

            <router-link
                :to="{
                name: 'Accounts',
                params: { user_id },
                query: { account_id: item.id },
              }"
                v-slot="{ navigate }"
            >
              <v-btn
                  @click="navigate"
                  role="link"
                  color="info"
                  size="small"
                  class="ml-2"
              >
                Edit
              </v-btn>
            </router-link>
          </template>
          <template v-slot:item.delete="{ item }">
            <v-icon
                @click="deleteAccount(item)"
                color="primary"
                icon="mdi-delete"
                class="ml-2"
            >
            </v-icon>
          </template>
          <template #bottom v-if="accounts.length < 10"></template>
        </v-data-table>
      </v-tabs-window-item>
      <v-tabs-window-item class="py-2">
        <Analytics
            :metrics="metrics"
            :metrics-loading="metricsLoading"
            :no-metrics="noMetrics"
            :client="client"
            :brand-colors="brandColors"
            :get-unique-random-color="getUniqueRandomColor"/>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import {useUserStore} from '@/store/user';
import {computed, onMounted} from 'vue';
import {ref} from 'vue';
import {inject} from 'vue';
import {useRoute} from 'vue-router';
import PieChart from '../components/PieChart.vue';
import BarChart from '../components/BarChart.vue';
import {groupBy, round} from 'lodash';
import {watch} from 'vue';
import {currencyFormat} from '@/utils/number';
import {parseError} from '@/utils/error';
import Analytics from "@/views/Analytics.vue";
import LazyImage from '@/components/LazyImage.vue';
import PDFBuilder from '@/components/PDFBuilder.vue';

const screenWidth = window.innerWidth;

const excludedHeaders = ['Delete', ''];

const {
  user: {id: advisor_id},
  getValuesProfile,
  isSuper
} = useUserStore();

const {
  params: {user_id},
  hash,
} = useRoute();

const $axios = inject('$axios');
const {show} = inject('toast');

const client = ref({});
const clientLoading = ref(false);
const excludedQuestionIDs = ref('')
const worstCompanies = ref({})
const eliminatedCount = ref({})
const orderedColorsSectors = ref([])
const orderedColorsElim = ref([])

const hasValuesProfile = computed(
    () => !!Object.keys(valuesProfile.value).length
);

const getClient = async () => {
  clientLoading.value = true;

  try {
    const {data} = await $axios.get(
        `/api/advisors/${advisor_id}/clients/${user_id}/`
    );

    client.value = data;
  } catch (error) {
    show({message: `Couldn't retrieve client information`, error: true});
  }

  clientLoading.value = false;
};

const saveClient = async () => {
  try {
    await $axios.patch(`/api/advisors/${advisor_id}/clients/${user_id}/`, {
      first_name: client.value.first_name,
      last_name: client.value.last_name,
      email: client.value.email,
    });

    show({message: 'Client profile saved!'});
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

const portfolioSectors = ref();
const allocations = ref([]);
const allocationsToDel = ref([]);
const allocationsDelDisplay = ref([]);
const hasRequestedPortfolios = ref(false);
const portfolioValues = ref();
const portfoliosLoading = ref(false);
const allocationHeaders = [
  {
    title: 'Delete',
    key: 'actions',
    sortable: false,
    width: 0,
    nowrap: true,
    tooltip: 'Click edit to select companies to remove from your allocations.'
  },
  {
    title: '',
    key: 'image',
    width: 0,
    nowrap: true
  },
  {
    title: 'Company',
    key: 'company',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Ticker',
    key: 'ticker',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Allocation',
    key: 'allocation',
    width: 0,
    nowrap: true,
    tooltip: "Percent Allocation of your funded account to this stock."
  },
  {
    title: 'Values Fit',
    key: 'values_fit',
    width: 0,
    nowrap: true,
    tooltip: 'A percentage description of how well this company meets your values, as calculated by our algorithm.  ' +
        'Please resubmit your survey if these numbers are not populated.',
  },
  {
    title: 'Investment Fit',
    key: 'investment_fit',
    width: 0,
    nowrap: true,
    tooltip: 'A percentage description of how well this company meets your investment preferences, as calculated by ' +
        'our algorithm.  Please resubmit your survey if these numbers are not populated.'
  },
  {}
];

const worstHeaders = [
  {
    title: '',
    key: 'image',
    width: 0,
    nowrap: true
  },
  {
    title: 'Company',
    key: 'name',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Ticker',
    key: 'ticker',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Values Fit',
    key: 'worst_value',
    width: 0,
    nowrap: true,
    tooltip: 'A percentage description of how well this company meets your values, as calculated by our algorithm.'
  },
];

const getPortfolios = async () => {
  portfoliosLoading.value = true;

  try {
    const {
      data: {portfolio: valuesPortfolio, market: valuesMarket},
    } = await $axios.get(
        `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/values/`
    );


    portfolioValues.value = [
      ...Object.keys(valuesPortfolio).map((title) => ({
        title,
        value: round(valuesPortfolio[title], 2),
        type: 'Portfolio',
      })),
      ...Object.keys(valuesMarket).map((title) => ({
        title,
        value: round(valuesMarket[title], 2),
        type: 'Market',
      })),
    ].sort(
        (a, b) => a.title.localeCompare(b.title) || b.type.localeCompare(a.type)
    );
    const {
      data: {portfolio: sectorsPortfolio},
    } = await $axios.get(
        `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/sectors/`
    );

    portfolioSectors.value = Object.keys(sectorsPortfolio)
        .map((title) => ({
          title,
          value: round(sectorsPortfolio[title]),
        }))
        .sort((a, b) => b.value - a.value);

    const {data} = await $axios.get(
        `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`
    );

    const {
      allocations: {pomarium},
      portfolio_data: {
        pomarium_names,
        values_fit,
        investment_fit,
        worst_values = {}, // Provide default empty objects if missing
        worst_values_names = {},
        eliminations = {},
      }
    } = data[0];

    for (let i in pomarium) {
      pomarium[i] = (Math.round(pomarium[i] * 100 * 100) / 100).toFixed(2);
    }

    const labels = Object.keys(pomarium);

    allocations.value = labels
        .map((p) => ({
          company: pomarium_names[p],
          ticker: p,
          allocation: `${pomarium[p]}%`,
          value: pomarium[p],
          values_fit: values_fit && values_fit[p] ? `${(Math.round(values_fit[p] * 100) / 100).toFixed(0)}%` : "",
          investment_fit: investment_fit && investment_fit[p] ? `${(Math.round(investment_fit[p] * 100) / 100).toFixed(0)}%` : "",
          image: getImagePathFromTicker(p),
        }))
        .sort((a, b) => b.value - a.value);

    // Conditionally handle worstCompanies if worst_values and worst_values_names exist
    if (Object.keys(worst_values).length && Object.keys(worst_values_names).length) {
      worstCompanies.value = Object.keys(worst_values)
          .map((ticker) => ({
            image: getImagePathFromTicker(ticker),
            ticker: ticker,
            name: worst_values_names[ticker],
            worst_value: `${Math.round(worst_values[ticker])}%`,
          }))
          .sort((a, b) => parseFloat(a.worst_value) - parseFloat(b.worst_value));
    } else {
      worstCompanies.value = []; // Handle case when no worst values exist
    }

    // Conditionally handle eliminatedCount if eliminations exist
    const categoriesMap = {
      "telecommunications": "Telecommunications",
      "mediaAndEntertainment": "Media and Entertainment",
      "consumerDiscretionary": "Consumer Discretionary",
      "automobilesAndParts": "Automobiles and Parts",
      "consumerDurablesAndApparel": "Consumer Durables and Apparel",
      "consumerServices": "Consumer Services",
      "consumerStaples": "Consumer Staples",
      "foodBeverageTobacco": "Food, Beverage, Tobacco",
      "householdAndPersonalProducts": "Household and Personal Products",
      "banks": "Banks",
      "commercialAndProfessionalServices": "Commercial and Professional Services",
      "insurance": "Insurance",
      "healthcareEquipmentServices": "Health Care Equipment & Services",
      "pharmaceuticalsBiotechnologyAndLifeSciences": "Pharmaceuticals, Biotechnology, Life Sciences",
      "transportation": "Transportation",
      "captialGoods": "Capital Goods",
      "technologyHardware": "Technology Hardware",
      "softwareAndServices": "Software and Services",
      "semiconductorsAndEquipment": "Semiconductors and Equipment",
      "equityRealEstateInvestmentTrustsReits": "Equity Real Estate Investment Trusts (REITs)",
      "realEstateManagementAndDevelopment": "Real Estate Management and Development",
      "energy": "Energy",
      "materials": "Materials",
      "utilities": "Utilities",
      "gmoCrops": "Genetically Modified Plants and Seeds (GMO)",
      "palmOil": "Palm Oil",
      "pesticides": "Pesticides",
      "animalTesting": "Animal Testing",
      "furAndSpecialtyLeather": "Fur and Leather",
      "porkProducts": "Pork Products",
      "whaleMeat": "Whale Meat",
      "alcoholicBeverages": "Alcohol",
      "tobaccoProducts": "Tobacco",
      "cannabis": "Cannabis",
      "gambling": "Gambling",
      "arcticOilAndGasExploration": "Arctic Oil and Gas",
      "coalPower": "Thermal Coal",
      "nuclearPower": "Nuclear Power",
      "oilAndGasProduction": "Oil and Gas",
      "oilSands": "Oil Sands",
      "shaleEnergy": "Shale Energy",
      "controversialWeapons": "Weapons",
      "smallArms": "Personal Arms",
      "militaryContracting": "Military Contracting",
      "privatePrisons": "Private Prisons",
      "riotControl": "Riot Control",
      "humanEmbryonicAndFetalStemCellUse": "Embryonic and Fetal Stem Cell Use",
      "abortion": "Abortion",
      "contraceptives": "Contraceptives",
      "predatoryLending": "Predatory Lending",
      "socialMediaPlatforms": "Social Media",
      "adultEntertainment": "Adult Entertainment",
      "areThereAnySpecificCompaniesYouWouldAvoidInvestingIn": "Are there any specific companies you would avoid investing in?"
    };

    if (Object.keys(eliminations).length) {
      eliminatedCount.value = Object.keys(eliminations)
          .map((industry) => ({
            title: categoriesMap[industry] || industry,
            value: eliminations[industry],
          }))
          .sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    } else {
      eliminatedCount.value = []; // Handle case when no eliminations exist
    }


    portfoliosLoading.value = false;
    hasRequestedPortfolios.value = true;
  } catch (error) {
    console.error('Error in getPortfolios:', error);
  }
};

const portfolioValuesComparison = computed(() => {
  const comparison = [];
  const grouped = groupBy(portfolioValues.value, 'title');

  for (let i in grouped) {
    const val = round(
        grouped[i].find((g) => g.type === 'Portfolio').value -
        grouped[i].find((g) => g.type === 'Market').value,
        2
    );

    const roundedAbsValue = round(Math.abs(val));

    comparison.push({
      title: i,
      value: `${roundedAbsValue}% ${val > 0 ? 'better' : 'worse'}`,
      roundedAbsValue,
    });
  }

  return comparison.sort((a, b) => b.roundedAbsValue - a.roundedAbsValue);
});

const accountHeaders = [
  {
    key: 'actions',
    sortable: false,
    width: 0,
    nowrap: true,
  },
  {
    title: 'Live Account',
    key: 'active',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Account Name',
    key: 'name',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Account Type',
    key: 'account_type',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Account Market Value',
    key: 'value',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Custodian',
    key: 'custodian',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Account Last Four',
    key: 'last_four',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Fractional',
    key: 'fractional',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Risk Tolerance',
    key: 'risk_tolerance',
    width: 0,
    nowrap: true,
  },
  {
    title: '',
    key: 'delete',
    width: 0,
    nowrap: true,
  },
];

const accounts = ref([]);
const getAccounts = async () => {
  try {
    const {data} = await $axios.get(
        `/api/advisors/${advisor_id}/clients/${user_id}/accounts/`
    );

    accounts.value = data
        .filter((d) => !d.is_archived)
        .map((d) => ({
          ...d,
          value: currencyFormat(d.value),
          fractional: d.fractional ? 'Yes' : 'No',
          active: d.active ? 'Yes' : 'No',
        }));

    const accountsTab = tabs.value.find((t) => t.label === 'Accounts');

    accountsTab.count = accounts.value.length;


    accountsTab.showAlertBadge = !accountsTab.count;
  } catch (error) {
    console.error("Error fetching accounts:", error);
  }
};
const downloadAccountCSV = async (account, template) => {
  window.open(
      `${import.meta.env.VITE_BASE_URL}/api/accounts/${account.id}/download/${template}/`,
  );
};

const downloadAccountCSVAll = async () => {
  window.open(
      `${import.meta.env.VITE_BASE_URL}/api/accounts/${user_id}/download-all/`
  );
};

const deleteAccount = async (account) => {
  // pop up a confirmation dialog
  if (!confirm('Are you sure you want to delete this account?')) {
    return;
  } else {
    try {
      await $axios.patch(`/api/accounts/${account.id}/archive/`, {is_archived: true, active: false});
      show({message: 'Account deleted!'});
      getAccounts();
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};

const currentTab = ref();
const tab = ref();
const tabs = ref([
  {label: 'Values Profile'},
  {label: 'Recommendations'},
  {label: 'Accounts'},
  {label: 'Analytics'}
]);


const getValue = (response) => {
  let color;
  let icon;
  const qArray = ["annualIncome", "ageRange", "gender"]

  if (response.sections.tag === 'plantYourTrees') {
    color = 'green';
    icon = 'mdi-check';
  }

  if (response.sections.tag === 'pullYourWeeds') {
    color = 'red';
    icon = 'mdi-close';
  }

  if (response.question.tag === "areThereAnySpecificCompaniesYouWouldWantToInvestIn") {
    color = 'green';
  }

  if (response.question.tag === "areThereAnySpecificCompaniesYouWouldWantToInvestIn") {
    color = 'red';
  }

  if (response.question.response_type === 'checkbox') {
    return [{icon, color}];
  }

  if (response.question.response_type === 'slider') {
    return [{text: response.question.slider_ticks[response.value]}];
  }
  if (response.question.response_type === 'radio' || qArray.includes(response.question.tag)) {
    return [{text: response.value}];
  }

  if (response.question.response_type === 'multi_select') {
    return response.value.map((v) => ({text: v, color}));
  }
};

const valuesProfile = ref({});
const valuesLoading = ref(false);
const fetchValuesProfile = async () => {
  valuesLoading.value = true;

  getClient();

  getAccounts();

  currentTab.value = tab.value.findIndex((t) => t.href === hash);

  const vp = await getValuesProfile({
    advisor_id,
    user_id,
  });

  valuesProfile.value = groupBy(
      vp.filter((v) => v.value !== false),
      'sections.tag'
  );
  valuesLoading.value = false;
}

onMounted(async () => {
  await fetchValuesProfile()
});

watch(currentTab, (newVal) => {
  // More robust check to prevent unnecessary calls
  if (newVal === 1 && !hasRequestedPortfolios.value) {
    getPortfolios();
  } else if (newVal === 3 && !Object.keys(metrics.value).length) {
    getMetrics();
  }
});

const brandColors = [
  '#07152A', '#F9BBA9', '#FFE6B6', '#CF6232', '#CDD0D4', '#636970',
  '#903F30', '#0E2F5F', '#FCC35B', '#FEFCF7', '#9CA1AA', '#F2E7D2', '#6F4C45'
];

const getUniqueRandomColor = (colors, usedColors) => {
  let color;
  do {
    const index = Math.floor(Math.random() * colors.length);
    color = colors[index];
  } while (usedColors.has(color));
  usedColors.add(color);
  return color;
};

const getPieChart = (data, whichVariable) => {
  const labels = data.map((d) => d.title);
  const usedColors = new Set();

  if (whichVariable === "elim") {
    orderedColorsElim.value = labels.map(() => getUniqueRandomColor(brandColors, usedColors));

    return {
      labels,
      datasets: [
        {
          backgroundColor: orderedColorsElim.value,
          data: data.map((d) => d.value),
        },
      ],
    };
  } else {
    orderedColorsSectors.value = labels.map(() => getUniqueRandomColor(brandColors, usedColors));

    return {
      labels,
      datasets: [
        {
          backgroundColor: orderedColorsSectors.value,
          data: data.map((d) => d.value),
        },
      ],
    };
  }
};

const getBarChart = (data) => {
  const marketData = data.filter((d) => d.type === 'Market');
  const pomariumData = data.filter((d) => d.type === 'Portfolio');

  return {
    labels: marketData.map((d) => d.title),
    datasets: [
      {
        label: 'Market',
        data: marketData.map((d) => d.value),
        borderColor: 'rgba(207, 98, 50, 1)', // Rust color
        backgroundColor: 'rgba(207, 98, 50, 0.4)', // Fully transparent background
        borderWidth: {top: 10, left: 0, right: 0, bottom: 0}, // Custom border widths
        borderSkipped: false, // Skip no border to apply custom widths
      },
      {
        label: 'Pomarium',
        backgroundColor: '#07152A', // Primary dark
        data: pomariumData.map((d) => d.value),
      },


    ],
  };
};

const getImagePathFromTicker = (tickerSymbol) => {
  return `/Company-Logos/${tickerSymbol}.png`;
}

const metrics = ref({});
const metricsLoading = ref(false);
const noMetrics = ref(true)

const getMetrics = async () => {
  metricsLoading.value = true;
  try {
    const {data} = await $axios.get(`/api/advisors/${advisor_id}/clients/${user_id}/portfolio/metrics`);
    metrics.value = data;
    noMetrics.value = false; // Set to false if metrics are successfully fetched
  } catch (error) {
    if (error.response && error.response.status === 404) {
      noMetrics.value = true; // Set to true if there's a 404 error
    } else {
      show({message: `Couldn't retrieve metrics information`, error: true});
    }
    metrics.value = {}; // Clear metrics on error
  }
  metricsLoading.value = false;
};

let updateAvoidedCompanies = [
  {
    id: '',
    position: 0,
    question: {
      default_value: allocationsToDel.value,
      id: '',
      response_type: 'multi_select',
      slider_ticks: null,
      tag: 'areThereAnySpecificCompaniesYouWouldAvoidInvestingIn',
      text: 'Are there any specific companies you would avoid investing in?',
      tooltip: null
    }
  }
];

const edditingAllocations = ref(false);

const getExclusionsQuestionIDs = async () => {
  let excludedTag = 'areThereAnySpecificCompaniesYouWouldAvoidInvestingIn';
  try {
    const response = await $axios.get(`/api/surveys/idtodelete/${excludedTag}/`);
    excludedQuestionIDs.value = response.data;

  } catch (error) {
    show({message: parseError(error), error: true});
  }
};
getExclusionsQuestionIDs()
const switchEditAllocations = () => {
  edditingAllocations.value = !edditingAllocations.value;
  let indexA = valuesProfile.value["pullYourWeeds"].length - 1;
  allocationsToDel.value.push(...Object.values(valuesProfile.value['pullYourWeeds'][indexA].value));
  updateAvoidedCompanies[0].question.id = excludedQuestionIDs.value.base_id;
  updateAvoidedCompanies[0].id = excludedQuestionIDs.value.related_question_id;
};

const addOrRemoveAllocationToDelete = (allocation) => {
  if (allocationsToDel.value.includes(allocation)) {
    allocationsToDel.value = allocationsToDel.value.filter((a) => a !== allocation);
    allocationsDelDisplay.value = allocationsDelDisplay.value.filter((a) => a !== allocation);
  } else {
    allocationsToDel.value.push(allocation);
    allocationsDelDisplay.value.push(allocation);
  }
}

const saveAllocationsToDelete = () => {
  if (confirm(`Do you really want to delete these companies from your allocations? ${allocationsDelDisplay.value}`)) {
    edditingAllocations.value = !edditingAllocations.value;
    submitSurvey();
  } else {
    switchEditAllocations();
  }
};

const submitSurvey = async () => {
  valuesLoading.value = true;
  try {
    await $axios.post(
        `/api/advisors/${advisor_id}/clients/${user_id}/responses/`,
        updateAvoidedCompanies.map(uac => ({
          ...uac.question,
          default_value: JSON.stringify(uac.question.default_value),
        })));

    await $axios.post(`/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`);

    show({message: 'Submitted!'});
    valuesLoading.value = false;
    location.reload();
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

const refresh = () => {
  if (confirm('By clicking "Refresh Survey", you will reload the current page and may lose your existing portfolio allocations. Are you sure you want to continue?')) {
    try {
      $axios.post(`/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`);
    } catch (error) {
      show({message: parseError(error), error: true});
    }
    location.reload();
  }
};

const templateItems = [{
  title: 'Orion',
  value: 'orion'
}, {
  title: 'Raymond James',
  value: 'rj'
}, {
  title: 'Standard',
  value: 'standard'
}];

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};
// bar options for small screens
const barOptionsSmall = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  x: {
    ticks: false,
  },
};

}, {
  title: "LPL Financial",
  value: 'lpl_financial'
}
];
</script>

<style scoped>

.bar_div {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  /* Adjust the gap between grid items as needed */
  justify-content: center;
  padding: 0 16px; /* Add padding to prevent cutting off edges */
  box-sizing: border-box; /* Include padding in element's total width/height */
}

.bar_graph {
  grid-column: span 7;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.bar_graph_table {
  grid-column: span 5;
  width: 100%;
}

/* Base styles for pie chart section */
.pie_section {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px; /* Adjust the gap between grid items as needed */
  justify-content: center;
  align-items: center;
  padding: 0 16px; /* Add padding to prevent cutting off edges */
  box-sizing: border-box;
}

.pie_graph {
  grid-column: span 4;
  width: 100%;
}

.pie_table {
  grid-column: span 8;
  width: 100%;
}

:deep(.v-overlay__content) {
  max-width: 40% !important;
}

.worst-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.translate {
  transform: translateY(10px) !important;
}

.profile {
  width: 50%;
}

/* Responsive adjustments for bar and pie sections */
@media only screen and (max-width: 1275px) {
  .bar_section,
  .pie_section {
    grid-template-columns: 1fr;
  }

  .bar_graph {
    grid-column: span 12;
  }

  .pie_graph {
    grid-column: span 12;
  }

  .bar_graph_table,
  .pie_table {
    grid-column: span 12;
  }
}

@media only screen and (max-width: 700px) {
  .bar_graph,
  .pie_graph {
    grid-column: span 12;
  }

  .bar_graph_table,
  .pie_table {
    grid-column: span 12;
  }

  .profile {
    width: 90vw;
    margin-bottom: 20px;
  }

}

@media only screen and (max-width: 400px) {
  .btn {
    font-size: 11px;
  }
}

</style>
