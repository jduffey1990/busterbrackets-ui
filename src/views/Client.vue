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
        text="Create Survey"
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

    <div v-if="values.length">
      <div class="text-h6">Values</div>

      <ul class="mx-4">
        <li v-for="v in values">{{ v.question.text }} - {{ v.value }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { uuid } = useRoute().params;

const router = useRouter();
const $axios = inject('$axios');
const { show } = inject('toast');

const client = ref({});

const getClient = async () => {
  const { data } = await $axios.get(`/api/advisors/clients/${uuid}/`);

  client.value = data;
};

getClient();

const values = ref([]);

const getValues = async () => {
  const { data } = await $axios.get(`/api/advisors/clients/${uuid}/responses/`);

  values.value = data;
};

getValues();

const generateRecommendation = () => {
  show({ message: 'Generating recommendation will be available shortly...' });
};
</script>
