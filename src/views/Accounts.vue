<template>
  <v-form @submit.prevent="createAccount()">
    <div class="d-flex my-4 align-center">
      <div class="text-h4 my-4">Create New Account</div>
      <v-spacer></v-spacer>
      <v-btn class="ml-2" text="Back" @click="goBack()"></v-btn>

      <v-btn class="ml-2" color="primary" text="Save" type="submit"></v-btn>
    </div>

    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="account.name"
          label="Account Name"
          class="mb-4"
        ></v-text-field>

        <v-select
          v-if="accountTypes"
          label="Account Type"
          class="mb-4"
          v-model="account.account_type"
          :items="accountTypes"
          item-title="title"
          item-value="value"
        ></v-select>

        <v-select
          label="Custodian"
          class="mb-4"
          v-model="account.custodian"
          :items="custodians"
          item-title="title"
          item-value="value"
        ></v-select>

        <v-text-field
          class="mb-4"
          v-model="account.value"
          label="Account Market Value"
          type="number"
        ></v-text-field>

        <v-select
          label="Risk Tolerance"
          class="mb-4"
          v-model="account.risk_tolerance"
          :items="riskTolerances"
          item-title="title"
          item-value="value"
        ></v-select>

        <v-text-field
          label="Last 4 of Account Number"
          class="mb-4"
          v-model="account.last_four"
          type="tel"
          maxlength="4"
        ></v-text-field>

        <v-radio-group v-model="account.fractional" class="mb-4" inline>
          <template v-slot:label> Fractional </template>
          <v-radio :value="true">
            <template v-slot:label> Yes </template>
          </v-radio>
          <v-radio :value="false">
            <template v-slot:label> No </template>
          </v-radio>
        </v-radio-group>

        <v-radio-group v-model="account.active" class="mb-4" inline>
          <template v-slot:label> Active </template>
          <v-radio :value="true">
            <template v-slot:label> Yes </template>
          </v-radio>
          <v-radio :value="false">
            <template v-slot:label> No </template>
          </v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { inject } from 'vue';
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const $axios = inject('$axios');

const { show } = inject('toast');

const router = useRouter();

const custodians = [
  { value: 'altruist', title: 'Altruist' },
  { value: 'schwab', title: 'Schwab' },
  { value: 'fidelity', title: 'Fidelity' },
  { value: 'raymond_james', title: 'Raymond James' },
  { value: 'pershing', title: 'Pershing' },
];

const riskTolerances = [
  { value: 0, title: 'Very Low' },
  { value: 1, title: 'Low' },
  { value: 2, title: 'Moderate' },
  { value: 3, title: 'High' },
  { value: 4, title: 'Very High' },
];

const account = reactive({
  name: undefined,
  active: true,
  account_type: undefined,
  custodian: undefined,
  value: undefined,
  fractional: false,
  risk_tolerance: undefined,
  last_four: undefined,
});

const {
  user: { id: advisor_id },
} = useUserStore();

const {
  params: { user_id },
} = useRoute();

const createAccount = async () => {
  try {
    await $axios.post(
      `/api/advisors/${advisor_id}/clients/${user_id}/accounts/`,
      account
    );

    goBack();

    show({ message: 'Account created!' });
  } catch (error) {
    show({ message: `Couldn't create account`, error: true });
  }
};

const goBack = () => {
  router.push(`/clients/${user_id}#accounts`);
};

const accountTypes = ref([]);
onMounted(async () => {
  const { data } = await $axios.get('/api/accounts/types/');
  accountTypes.value = data;
});
</script>
