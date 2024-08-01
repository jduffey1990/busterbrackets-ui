<template>

    <v-alert v-if="isSuper">
      looking at super page
    </v-alert>

    <v-alert v-else>
      looking at firm admin page
    </v-alert>

    <!-- Firm-specific content goes here -->
  <div v-if="!isSuper">

    <v-btn
          color="primary"
          @click="downloadBillingDataCSV(billingData)"
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
    </v-data-table>

  </div>

  <!-- Super user content -->
   <div v-else>

      <v-btn
          color="primary"
          @click="downloadBillingDataCSV(billingDataSuper)"
          size="small"
          class="mb-4 mt-4 float-right"
      >Download CSV
      </v-btn>

      <v-data-table
        :headers="billingHeaders"
        :items="billingDataSuper"
        :items-per-page="10"
        class="elevation-1 super-table"
        >
      </v-data-table>
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
  {title: 'Firm', key: 'firm_name'},
  {title: 'Advisor ', key: 'advisor_name'},
  {title: 'Client', key: 'user_name'},
  {title: 'Account', key: 'account_name'},
  {title: 'Start Date', key: 'created_at', nowrap: true}, // just the day 
  {title: 'End Date', key: 'closed_at'},
  {title: 'Account Value', key: 'value'}, // no decimals add commas
  {title: 'Monthly Fee Rate', key: 'fee_rate'}, // show as percentage 3 decimal places
  {title: 'Monthly Fee', key: 'total'}
];

const fetchBillingData = async () => {
  try {
    const response = await $axios.get(`/api/billing/${firmId.value}/data/`);
    billingData.value = response.data;
    // Calculate the total for each billing data
    billingData.value.forEach((data) => {
      data.total = totalCalc(data.value, data.fee_rate);
      data.created_at = trimDate(data.created_at);
      data.value = addCommas(data.value);
      data.fee_rate = feeRatePercentage(data.fee_rate);
      data.total = addCommasTotal(data.total);
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
      const newData = response.data.map((data) => {
        const total = totalCalc(data.value, data.fee_rate);
        const totalWithCommas = addCommasTotal(total);
        const createdAt = trimDate(data.created_at);
        const feeRate = feeRatePercentage(data.fee_rate);
        const valueWithCommas = addCommas(data.value);
        return {
          ...data,
          total: totalWithCommas,
          created_at: createdAt,
          fee_rate: feeRate,
          value: valueWithCommas,
        };
      });
      billingDataSuper.value = billingDataSuper.value.concat(newData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      const parsedError = parseError(error);
      show({ type: 'error', message: parsedError.message });
    }
  }
  console.log('billing data super', billingDataSuper.value);
};

// Function to calculate the total
const totalCalc = (value, fee_rate) => {
  return (value * fee_rate).toFixed(2);
};

//function to trim the created_at date
const trimDate = (date) => {
  return date.split('T')[0];
};

//function to add commas to the value and get rid of decimals
const addCommas = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',').split('.')[0];
};

//function to add commas to total
const addCommasTotal = (total) => {
  return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

//function to show fee rate as percentage with 3 decimal places and add percentage sign
const feeRatePercentage = (fee_rate) => {
  return (fee_rate * 100).toFixed(3) + '%';
};

// Function to download billingData as CSV
const downloadBillingDataCSV = (data) => {
  const headers = billingHeaders.map(header => header.title).join(",");

  let csvContent = headers + "\n";

  data.forEach(row => {
    const rowContent = billingHeaders.map(header => {
      const value = row[header.key];
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(",");
    csvContent += rowContent + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "billingData.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
