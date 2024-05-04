<template>
  <div>
    <div class="d-flex my-6">
      <div class="text-h4">{{ client.full_name }}</div>

      <v-spacer></v-spacer>

      <v-btn
        color="info"
        text="Generate Recommendation"
        class="ml-2"
        @click="generateRecommendation()"
        :disabled="!valuesProfile.length"
      ></v-btn>

      <v-btn
        color="primary"
        :text="`${valuesProfile.length ? 'Edit' : 'Start'} Values Profile`"
        class="ml-2"
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

    <v-tabs v-model="currentTab">
      <v-tab>Profile</v-tab>
      <v-tab>Values</v-tab>
      <v-tab>Recommendations</v-tab>
      <v-tab>Portfolios</v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
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

      <v-tabs-window-item class="py-4">
        <v-row>
          <v-col cols="6">
            <ul class="mx-4">
              <li v-for="v in valuesProfile">
                {{ v.question.text }} - {{ v.value }}
              </li>
            </ul>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <v-tabs-window-item class="py-4"> Recommendations </v-tabs-window-item>

      <v-tabs-window-item class="py-4">
        <v-alert title="No Portfolios" type="info" v-if="!portfolio"
          >No portfolios have been generated. Please click "Generate
          Recommendation" to do so.
        </v-alert>

        <pre v-else>{{ portfolio }}</pre>
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
} = useRoute();

const router = useRouter();
const $axios = inject('$axios');
const { show } = inject('toast');

const currentTab = ref();

const client = ref({});

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

const portfolio = ref();
const generateRecommendation = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_uuid}/clients/${user_uuid}/portfolio/`
    );

    portfolio.value = data;

    currentTab.value = 3;
  } catch (error) {
    show({ message: `Couldn't retrieve client information`, error: true });
  }
};
</script>
