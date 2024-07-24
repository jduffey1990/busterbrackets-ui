<template>
  <!-- Main container that checks if the user is associated with a firm -->
  <div v-if="isFirmAdminOrGreater">
    <!-- Header section with the firm name and button to create a new advisor -->
    <template v-if="isSuper">
      <p>looking at super page</p>
    </template>

    <!-- Tabs for navigation, showing the number of advisors -->
    <template v-else>
      <p>looking at firm admin page</p>
    </template>
  </div>
</template>

<script setup>
import {ref, onMounted, inject, computed} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {parseError} from '@/utils/error';

const $axios = inject('$axios');
const {show} = inject('toast');

const {user} = storeToRefs(useUserStore());
const firmId = computed(() => user.value.firm.id);

const billingData = ref([]);
const billingHeaders = [
  {text: 'Firm Name', value: 'firm_name'},
  {text: 'Advisor Name', value: 'advisor_name'},
  {text: 'User Name', value: 'user_name'},
  {text: 'Account Name', value: 'account_name'},
  {text: 'Created At', value: 'created_at'},
  {text: 'Value', value: 'value'},
  {text: 'Fee Rate', value: 'fee_rate'}
];
const fetchBillingData = async () => {
  try {
    console.log('Firm Id:', firmId.value);
    const response = await $axios.get(`/api/billing/${firmId.value}/data/`);
    console.log('Response:', response); // Log the response
    billingData.value = response.data;
    console.log('Billing Data:', billingData.value);
  } catch (error) {
    console.error('Error fetching billing data:', error); // Log the error
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

onMounted(() => {
  fetchBillingData();
});
</script>
