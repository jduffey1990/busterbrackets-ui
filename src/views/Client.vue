<template>
  <div>
    <div class="text-h4 my-6">{{ client.full_name }}</div>

    <v-tabs v-model="currentTab">
      <v-tab
        ref="tab"
        :href="`#${v.toLowerCase()}`"
        v-for="v in ['Values', 'Recommendations', 'Accounts', 'Profile']"
        >{{ v }}
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item class="py-4">
        <div class="d-flex justify-end mb-4">
          <router-link
            :to="{ name: 'Survey', query: { user_id: client.id } }"
            custom
            v-slot="{ navigate }"
          >
            <v-btn
              color="primary"
              :text="`${
                valuesProfile.length ? 'Edit' : 'Start'
              } Values Profile`"
              @click="navigate"
            >
              Start Values Profile
            </v-btn>
          </router-link>
        </div>

        <v-alert
          title="No values profile yet..."
          type="info"
          v-if="!valuesProfile.length"
          >Please click "Start Values Profile" to fill out the survey!
        </v-alert>

        <v-row v-else>
          <v-col cols="6">
            <ul class="mx-4">
              <li v-for="v in valuesProfile">
                {{ v.question.text }} - {{ v.value }}
              </li>
            </ul>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <v-tabs-window-item class="py-4">
        <div class="d-flex justify-end mb-4">
          <v-btn
            color="primary"
            text="Generate Recommendation"
            @click="generateRecommendation()"
            :readonly="!valuesProfile.length"
            :variant="valuesProfile.length ? 'elevated' : 'tonal'"
          ></v-btn>
        </div>

        <v-alert
          title="No recommendations yet..."
          type="info"
          v-if="!latestPortfolioTable"
          >No recommendations have been generated yet. Please click "Generate
          Recommendation" to do so. If you already haven't taken the survey,
          please do that before you can generate the recommendation.
        </v-alert>

        <div v-else>
          <v-row>
            <v-col cols="6">
              <div ref="pieWrapper">
                <PieChart
                  v-if="latestPortfolioChart"
                  :data="latestPortfolioChart"
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
            <v-col cols="6">
              <v-data-table
                :items="latestPortfolioTable"
                :items-per-page="-1"
                :style="{ maxHeight: `${pieWrapper?.clientHeight}px` }"
              >
                <template #bottom> </template>
              </v-data-table>
            </v-col>
          </v-row>
        </div>
      </v-tabs-window-item>

      <v-tabs-window-item class="py-4">
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

      <v-tabs-window-item class="py-4">
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
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { inject } from 'vue';
import { useRoute } from 'vue-router';
import PieChart from '../components/PieChart.vue';

const {
  user: { id: advisor_id },
  getValuesProfile,
} = useUserStore();

const { valuesProfile } = storeToRefs(useUserStore());

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

const latestPortfolioTable = ref();
const latestPortfolioChart = ref();
const pieWrapper = ref();
const getPortfolios = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`
    );

    const { pomarium } = data[0].allocations;

    const labels = Object.keys(pomarium);

    latestPortfolioChart.value = {
      labels,
      datasets: [
        {
          backgroundColor: labels.map(
            (_) => `#${((Math.random() * 0xffffff) << 0).toString(16)}`
          ),
          data: Object.values(pomarium).map((v) => v * 100),
        },
      ],
    };

    latestPortfolioTable.value = labels
      .map((p) => ({
        ticker: p,
        allocation: pomarium[p] * 100,
      }))
      .sort((a, b) => b.allocation - a.allocation);
  } catch (error) {}
};

const portfolioValues = ref();
const getPortfolioValues = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/values/`
    );

    portfolioValues.value = data;
  } catch (error) {}
};

const portfolioSectors = ref();
const getPortfolioSectors = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/clients/${user_id}/portfolio/sectors/`
    );

    portfolioSectors.value = data;
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

onMounted(async () => {
  getClient();

  getAccounts();

  currentTab.value = tab.value.findIndex((t) => t.href === hash);

  await getValuesProfile({
    advisor_id,
    user_id,
  });

  await getPortfolios();

  if (latestPortfolioTable.value) {
    getPortfolioValues();
    getPortfolioSectors();
  }
});
</script>
