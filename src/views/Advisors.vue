<template>
      <!-- Header for the Advisors section -->
      <div class="text-h4 my-4">Advisors</div>

      <!-- Data table displaying the list of advisors with action buttons -->
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
            @update:model-value="filterAdvisors(chosenAdvisor.id)"
        ></v-select>
      </div>
      <v-data-table :items="advisors" :headers="headers">
        <template v-slot:item.actions="{ item }">
          <!-- Button to edit advisor preferences -->
          <v-btn
            color="primary"
            @click="editPreferences(item)"
            size="small"
            class="ml-2"
          >
        Edit Preferences
          </v-btn>

          <!-- Button to copy reset password URL to clipboard -->
          <v-btn
            color="info"
            @click="copyText(item)"
            size="small"
            v-if="item.reset_password_link"
            class="ml-2"
          >
            Get Reset Password URL
          </v-btn>
        </template>
      </v-data-table>

    <div class="d-flex mt-8">    
        

        <!-- Data table to display the accounts for the chosen advisor -->
        <!-- <div class="csv-download">
          <v-btn
              color="primary"
              @click="downloadCSV(allData, accountHeaders, 'billing')"
              size="small"
              class="mb-4 mt-4 float-right"
          >Download CSV firm data
          </v-btn>

        </div> -->
        <!-- <v-data-table
            v-if="chosenAdvisor && accountsData[chosenAdvisor.id]"
            :headers="accountHeaders"
            :items="accountsData[chosenAdvisor.id]"
            class="elevation-1"
            :no-data-text="noResultsText"
        >
          <template v-slot:item.value="{ item }">
            {{ addCommas(item.value) }}
          </template>
          <template v-slot:item.deleted_at="{ item }">
            {{ item.deleted_at === "Invalid date" ? "Active Account" : formatDate(item.deleted_at) }}
          </template>
          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
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

        </v-data-table> -->
        <!-- <v-alert
            v-else
            title="Select an advisor to see associated accounts"
            type="secondary"
            class="my-4"
        >
          If an advisor has no associated clients, they can add clients by taking a survey with the client from the
          <router-link :to="{ name: 'Dashboard' }">Dashboard</router-link>
        </v-alert> -->
      
      <v-card
        :title="advisorsLength"
        text="Advisors"
        width="200"
        style="text-align: center;"
        class="mr-4"
      >
      </v-card>


      <!-- Clients Card -->

      <v-card
        :title="clientsLength"
        text="Clients with Accounts"
        width="200"
        style="text-align: center;"
        class="mx-4"
      >
      </v-card>


      <!-- Accounts Card -->

      <v-card
        :title="accountsLength"
        text="Accounts"
        width="200"
        style="text-align: center;"
        class="mx-4"
      >
      </v-card>
    </div>
      <Reports v-if="loadReports" :chosenAdvisorId="chosenAdvisor"/>
</template>

<script setup>
import {ref, onMounted, inject, computed, watch,} from 'vue';
import {useRouter} from 'vue-router';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {parseError} from "@/utils/error";
import Billing from './AdminAccounts.vue';
import AdminAccounts from "@/views/AdminAccounts.vue";
import Reports from '@/components/Reports.vue';
import {downloadCSV} from '@/utils/file';
import {addCommas, formatDate, funLookAtFunction} from '@/utils/string';''


// Injecting axios and toast services
const $axios = inject('$axios');
const {show} = inject('toast');
const currentTab = ref();

const {user} = storeToRefs(useUserStore());
const firmId = computed(() => chosenFirm.value ? chosenFirm.value.id : user.value.firm.id);

// Initializing router instance
const router = useRouter();

const loadReports = ref(true);

const relaodReports = () => {
  loadReports.value = false;
  setTimeout(() => {
    loadReports.value = true;
  }, 100);
};

// Headers for the data table
const headers = [
  {key: 'actions', sortable: false, width: 0, nowrap: true},
  {title: 'Full Name', key: 'full_name', width: 0, nowrap: true},
  {title: 'Email', key: 'email', width: 0, nowrap: true},
  {title: 'Created At', key: 'created_at', width: 0, nowrap: true},
  {},
];

// Reactive variable to store the list of advisors
const advisors = ref([]);
const advisorsCopy = ref([]);

// Function to fetch the list of advisors from the API
const getAdvisors = async () => {
  try {
    const {data} = await $axios.get(`/api/advisors/`);
    // format date for created_at
    data.forEach(advisor => {
      advisor.created_at = new Date(advisor.created_at).toLocaleString();
    });
    advisors.value = data;
    advisorsCopy.value = data;
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

// Fetch the list of advisors on component mount
getAdvisors();

// Function to filter the list of advisors based on the selected advisor
const filterAdvisors = (advisor) => {
  console.log(advisor);
  console.log(advisors.value);
  if (advisor) {
    advisors.value = advisorsCopy.value.filter((item) => item.id === advisor);
  } else {
    advisors.value = advisorsCopy.value;
  }
  relaodReports();
};


// Function to navigate to the advisor's preferences page
const editPreferences = (item) => {
  router.push(`/advisors/${item.id}/preferences`);
};

// Function to copy the reset password URL to clipboard and show a toast notification
const copyText = (item) => {
  navigator.clipboard.writeText(item.reset_password_link);
  show({message: `Link copied to clipboard!`});
};

// admin stuff 
const accountsData = ref({});
const allFirms = ref([]);
const firmAdvisorList = ref([]);
const chosenAdvisor = ref(null);
const chosenFirm = ref(null);
const emit = defineEmits(['updateChosenFirm']);
const allData = ref([])
const noResultsText = ref("This advisor has no active accounts under advisement")

const advisorsLength = ref(0)
const clientsLength = ref(0)
const accountsLength = ref(0)

const accountHeaders = [
  {title: 'Client', key: 'user_name'},
  {title: 'Account', key: 'account_name'},
  {title: 'Last Four', key: 'last_four'},
  {title: 'Acc Start', key: 'created_at'},
  {title: 'Acc End', key: 'deleted_at'},
  {title: 'Acc Value', key: 'value'}
];

const fetchAdminData = async () => {
  try {

    const response = await $axios.get(`/api/firms/${firmId.value}/advisors-and-admin/`);
    firmAdvisorList.value = response.data;
    advisorsLength.value = firmAdvisorList.value.length;

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

  } catch (error) {
    console.error('Error fetching billing data:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

const flattenAccountsData = (accountsData) => {
  // Flatten the accountsData object into a single array of accounts
  return Object.values(accountsData).flat();
};

const fetchAdvisorClients = async (advisor_id, accountsArray, clientsSet) => {
  try {
    const response = await $axios.get(`/api/billing/${advisor_id}/account-data/`);

    // Store accounts in accountsData by advisor ID
    accountsData.value[advisor_id] = response.data;
    response.data.forEach((data) => {
      data.created_at = formatDate(data.created_at);
      data.value = addCommas(data.value, true);
      data.deleted_at = data.deleted_at === "Invalid date" ? "Active Account" : formatDate(data.deleted_at);

      allData.value.push(data)
    });


    // Add the accounts to the accountsArray for length calculation and ensure no duplicate clients
    response.data.forEach((account) => {
      if (!clientsSet.has(account.user_name)) {
        clientsSet.add(account.user_name);
      }
      accountsArray.push(account);  // Add account to the total accountsArray
    });

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
    emit('updateChosenFirm', newFirm);
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

.csv-download {
  display: flex;
  align-items: center;
  justify-content: end;
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

