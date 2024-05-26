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

    <div class="text-h6">Loading...</div>
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
          type="info"
          v-if="!hasValuesProfile"
          >Please click "Start Values Profile" to fill out the survey!
        </v-alert>

        <div v-for="(value, i) in valuesProfile" class="mb-4">
          <div class="text-h6 mb-2">{{ i }}</div>

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
          type="info"
          v-if="!allocations.length"
        >
          No recommendations have been generated yet. If you already haven't
          taken the survey, please do that before you can generate the
          recommendation.
        </v-alert>

        <div v-else>
          <div class="my-8" v-if="portfolioValues">
            <div class="text-h6">Portfolio/Market</div>

            <v-row>
              <v-col cols="6">
                <BarChart
                  :data="getBarChart(portfolioValues)"
                  :options="{
                    responsive: true,
                  }"
                />
              </v-col>
              <v-col cols="6">
                <v-table>
                  <tbody>
                    <tr>
                      <th>Client Value</th>
                      <th>Pomarium vs. Market</th>
                    </tr>
                    <tr v-for="p in portfolioValuesComparison">
                      <td class="text-no-wrap">{{ p.title }}</td>
                      <td class="w-100">
                        {{ p.value }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </div>
          <hr />

          <div class="my-8" v-if="portfolioSectors">
            <div class="text-h6">Sectors</div>

            <v-row>
              <v-col cols="4">
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
              <v-col cols="8">
                <v-table>
                  <tbody>
                    <tr v-for="p in portfolioSectors">
                      <td class="text-no-wrap">{{ p.title }}</td>
                      <td class="w-100">
                        {{ p.value }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </div>

          <hr />

          <div class="my-8">
            <div class="text-h6">Pomarium Allocations</div>

            <v-data-table
              :items="allocations"
              :headers="allocationHeaders"
              :items-per-page="-1"
            >
              <template #bottom> </template>
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

        <v-alert title="No accounts yet..." type="info" v-if="!accounts.length"
          >No accounts have been created yet. Please click "Create New Account"
          to do so.
        </v-alert>

        <v-data-table v-else :items="accounts" :headers="accountHeaders">
          <template v-slot:item.actions="{ item }">
            <v-btn
              color="primary"
              @click="downloadAccountCSV(item)"
              size="small"
              >Download CSV
            </v-btn>
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
              <v-btn @click="saveClient()" color="primary"> Save </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { computed, onMounted } from 'vue';
import { ref } from 'vue';
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import PieChart from '../components/PieChart.vue';
import BarChart from '../components/BarChart.vue';
import { groupBy, round } from 'lodash';
import { watch } from 'vue';
import { currencyFormat } from '@/utils/number';

const {
  user: { id: advisor_id },
  getValuesProfile,
} = useUserStore();

const {
  params: { user_id },
  hash,
} = useRoute();

const $axios = inject('$axios');
const { show } = inject('toast');

const client = ref({});
const clientLoading = ref(false);

const hasValuesProfile = computed(
  () => !!Object.keys(valuesProfile.value).length
);

const getClient = async () => {
  clientLoading.value = true;

  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/`
    );

    client.value = data;
  } catch (error) {
    show({ message: `Couldn't retrieve client information`, error: true });
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

    show({ message: 'Client profile saved!' });
  } catch (error) {
    show({ message: `Couldn't save client profile`, error: true });
  }
};

const portfolioSectors = ref();
const allocations = ref([]);
const hasRequestedPortfolios = ref(false);
const portfolioValues = ref();
const portfoliosLoading = ref(false);
const allocationHeaders = [
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
  {},
];

const getPortfolios = async () => {
  portfoliosLoading.value = true;

  try {
    const {
      data: { portfolio: valuesPortfolio, market: valuesMarket },
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
      data: { portfolio: sectorsPortfolio },
    } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/sectors/`
    );

    portfolioSectors.value = Object.keys(sectorsPortfolio)
      .map((title) => ({
        title,
        value: round(sectorsPortfolio[title], 2),
      }))
      .sort((a, b) => b.value - a.value);

    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`
    );

    const {
      allocations: { pomarium },
      portfolio_data: { pomarium_names },
    } = data[0];

    for (let i in pomarium) {
      pomarium[i] = Math.round(pomarium[i] * 100 * 100) / 100;
    }

    const labels = Object.keys(pomarium);

    allocations.value = labels
      .map((p) => ({
        company: pomarium_names[p],
        ticker: p,
        allocation: pomarium[p],
      }))
      .sort((a, b) => b.allocation - a.allocation);
  } catch (error) {}

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

    comparison.push({
      title: i,
      value: `${Math.abs(val)}% ${val > 0 ? 'better' : 'worse'}`,
    });
  }

  return comparison;
});

const accountHeaders = [
  {
    key: 'actions',
    sortable: false,
    width: 0,
    nowrap: true,
  },
  {
    title: 'Active',
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
  {},
];

const accounts = ref([]);
const getAccounts = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/accounts/`
    );

    accounts.value = data.map((d) => ({
      ...d,
      value: currencyFormat(d.value),
      fractional: d.fractional ? 'Yes' : 'No',
      active: d.active ? 'Yes' : 'No',
    }));

    const accountsTab = tabs.value.find((t) => t.label === 'Accounts');

    accountsTab.count = accounts.value.length;

    accountsTab.showAlertBadge = !accountsTab.count;
  } catch (error) {}
};

const downloadAccountCSV = async (account) => {
  window.open(
    `${import.meta.env.VITE_BASE_URL}/api/accounts/${account.id}/download/`
  );
};

const currentTab = ref();
const tab = ref();
const tabs = ref([
  { label: 'Values' },
  { label: 'Recommendations' },
  { label: 'Accounts' },
  { label: 'Profile' },
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
    return [{ icon, color }];
  }

  if (response.question.response_type === 'multi_select') {
    return response.value.map((v) => ({ text: v, color }));
  }

  if (response.question.response_type === 'slider') {
    return [{ text: response.question.slider_ticks[response.value] }];
  }
};

const valuesProfile = ref({});
const valuesLoading = ref(false);
onMounted(async () => {
  valuesLoading.value = true;

  getClient();

  getAccounts();

  currentTab.value = tab.value.findIndex((t) => t.href === hash);

  valuesProfile.value = groupBy(
    await getValuesProfile({
      advisor_id,
      user_id,
    }),
    'sections.name'
  );

  valuesLoading.value = false;
});

watch(currentTab, (e) => {
  if (e === 1 && !hasRequestedPortfolios.value) {
    getPortfolios();
  }
});

const getBarChart = (data) => {
  const marketData = data.filter((d) => d.type === 'Market');
  const pomariumData = data.filter((d) => d.type === 'Portfolio');

  return {
    labels: marketData.map((d) => d.title),
    datasets: [
      {
        label: 'Pomarium',
        backgroundColor: 'blue',
        data: pomariumData.map((d) => d.value),
      },
      {
        label: 'Market',
        backgroundColor: 'red',
        data: marketData.map((d) => d.value),
      },
    ],
  };
};

const getPieChart = (data) => {
  const labels = data.map((d) => d.title);

  return {
    labels,
    datasets: [
      {
        backgroundColor: labels.map(
          (_) => `#${((Math.random() * 0xffffff) << 0).toString(16)}`
        ),
        data: data.map((d) => d.value),
      },
    ],
  };
};
</script>
