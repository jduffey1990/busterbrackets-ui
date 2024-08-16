<template>
  <!-- Form for creating a new account -->
  <v-form @submit.prevent="save">
    <div class="d-flex my-4 align-center">
      <div class="text-h4 my-4">Account Details</div>
    </div>

    <v-row>
      <v-col cols="6">
        <!-- Account Name Input -->
        <v-text-field
            v-model="account.name"
            label="Account Name"
            class="mb-4"
        ></v-text-field>

        <!-- Account Type Select -->
        <v-select
            v-if="accountTypes"
            label="Account Type"
            class="mb-4"
            v-model="account.account_type"
            :items="accountTypes"
            item-title="title"
            item-value="value"
        ></v-select>

        <!-- Custodian Select -->
        <v-select
            label="Custodian"
            class="mb-4"
            v-model="account.custodian"
            :items="custodians"
            item-title="title"
            item-value="value"
        ></v-select>

        <!-- Account Market Value Input -->
        <v-text-field
            class="mb-4"
            v-model="account.value"
            label="Account Market Value"
            type="text"
            @keydown="removeCommas(account.value)"
            @keyup="account.value = addCommas(account.value)"
        ></v-text-field>

        <!-- Risk Tolerance Select -->
        <v-select
            label="Risk Tolerance"
            class="mb-4"
            v-model="account.risk_tolerance"
            :items="riskTolerances"
            item-title="title"
            item-value="value"
        ></v-select>

        <!-- Last 4 of Account Number Input -->
        <v-text-field
            label="Last 4 of Account Number"
            class="mb-4"
            v-model="account.last_four"
            type="tel"
            maxlength="4"
        ></v-text-field>

        <!-- Live Account Select -->
        <v-select
            label="Live Account"
            class="mb-4"
            v-model="account.active"
            :items="yesNoBooleans"
            item-title="title"
            item-value="value"
        ></v-select>

        <!-- Buttons for navigating back and saving -->
        <div class="d-flex justify-end mb-4">
          <v-btn class="ml-2" text @click="goBack">Back</v-btn>
          <v-btn class="ml-2" color="primary" text type="submit">Save</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
// Import necessary modules and functions from Vue
import {ref, reactive, onMounted, inject} from 'vue';
import {useRoute, useRouter, onBeforeRouteLeave} from 'vue-router';
import {useUserStore} from '@/store/user';
import {parseError} from '@/utils/error';
import {isEqual, cloneDeep} from 'lodash';
import { addCommas } from '@/utils/string';

// Inject axios and toast services
const $axios = inject('$axios');
const {show} = inject('toast');

// Get router instance for navigation
const router = useRouter();

// Define static data for selects
const custodians = [
  {value: 'altruist', title: 'Altruist'},
  {value: 'schwab', title: 'Schwab'},
  {value: 'fidelity', title: 'Fidelity'},
  {value: 'raymond_james', title: 'Raymond James'},
  {value: 'pershing', title: 'Pershing'},
];

const riskTolerances = [
  {value: 0, title: 'Very Low'},
  {value: 1, title: 'Low'},
  {value: 2, title: 'Moderate'},
  {value: 3, title: 'High'},
  {value: 4, title: 'Very High'},
];

const yesNoBooleans = [
  {value: false, title: 'No'},
  {value: true, title: 'Yes'},
];

// Extract user data from the store
const {user: {id: advisor_id}} = useUserStore();

// Extract route parameters and query
const {params: {user_id}, query: {account_id}} = useRoute();

// Define state variables
const accountTypes = ref([]);
const account = reactive({});
let accountCopy = {};

// Function to save the account data
const save = async () => {
  try {
    if (account_id) {
      removeCommas(account.value);
      await $axios.patch(`/api/accounts/${account_id}/`, account);
      show({message: 'Account saved!'});
    } else {
      removeCommas(account.value);
      await $axios.post(`/api/advisors/${advisor_id}/clients/${user_id}/accounts/`, account);
      show({message: 'Account created!'});
    }
    setAccountData(account);
    goBack();
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

const lastUrl = window.history.state.back;

const goBack = () => {
  lastUrl === "/billing" ? router.push(lastUrl) : router.push(`/clients/${user_id}#accounts`);
};

// Function to set account data and make a copy for comparison
const setAccountData = (data) => {
  Object.assign(account, data || initialState);
  accountCopy = cloneDeep(account);
};

//function to remove commas from 1,000,000 to 1000000
const removeCommas = (value) => {
  return account.value = Number(value.replace(/,/g, ''));
};



// Fetch account types and initial account data on component mount
onMounted(async () => {
  const {data: accountTypeData} = await $axios.get('/api/accounts/types/');
  accountTypes.value = accountTypeData;

  let initialAccountData;
  if (account_id) {
    const {data: accountData} = await $axios.get(`/api/accounts/${account_id}/`);
    accountData.value = addCommas(accountData.value);
    initialAccountData = accountData;
  }
  setAccountData(initialAccountData);
});

// Check for unsaved changes before leaving the route
onBeforeRouteLeave((to, from, next) => {
  if (!isEqual(account, accountCopy)) {
    if (confirm('Do you really want to leave? you have unsaved changes!')) {
      next();
    }
    return;
  }
  next();
});

// Initial state of the account
const initialState = {
  name: undefined,
  active: true,
  account_type: undefined,
  custodian: undefined,
  value: undefined,
  risk_tolerance: undefined,
  last_four: undefined,
};
</script>
