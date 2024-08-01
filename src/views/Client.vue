<template>
  <div
      v-if="clientLoading || portfoliosLoading || valuesLoading"
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
      <v-tabs-window-item class="py-2">
        <div class="d-flex justify-end mb-4">
          <router-link
              :to="{ name: 'Survey', query: { user_id: client.id } }"
              custom
              v-slot="{ navigate }"
          >
            <v-btn
                color="primary"
                :text="`${hasValuesProfile ? 'Edit' : 'Start'} Values Profile`"
                @click="navigate"
            >
            </v-btn>
          </router-link>
        </div>

        <v-alert
            title="No values profile yet..."
            type="secondary"
            v-if="!hasValuesProfile"
        >Please click "Start Values Profile" to fill out the survey!
        </v-alert>

        <div v-for="(value, i) in valuesProfile" class="mb-4">
          <div class="text-h4 mb-2">{{ i }}</div>

          <v-table>
            <tbody>
            <tr v-for="val in value">
              <td class="text-no-wrap">{{ val.question.text }}</td>
              <td class="w-100">
                <v-chip
                    v-for="v in getValue(val)"
                    :color="v?.color"
                    class="mr-2"
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

      <v-tabs-window-item class="py-2">
        <v-alert
            title="No recommendations yet..."
            type="secondary"
            v-if="!allocations.length"
        >
          No recommendations have been generated yet. If you haven't taken the
          survey, please do that before you can generate the recommendation.
        </v-alert>

        <div v-else>

          <div class="my-8" v-if="portfolioValues">
            <div class="text-h4">Portfolio/Market</div>


            <div class="bar_div">
              <v-col class="bar_graph">
                <BarChart
                    :data="getBarChart(portfolioValues)"
                />
              </v-col>
              <v-col class="bar_graph_table">
                <v-table>
                  <tbody>
                  <tr>
                    <th>Client Value</th>
                    <th class="text-center">Pomarium vs. Market</th>
                  </tr>
                  <tr v-for="p in portfolioValuesComparison">
                    <td class="text-no-wrap">{{ p.title }}</td>
                    <td class="w-100 text-center">
                      {{ p.value }}
                    </td>
                  </tr>
                  </tbody>
                </v-table>
              </v-col>
            </div>

          </div>
          <hr/>

          <div class="my-8" v-if="portfolioSectors">
            <div class="text-h4">Sectors</div>

            <div class="pie_section">
              <v-col class="pie_graph">
                <div class="d-flex justify-center align-center h-100">
                  <PieChart
                      :data="getPieChart(portfolioSectors)"
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
                      <v-icon :color="orderedColors[index]">mdi-circle</v-icon>
                    </td>
                    <td class="text-no-wrap">{{ p.title }}</td>
                    <td class="w-100">{{ p.value }}%</td>
                  </tr>
                  </tbody>
                </v-table>
              </v-col>
            </div>
          </div>


          <hr/>

          <div class="my-8">
            <div class="text-h4">Pomarium Allocations</div>

            <v-data-table
                :items="allocations"
                :headers="allocationHeaders"
                :items-per-page="-1"
            >
              <template v-slot:item="{ item }">
                <tr>
                  <td><img :src="getImagePathFromTicker(item.ticker)" alt=""
                           style="display: flex; margin: auto; max-height: 20px; max-width: 40px;"></td>
                  <td style="text-wrap: nowrap;">{{ item.company }}</td>
                  <td>{{ item.ticker }}</td>
                  <td>{{ item.allocation }}</td>
                </tr>
              </template>
              <template #bottom></template>
            </v-data-table>
          </div>
        </div>
      </v-tabs-window-item>

      <v-tabs-window-item class="py-2">
        <div class="d-flex justify-end mb-4">
          <router-link
              :to="{ name: 'Accounts', params: { user_id } }"
              v-slot="{ navigate }"
          >
            <v-btn @click="navigate" role="link" color="primary">
              Create New Account
            </v-btn>
          </router-link>
        </div>

        <v-alert title="No accounts yet..." type="secondary" v-if="!accounts.length"
        >No accounts have been created yet. Please click "Create New Account"
          to do so.
        </v-alert>

        <v-data-table v-else :items="accounts" :headers="accountHeaders">
          <template v-slot:item.actions="{ item }">
            <v-btn
                color="primary"
                @click="downloadAccountCSV(item)"
                size="small"
                class="ml-2"
            >Download CSV
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
        </v-data-table>
      </v-tabs-window-item>

      <v-tabs-window-item class="py-2">
        <v-row>
          <v-col cols="6">
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

            <div class="d-flex justify-end mb-4">
              <v-btn @click="saveClient()" color="primary"> Save</v-btn>
            </div>
          </v-col>
        </v-row>
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

