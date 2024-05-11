<template>
  <v-form @submit.prevent="createAccount()">
    <div class="d-flex my-6 align-center">
      <div class="text-h4 my-6">Create New Account</div>
      <v-spacer></v-spacer>

      <v-checkbox class="ml-4" v-model="account.active" label="Active?">
      </v-checkbox>

      <v-checkbox class="ml-4" v-model="account.fractional" label="Fractional?">
      </v-checkbox>

      <v-btn class="ml-4" color="primary" text="Save" type="submit"></v-btn>
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
          label="Account Value"
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
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import router from '@/router';
import { useUserStore } from '@/store/user';
import { inject } from 'vue';
import { reactive } from 'vue';
import { useRoute } from 'vue-router';
const $axios = inject('$axios');

const { show } = inject('toast');

// const accountTypes = [
//   { value: 'individual', title: 'Individual' },
//   { value: 'jtbe', title: 'Joint Tenants by the Entirety (JTBE)' },
//   { value: 'jtic', title: 'Joint Tenants in Common (JTIC)' },
// ];

const custodians = [
  { value: 'altruist', title: 'Altruist' },
  { value: 'schwab', title: 'Schwab' },
  { value: 'fidelity', title: 'Fidelity' },
  { value: 'raymond_jones', title: 'Raymond Jones' },
  { value: 'pershing', title: 'Pershing' },
];

const riskTolerances = [
  { value: 0, title: 'Low Risk' },
  { value: 1, title: 'Medium Risk' },
  { value: 2, title: 'High Risk' },
];

const account = reactive({
  name: undefined,
  active: true,
  account_type: undefined,
  custodian: undefined,
  value: undefined,
  fractional: false,
  risk_tolerance: undefined,
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

    router.push({
      name: 'Client',
      hash: '#accounts',
    });

    show({ message: 'Account created!' });
  } catch (error) {
    show({ message: `Couldn't create account`, error: true });
  }
};

const { data: accountTypes } = await $axios.get('/api/accounts/types/');
</script>
