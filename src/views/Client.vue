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
          <v-btn
            color="primary"
            :text="`${valuesProfile.length ? 'Edit' : 'Start'} Values Profile`"
            class=""
            @click="
              router.push({
                path: '/survey',
                query: {
                  user_uuid: client.uuid,
                },
              })
            "
          ></v-btn>
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
          v-if="!portfolio.length"
          >No recommendations have been generated yet. Please click "Generate
          Recommendation" to do so.
        </v-alert>

        <pre v-else>{{ portfolio }}</pre>
      </v-tabs-window-item>

      <v-tabs-window-item class="py-4">
        <div class="d-flex justify-end mb-4">
          <v-btn
            color="primary"
            text="Create New Account"
            @click="createNewAccount()"
          ></v-btn>
        </div>
        <v-alert title="No accounts yet..." type="info"
          >No accounts have been created yet. Please click "Create New Account"
          to do so.
        </v-alert>
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
import { useRoute, useRouter } from 'vue-router';

const {
  user: { uuid: advisor_uuid },
  getValuesProfile,
} = useUserStore();

const { valuesProfile } = storeToRefs(useUserStore());

const {
  params: { user_uuid },
  hash,
} = useRoute();

const router = useRouter();
const $axios = inject('$axios');
const { show } = inject('toast');

const tab = ref();

const client = ref({});

const currentTab = ref();
onMounted(() => {
  currentTab.value = tab.value.findIndex((t) => t.href === hash);
});

const getClient = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_uuid}/clients/${user_uuid}/`
    );

    client.value = data;
  } catch (error) {
    show({ message: `Couldn't retrieve client information`, error: true });
  }
};

getClient();

onMounted(async () => {
  await getValuesProfile({
    advisor_uuid,
    user_uuid,
  });
});

const generateRecommendation = async () => {
  try {
    await $axios.post(
      `/api/advisors/${advisor_uuid}/clients/${user_uuid}/portfolio/`
    );

    getPortfolio();
  } catch (error) {
    show({ message: `Couldn't retrieve client information`, error: true });
  }
};

const portfolio = ref();

const getPortfolio = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_uuid}/clients/${user_uuid}/portfolio/`
    );

    portfolio.value = data;
  } catch (error) {}
};

getPortfolio();

const createNewAccount = async () => {
  show({ message: `Create new account coming soon...` });
};
</script>
