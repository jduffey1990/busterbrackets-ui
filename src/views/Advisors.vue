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
            @update:model-value="resetToAll()"
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
      <Reports v-if="loadReports" :chosenAdvisorId="chosenAdvisor" :chosenFirmId="chosenFirm" :advisorLength="advisorsLength"/>
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
  if (advisor) {
    advisors.value = advisorsCopy.value.filter((item) => item.id === advisor);
  } else {
    advisors.value = advisorsCopy.value;
  }
  relaodReports();
};

const resetToAll = () => {
  advisors.value = advisorsCopy.value;
  chosenAdvisor.value = null;
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

const fetchAdminData = async () => {
  try {
    const url = chosenFirm.value === null || chosenFirm.value.id  === null ? `/api/firms/${user.value.firm.id}/advisors-and-admin/` : `/api/firms/${firmId.value}/advisors-and-admin/`;
    const response = await $axios.get(url);
    if (chosenFirm.value === null || chosenFirm.value.id === null) {
      firmAdvisorList.value = response.data;
      advisorsLength.value = firmAdvisorList.value.length;
    } else {
    firmAdvisorList.value = response.data.filter((advisor) => advisor.firm.id === firmId.value);
    advisorsLength.value = firmAdvisorList.value.length;
    }

  } catch (error) {
    console.error('Error fetching billing data:', error);
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
    allFirms.value.push({id: null, name: 'All Firms'});
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

