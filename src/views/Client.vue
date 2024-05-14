<template>
  <div>
    <div class="text-h4 my-4">{{ client.full_name }}</div>

    <v-tabs v-model="currentTab">
      <v-tab
        ref="tab"
        :href="`#${v.toLowerCase()}`"
        v-for="v in ['Values', 'Recommendations', 'Accounts', 'Profile']"
        >{{ v }}
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
              :text="`${valuesProfile ? 'Edit' : 'Start'} Values Profile`"
              @click="navigate"
            >
            </v-btn>
          </router-link>
        </div>

        <v-alert
          title="No values profile yet..."
          type="info"
          v-if="!valuesProfile"
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
        <div class="d-flex justify-end mb-4">
          <v-btn
            color="primary"
            text="Generate Recommendation"
            @click="generateRecommendation()"
            :readonly="!valuesProfile"
            :variant="valuesProfile ? 'elevated' : 'tonal'"
          ></v-btn>
        </div>

        <v-alert
          title="No recommendations yet..."
          type="info"
          v-if="!valuesProfile"
          >No recommendations have been generated yet. Please click "Generate
          Recommendation" to do so. If you already haven't taken the survey,
          please do that before you can generate the recommendation.
        </v-alert>

        <div v-else>
          <div class="my-8" v-if="portfolioValuesPortfolio">
            <div>Portfolio Values - Portfolio</div>

            <v-row>
              <v-col cols="6">
                <BarChart
                  :data="getChartData(portfolioValuesPortfolio)"
                  :options="chartOptions"
                />
              </v-col>
              <v-col cols="6">
                <v-table>
                  <tbody>
                    <tr v-for="p in portfolioValuesPortfolio">
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

          <div class="my-8" v-if="portfolioValuesMarket">
            <div>Portfolio Values - Market</div>

            <v-row>
              <v-col cols="6">
                <BarChart
                  :data="getChartData(portfolioValuesMarket)"
                  :options="chartOptions"
                />
              </v-col>
              <v-col cols="6">
                <v-table>
                  <tbody>
                    <tr v-for="p in portfolioValuesMarket">
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
            <div>Portfolio Sectors - Portfolio</div>

            <v-row>
              <v-col cols="6">
                <PieChart
                  :data="getChartData(portfolioSectors)"
                  :options="chartOptions"
                />
              </v-col>
              <v-col cols="6">
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

        <v-data-table v-else :items="accounts"> </v-data-table>
      </v-tabs-window-item>

      <v-tabs-window-item class="py-2">
        <v-row>
          <v-col cols="6">
            <v-list>
              <v-list-item
                title="First Name"
                :subtitle="client.first_name"
              ></v-list-item>
              <v-list-item
                title="Last Name"
                :subtitle="client.last_name"
              ></v-list-item>
              <v-list-item title="Email" :subtitle="client.email"></v-list-item>
            </v-list>
          </v-col>

          <v-col cols="6">
            <v-list>
              <v-list-item title="Account Number" :subtitle="''"></v-list-item>
              <v-list-item
                title="Account Custodian"
                :subtitle="client?.advisor?.full_name"
              ></v-list-item>
              <v-list-item title="Account Type" :subtitle="''"></v-list-item>
              <v-list-item title="Account Status" :subtitle="''"></v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import PieChart from '../components/PieChart.vue';
import BarChart from '../components/BarChart.vue';
import { groupBy, round } from 'lodash';

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
const getClient = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/`
    );

    client.value = data;
  } catch (error) {
    show({ message: `Couldn't retrieve client information`, error: true });
  }
};

const generateRecommendation = async () => {
  try {
    await $axios.post(
      `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`
    );

    getPortfolios();
  } catch (error) {
    show({ message: `Couldn't retrieve client information`, error: true });
  }
};

const portfolioValuesPortfolio = ref();
const portfolioValuesMarket = ref();
const portfolioSectors = ref();
const getPortfolios = async () => {
  try {
    const {
      data: { portfolio: valuesPortfolio, market: valuesMarket },
    } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/values/`
    );

    portfolioValuesPortfolio.value = Object.keys(valuesPortfolio)
      .map((title) => ({
        title,
        value: round(valuesPortfolio[title], 2),
      }))
      .sort((a, b) => b.value - a.value);

    portfolioValuesMarket.value = Object.keys(valuesMarket)
      .map((title) => ({
        title,
        value: round(valuesMarket[title], 2),
      }))
      .sort((a, b) => b.value - a.value);

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
  } catch (error) {}
};

const accounts = ref([]);
const getAccounts = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/accounts/`
    );

    accounts.value = data;
  } catch (error) {}
};

const currentTab = ref();
const tab = ref();

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

const valuesProfile = ref();
onMounted(async () => {
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

  getPortfolios();
});

const getChartData = (data) => {
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

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};
</script>
