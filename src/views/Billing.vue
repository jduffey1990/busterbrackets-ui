<template>
  <div>
    <!-- Cards displaying counts for advisors, clients, and accounts -->
    <!-- Cards displaying counts for advisors, clients, and accounts -->
    <v-row class="card-group">
      <!-- Advisors Card -->

      <v-card class="square-card" elevation="3">
        <v-card-title class="card-title"># of Advisors</v-card-title>
        <v-card-subtitle>
          <div class="circle">
            <span>{{ advisorsLength }}</span>
          </div>
        </v-card-subtitle>
      </v-card>


      <!-- Clients Card -->

      <v-card class="square-card" elevation="3">
        <v-card-title class="card-title"># of Clients</v-card-title>
        <v-card-subtitle>
          <div class="circle">
            <span>{{ clientsLength }}</span>
          </div>
        </v-card-subtitle>
      </v-card>


      <!-- Accounts Card -->

      <v-card class="square-card" elevation="3">
        <v-card-title class="card-title"># of Accounts</v-card-title>
        <v-card-subtitle>
          <div class="circle">
            <span>{{ accountsLength }}</span>
          </div>
        </v-card-subtitle>
      </v-card>

    </v-row>
    <div class="advisor-select-group">
      <v-select
          v-if="isSuper"
          v-model="chosenFirm"
          :items="allFirms"
          item-title="name"
          item-value="id"
          label="Select a Firm"
          return-object
          class="advisor-select"
      ></v-select>
    </div>
    <!-- Dropdown to select an advisor -->
    <div class="advisor-select-group">
      <v-select
          v-model="chosenAdvisor"
          :items="firmAdvisorList"
          item-title="full_name"
          item-value="id"
          label="Select an Advisor"
          return-object
          class="advisor-select"
      ></v-select>
    </div>

    <!-- Data table to display the accounts for the chosen advisor -->
    <v-data-table
        v-if="chosenAdvisor && accountsData[chosenAdvisor.id]"
        :headers="accountHeaders"
        :items="accountsData[chosenAdvisor.id]"
        class="elevation-1"
    >
      <template v-slot:item.value="{ item }">
        {{ addCommas(item.value) }}
      </template>
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

    </v-data-table>
    <v-alert
        v-else
        title="Select an advisor to see associated accounts"
        type="secondary"
        class="my-4"
    >
      Click "Take Survey with Client" to start adding clients to your list.
    </v-alert>
  </div>
</template>

<script setup>
import {ref, onMounted, inject, computed, watch,} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {parseError} from '@/utils/error';
import {addCommas, formatDate, feeRatePercentage} from '@/utils/string';
import {funLookAtFunction} from "@/utils/string";
import {downloadCSV} from '@/utils/file';
import {id} from "vuetify/locale";

const $axios = inject('$axios');
const {show} = inject('toast');

const {user} = storeToRefs(useUserStore());
const firmId = computed(() => chosenFirm.value ? chosenFirm.value.id : user.value.firm.id);


const accountsData = ref({});
const allFirms = ref([]);
const firmAdvisorList = ref([]);
const chosenAdvisor = ref(null);
const chosenFirm = ref(null);

const advisorsLength = ref(0)
const clientsLength = ref(0)
const accountsLength = ref(0)

const accountHeaders = [
  {title: 'Client', key: 'user_name'},
  {title: 'Account', value: 'account_name'},
  {title: 'Last Survey', value: 'last_survey_taken_date'},
  {title: 'Acc Start', value: 'created_at'},
  {title: 'Acc End', key: 'closed_at'},
  {title: 'Acc Value', key: 'value'}
];

const fetchAdminData = async () => {
  console.log("fetchAdminData function called");
  try {

    const response = await $axios.get(`/api/firms/${firmId.value}/advisors-and-admin/`);
    firmAdvisorList.value = response.data;
    advisorsLength.value = firmAdvisorList.value.length;

    console.log("Here is the advisor list:", firmAdvisorList.value);

    let accountsArray = [];
    let clientsSet = new Set();

    // Use Promise.all to wait for all asynchronous fetches
    await Promise.all(
        firmAdvisorList.value.map((advisor) =>
            fetchAdvisorClients(advisor.id, accountsArray, clientsSet)
        )
    );

    // Update the total accounts and clients
    accountsLength.value = accountsArray.length;
    clientsLength.value = clientsSet.size;

    // Log final accounts data object (keyed by advisor ID)
    console.log("Final accounts data (by advisor):", accountsData.value);

  } catch (error) {
    console.error('Error fetching billing data:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

const fetchAdvisorClients = async (advisor_id, accountsArray, clientsSet) => {
  try {
    const response = await $axios.get(`/api/billing/${advisor_id}/account-data/`);

    // Store accounts in accountsData by advisor ID
    accountsData.value[advisor_id] = response.data;

    // Add the accounts to the accountsArray for length calculation and ensure no duplicate clients
    response.data.forEach((account) => {
      if (!clientsSet.has(account.user_name)) {
        clientsSet.add(account.user_name);
      }
      accountsArray.push(account);  // Add account to the total accountsArray
    });

    console.log(`Accounts for advisor ${advisor_id}:`, accountsData.value[advisor_id]);
  } catch (error) {
    console.error('Error fetching accounts data:', error);
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
    allFirms.value = response.data
    console.log("here is the allfirms data", allFirms.value)
    await fetchAdminData()
  } catch (error) {
    console.error('Error fetching firms:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

//get billing data for all firms for super users

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

watch(chosenFirm, async (newFirm) => {
  if (newFirm) {
    await fetchAdminData();  // Fetch data for the newly selected firm
  }
});
</script>

<style scoped>

.card-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  margin-bottom: 150px;
}

.square-card {
  width: 100%;
  max-width: 300px;
  height: 300px;
  background-color: rgba(255, 255, 255, 0.2); /* Translucent background */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
  padding: 0;
}

.circle {
  background-color: rgba(255, 255, 255, 1); /* Opaque background */
  border-radius: 50%;
  height: 80px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin: 0 auto; /* Center horizontally */
}

.card-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.v-row.no-gutters {
  margin-right: 0;
  margin-left: 0;
}

.v-row.no-gutters > .v-col {
  padding-right: 0;
  padding-left: 0;
}

.advisor-select-group {
  display: flex;
  justify-content: start;
}

.advisor-select {
  max-width: 400px;
  margin-bottom: 20px;
}

@media only screen and (max-width: 1275px) {

  .card-group {
    margin-top: 40px;
    margin-bottom: 40px;
  }

  .square-card {
    max-width: 200px;
    height: 200px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
}

@media only screen and (max-width: 700px) {

  .card-group {
    flex-direction: column;
  }

  .square-card {
    max-width: 400px;
    height: 200px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .advisor-select-group {
    justify-content: center;
  }

}
</style>