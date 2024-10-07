<template>
  <!-- Firm-specific content goes here -->
  <div v-if="!isSuper">

    <v-btn
        color="primary"
        @click="downloadCSV(billingData, billingHeaders, 'billing')"
        size="small"
        class="mb-4 mt-4 float-right"
    >Download CSV
    </v-btn>

    <v-data-table
        :headers="billingHeaders"
        :items="billingData"
        :items-per-page="10"
        class="elevation-1"
    >
      <!-- template for account name to be a link to the account edit page -->
      <template #item.account_name="{ item }">
        <router-link
            :to="{
          name: 'Accounts',
          params: { user_id: item.user_id },
          query: { account_id: item.id },
        }">
          {{ item.account_name }}
        </router-link>
      </template>

      <template #bottom v-if="billingData.length < 10"></template>
    </v-data-table>

  </div>

  <!-- Super user content -->
  <div v-else>

    <v-btn
        color="primary"
        @click="downloadCSV(billingDataSuper, billingHeaders, 'billing')"
        size="small"
        class="mb-4 mt-4 float-right"
    >Download CSV
    </v-btn>

    <v-data-table
        :headers="billingHeaders"
        :items="billingDataSuper"
        :items-per-page="10"
        class="elevation-1"
    >
      <!-- template for account name to be a link to the account edit page -->
      <template #item.account_name="{ item }">
        <router-link
            :to="{
          name: 'Accounts',
          params: { user_id: item.user_id },
          query: { account_id: item.id },
        }">
          {{ item.account_name }}
        </router-link>
      </template>
      <template #bottom v-if="billingDataSuper.length < 10"></template>
    </v-data-table>
  </div>


</template>

<script setup>
import {ref, onMounted, inject, computed,} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {parseError} from '@/utils/error';
import {addCommas, formatDate, feeRatePercentage} from '@/utils/string';
import {downloadCSV} from '@/utils/file';

const $axios = inject('$axios');
const {show} = inject('toast');

const {user} = storeToRefs(useUserStore());
const firmId = computed(() => user.value.firm.id);


const adminData = ref({});
const allFirms = ref([]);
const adminDataSuper = ref([]);

const advisorsLength = ref(0)
const clientsLength = ref(0)
const accountsLength = ref(0)


const billingHeaders = [
  {title: 'Client', key: 'user_name'},
  {title: 'Account', key: 'account_name'},
  {title: 'Start Date', key: 'created_at', nowrap: true}, // just the day
  {title: 'End Date', key: 'closed_at'},
  {title: 'Account Value', key: 'value'}, // no decimals add commas
  {title: 'Monthly Fee Rate', key: 'fee_rate'}, // show as percentage 3 decimal places
  {title: 'Monthly Fee', key: 'total'}
];

const fetchAdminData = async () => {
  try {

    const response = await $axios.get(`/api/firms/${firmId.value}/advisors/`);
    firmAdvisorList.value = response.data
    console.log("Here is the advisor list:", firmAdvisorList.value)
  } catch (error) {
    console.error('Error fetching billing data:', error); // Log the error
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

const isSuper = ref(false);

// Check if the user is a super user
if (user.value.role === 'super') {
  isSuper.value = true;
}


//fetch firms
const fetchFirms = async () => {
  try {
    const response = await $axios.get('/api/firms/');
    response.data.forEach((firm) => {
      allFirms.value.push({
        id: firm.id,
      });
    });
    await fetchBillingDataSuper()
  } catch (error) {
    console.error('Error fetching firms:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

//get billing data for all firms for super users

const fetchBillingDataSuper = async () => {
  for (const firm of allFirms.value) {
    try {
      const response = await $axios.get(`/api/billing/${firm.id}/data/`);
      const newData = response.data.map((data) => {
        const total = totalCalc(Number(data.value), data.fee_rate);
        const totalWithCommas = addCommas(total);
        const createdAt = formatDate(data.created_at);
        const feeRate = feeRatePercentage(data.fee_rate);
        const valueWithCommas = addCommas(Number(data.value), true);
        return {
          ...data,
          total: totalWithCommas,
          created_at: createdAt,
          fee_rate: feeRate,
          value: valueWithCommas,
        };
      });
      billingDataSuper.value = billingDataSuper.value.concat(newData);
      deleteArchived(billingDataSuper);
      deleteInActive(billingDataSuper);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      const parsedError = parseError(error);
      show({type: 'error', message: parsedError.message});
    }
  }
};

const totalCalc = (value, fee_rate) => {
  return (value * fee_rate).toFixed(2);
};

const deleteArchived = (data) => {
  data.value = data.value.filter((item) => !item.is_archived);
};

const deleteInActive = (data) => {
  data.value = data.value.filter((item) => item.is_active);
};

// Fetch billing data based on the user role
onMounted(() => {
  if (isSuper.value) {
    fetchFirms();
  } else {
    fetchAdminData();
  }
});
</script>