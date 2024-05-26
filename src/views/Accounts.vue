<template>
  <v-form @submit.prevent="save()">
    <div class="d-flex my-4 align-center">
      <div class="text-h4 my-4">Create New Account</div>
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

        <v-select
          label="Fractional"
          class="mb-4"
          v-model="account.fractional"
          :items="yesNoBooleans"
          item-title="title"
          item-value="value"
        ></v-select>

        <v-select
          label="Active"
          class="mb-4"
          v-model="account.active"
          :items="yesNoBooleans"
          item-title="title"
          item-value="value"
        ></v-select>

        <div class="d-flex justify-end mb-4">
          <v-btn class="ml-2" text="Back" @click="goBack()"></v-btn>

          <v-btn class="ml-2" color="primary" text="Save" type="submit"></v-btn>
        </div>
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
import { parseError } from '@/utils/error';

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

const yesNoBooleans = [
  { value: false, title: 'No' },
  { value: true, title: 'Yes' },
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
  query: { account_id },
} = useRoute();

const save = async () => {
  try {
    if (account_id) {
      await $axios.patch(`/api/accounts/${account_id}/`, account);

      show({ message: 'Account saved!' });
    } else {
      await $axios.post(
        `/api/advisors/${advisor_id}/clients/${user_id}/accounts/`,
        account
      );

      show({ message: 'Account created!' });
    }

    goBack();
  } catch (error) {
    show({ message: parseError(error), error: true });
  }
};

const goBack = () => {
  router.push(`/clients/${user_id}#accounts`);
};

const accountTypes = ref([]);
onMounted(async () => {
  const { data } = await $axios.get('/api/accounts/types/');
  accountTypes.value = data;

  if (account_id) {
    const { data } = await $axios.get(`/api/accounts/${account_id}/`);

    Object.assign(account, data);
  }
});
</script>