const {
  user: {id: advisor_id},
  getValuesProfile,
} = useUserStore();

const {
  params: {user_id},
  hash,
} = useRoute();

const $axios = inject('$axios');
const {show} = inject('toast');

const client = ref({});
const clientLoading = ref(false);

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
const hasRequestedPortfolios = ref(false);
const portfolioValues = ref();
const portfoliosLoading = ref(false);
const allocationHeaders = [
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
  },
  {}
];

let orderedColors = ref([])

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
      portfolio_data: {pomarium_names},
    } = data[0];

    for (let i in pomarium) {
      pomarium[i] = Math.round(pomarium[i] * 100 * 100) / 100;
    }

    const labels = Object.keys(pomarium);

    allocations.value = labels
        .map((p) => ({
          company: pomarium_names[p], //
          ticker: p,
          allocation: `${pomarium[p]}%`,
          value: pomarium[p],
        }))
        .sort((a, b) => b.value - a.value);

  } catch (error) {
  }

  hasRequestedPortfolios.value = true;

  portfoliosLoading.value = false;
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
  // {
  //   title: 'Fractional',
  //   key: 'fractional',
  //   width: 0,
  //   nowrap: true,
  // },
  {
    title: 'Risk Tolerance',
    key: 'risk_tolerance',
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

    accounts.value = data.map((d) => ({
      ...d,
      value: currencyFormat(d.value),
      // fractional: d.fractional ? 'Yes' : 'No',
      active: d.active ? 'Yes' : 'No',
    }));

    const accountsTab = tabs.value.find((t) => t.label === 'Accounts');

    accountsTab.count = accounts.value.length;


    accountsTab.showAlertBadge = !accountsTab.count;
  } catch (error) {
    console.error("Error fetching accounts:", error);
  }
};

const downloadAccountCSV = async (account) => {
  window.open(
      `${import.meta.env.VITE_BASE_URL}/api/accounts/${account.id}/download/`
  );
};

const currentTab = ref();
const tab = ref();
const tabs = ref([
  {label: 'Values'},
  {label: 'Recommendations'},
  {label: 'Accounts'},
  {label: 'Profile'},
]);

const getValue = (response) => {
  let color;
  let icon;

  if (response.sections.tag === 'plantYourTrees') {
    color = 'green';
    icon = 'mdi-check';
  }

  if (response.sections.tag === 'pullYourWeeds') {
    color = 'red';
    icon = 'mdi-close';
  }

  if (response.question.response_type === 'checkbox') {
    return [{icon, color}];
  }

  if (response.question.response_type === 'multi_select') {
    return response.value.map((v) => ({text: v, color}));
  }

  if (response.question.response_type === 'slider') {
    return [{text: response.question.slider_ticks[response.value]}];
  }
};

const valuesProfile = ref({});
const valuesLoading = ref(false);
onMounted(async () => {
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
      'sections.name'
  );

  valuesLoading.value = false;
});

watch(currentTab, (e) => {
  if (e === 1 && !hasRequestedPortfolios.value) {
    getPortfolios();
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

const getPieChart = (data) => {
  const labels = data.map((d) => d.title);
  const usedColors = new Set();

  orderedColors.value = labels.map(() => getUniqueRandomColor(brandColors, usedColors));

  return {
    labels,
    datasets: [
      {
        backgroundColor: orderedColors.value,
        data: data.map((d) => d.value),
      },
    ],
  };
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
        // backgroundColor: 'rgba(207, 98, 50, 1)',
        // borderWidth: 10,
        // pointRadius: 50, // Hide the points
        // pointStyle: 'line',
        // pointHoverRadius: 20, // Hide the hover points
        // type: "line",
        // fill: false, // Prevent the area under the line from being filled
        // showLine: false,
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

</script>

<style>
/* Base styles for bar chart section */
.bar_div {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.bar_graph {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  min-width: 1000px;
  width: 100%;
}

.bar_graph_table {
  max-width: 800px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Base styles for pie chart section */
.pie_section {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px; /* Adjust the gap between grid items as needed */
  justify-content: center;
}

.pie_graph {
  grid-column: span 4;
}

.pie_table {
  grid-column: span 8;
}

/* Responsive adjustments for pie section */
@media only screen and (max-width: 1275px) {
  .bar_div {
    flex-direction: column;
  }

  .bar_graph {
    min-width: 500px;

  }

  .pie_section {
    grid-template-columns: 1fr;
  }

  .pie_graph {
    grid-column: span 12;
  }

  .pie_table {
    grid-column: span 12;
  }
}

@media only screen and (max-width: 700px) {
  .pie_graph {
    grid-column: span 12;
  }

  .pie_table {
    grid-column: span 12;
  }
}

</style>
