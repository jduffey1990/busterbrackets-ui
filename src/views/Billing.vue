<template>
  <!-- Main container that checks if the user is associated with a firm -->
  <!-- <div v-if="isFirmAdminOrGreater">

  </div> -->
    

    <v-alert v-if="isSuper">
      looking at super page
    </v-alert>

    <v-alert v-else>
      looking at firm admin page
    </v-alert>

    <!-- Firm-specific content goes here -->
    <v-data-table v-if="!isSuper"
      :headers="billingHeaders"
      :items="billingData"
      :items-per-page="10"
      class="elevation-1"
      >
    </v-data-table>

  <!-- Super user content -->
   <div v-else>
      <v-data-table
        :headers="billingHeaders"
        :items="billingDataSuper"
        :items-per-page="10"
        class="elevation-1"
        >
      </v-data-table>

      <!-- <v-data-table
        :headers="payStatusHeaders"
        :items="billingDataSuper"
        :items-per-page="10"
        class="elevation-1"
        >

          <template v-slot:item.payment_status="{ item }">
            <v-checkbox>
            </v-checkbox>
            
          </template>

      </v-data-table> -->
   </div>
    

</template>

<script setup>
import {ref, onMounted, inject, computed,} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {parseError} from '@/utils/error';

const $axios = inject('$axios');
const {show} = inject('toast');

const {user} = storeToRefs(useUserStore());
const firmId = computed(() => user.value.firm.id);

const billingData = ref([]);
const allFirms = ref([]);
const billingDataSuper = ref([]);


const billingHeaders = [
  {title: 'Firm Name', key: 'firm_name'},
  {title: 'Advisor Name', key: 'advisor_name'},
  {title: 'User Name', key: 'user_name'},
  {title: 'Account Name', key: 'account_name'},
  {title: 'Created At', key: 'created_at', nowrap: true},
  {title: 'Closed At', key: 'closed_at'},
  {title: 'Value', key: 'value'},
  {title: 'Fee Rate', key: 'fee_rate'},
  {title: 'Total', key: 'total'},
];

// const payStatusHeaders = [
//   {title: 'Firm Name', key: 'firm_name'},
//   {title: 'Account Name', key: 'account_name'},
//   {title: 'Amount', key: 'total'},
//   {title: 'Payment Status', key: 'payment_status', nowrap: true, width: 0},
// ];

const fetchBillingData = async () => {
  try {
    const response = await $axios.get(`/api/billing/${firmId.value}/data/`);
    billingData.value = response.data;
    // Calculate the total for each billing data
    billingData.value.forEach((data) => {
      data.total = totalCalc(data.value, data.fee_rate);
    });
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
    // fetch billing data for after getting firm ids
    fetchBillingDataSuper();
  } catch (error) {
    console.error('Error fetching firms:', error);
    const parsedError = parseError(error);
    show({ type: 'error', message: parsedError.message });
  }
};

//get billing data for all firms for super users

const fetchBillingDataSuper = async () => {
  for (const firm of allFirms.value) {
    console.log('firm id:', firm.id);
    try {
      const response = await $axios.get(`/api/billing/${firm.id}/data/`);
      billingDataSuper.value = billingDataSuper.value.concat(response.data);
      billingDataSuper.value.forEach((data) => {
      data.total = totalCalc(data.value, data.fee_rate);
    });
    } catch (error) {
      console.error('Error fetching billing data:', error);
      const parsedError = parseError(error);
      show({ type: 'error', message: parsedError.message });
    }
  }
  console.log('billing data super', billingDataSuper.value);
}

//pay status change
  

// Function to calculate the total
const totalCalc = (value, fee_rate) => {
  return (value * fee_rate).toFixed(2);
};
// Fetch billing data based on the user role
onMounted(() => {
  if (isSuper.value) {
    fetchFirms();
  } else {
    fetchBillingData();
  }
});
</script>
