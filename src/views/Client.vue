<template>
  <div>
    <div class="d-flex my-6">
      <div class="text-h4">{{ client.full_name }} Values Profile</div>

      <v-spacer></v-spacer>

      <v-btn
        color="secondary"
        text="Generate Recommendation"
        class="ml-2"
        @click="generateRecommendation()"
      ></v-btn>

      <v-btn
        color="primary"
        :text="`${valuesProfile.length ? 'Edit' : 'Start'} Values Profile`"
        class="ml-2"
        @click="router.push(`/clients/${client.uuid}/survey`)"
      ></v-btn>
    </div>

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

    <v-row>
      <v-col cols="6">
        <div class="text-h6">Values</div>

        <ul class="mx-4">
          <li v-for="v in valuesProfile">
            {{ v.question.text }} - {{ v.value }}
          </li>
        </ul>
      </v-col>

      <v-col cols="6">
        <div class="text-h6">Companies</div>

        <v-row>
          <v-col cols="6">
            <div>Likes</div>

            <ul class="mx-4">
              <li v-for="c in companyPreferences.filter((c) => c.is_preferred)">
                {{ c.company.name }} ({{ c.company.ticker }})
              </li>
            </ul>
          </v-col>

          <v-col cols="6">
            <div>Dislikes</div>

            <ul class="mx-4">
              <li
                v-for="c in companyPreferences.filter((c) => !c.is_preferred)"
              >
                {{ c.company.name }} ({{ c.company.ticker }})
              </li>
            </ul>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
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
  getCompanyPreferences,
} = useUserStore();

const { valuesProfile, companyPreferences } = storeToRefs(useUserStore());

const {
  params: { client_uuid },
} = useRoute();

const router = useRouter();
const $axios = inject('$axios');
const { show } = inject('toast');

const client = ref({});

const getClient = async () => {
  const { data } = await $axios.get(
    `/api/advisors/${advisor_uuid}/clients/${client_uuid}/`
  );

  client.value = data;
};

getClient();

onMounted(async () => {
  await getValuesProfile({
    advisor_uuid,
    client_uuid,
  });

  await getCompanyPreferences({
    advisor_uuid,
    client_uuid,
  });
});

const generateRecommendation = () => {
  show({ message: 'Generating recommendation will be available shortly...' });
};
</script>
