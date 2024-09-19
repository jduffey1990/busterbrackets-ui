<template>
  <!-- Main container that checks if the user is associated with a firm -->
  <div v-if="user.firm">
    <!-- Header section with the firm name and button to create a new advisor -->
    <div class="d-flex my-4">
      <div class="text-h4">{{ user.firm?.name }} Admin Dashboard</div>
      <v-spacer></v-spacer>
      <v-btn
          @click="openCreateNewAdvisorModal = true"
          color="primary"
          text="Create New Advisor"
          class="ml-2"
      ></v-btn>
    </div>

    <!-- Tabs for navigation, showing the number of advisors -->
    <v-tabs v-model="currentTab">
      <v-tab>Advisors ({{ advisors.length }})</v-tab>
      <v-tab>Billing</v-tab>
    </v-tabs>

    <!-- Content of the selected tab -->
    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item>
        <!-- Table displaying advisors and action buttons -->
        <v-data-table :items="advisors" :headers="baseHeaders">
          <template v-slot:item.actions="{ item }">
            <!-- Button to view clients of the advisor -->
            <v-btn
                color="primary"
                @click="viewClients(item.id)"
                :disabled="displayState.currentAdvisorViewing !== null && displayState.currentAdvisorViewing !== item.id"
            >
              {{ !displayState[item.id]?.showClients ? displayState.hidden : displayState.shown }}
            </v-btn>
            <!-- Button to view prospects of the advisor -->
            <v-btn
                color="secondary"
                @click="viewProspects(item.id)"
                class="ml-5 secondary-btn"
                :disabled="displayState.currentAdvisorViewing !== null && displayState.currentAdvisorViewing !== item.id"
            >
              {{ !displayState[item.id]?.showProspects ? displayState.hiddenProspects : displayState.shownProspects }}
            </v-btn>
          </template>
        </v-data-table>

        <!-- Dynamic tables for clients and prospects of each advisor -->
        <template v-for="advisor in advisors" :key="advisor.id">
          <!-- Table for clients -->
          <v-data-table
              v-if="displayState[advisor.id]?.showClients"
              :headers="clientHeaders"
              :items="displayState[advisor.id]?.clients"
          >
            <template v-slot:item.actions="{ item }">
              <!-- Button to view a client -->
              <v-btn
                  color="primary"
                  class="ml-2"
                  size="small"
                  @click="goToClient(item)"
              >View Client
              </v-btn>
              <!-- Button to archive a client -->
              <v-btn
                  color="secondary"
                  class="ml-2 secondary-btn"
                  size="small"
                  @click="archiveClient(advisor.id, item)"
              >Archive
              </v-btn>
            </template>
          </v-data-table>

          <!-- Table for prospects -->
          <v-data-table
              v-if="displayState[advisor.id]?.showProspects"
              :headers="clientHeaders"
              :items="displayState[advisor.id]?.prospects"
          >
            <template v-slot:item.actions="{ item }">
              <!-- Button to accept a prospect -->
              <v-btn
                  color="primary"
                  class="ml-2"
                  size="small"
                  @click="acceptProspect(advisor.id, item)"
              >Accept Prospect
              </v-btn>
              <!-- Button to archive a prospect -->
              <v-btn
                  color="secondary"
                  class="ml-2 secondary-btn"
                  size="small"
                  @click="archiveProspect(advisor.id, item)"
              >Archive
              </v-btn>
            </template>
          </v-data-table>
        </template>
      </v-tabs-window-item>
      <v-tabs-window-item>
        <Billing/>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Dialog for creating a new advisor -->
    <v-dialog max-width="500" v-model="openCreateNewAdvisorModal">
      <v-card title="Create New Advisor">
        <v-card-text>
          <!-- Input fields for new advisor details -->
          <v-text-field
              v-model="newAdvisor.first_name"
              label="First name"
          ></v-text-field>
          <br/>
          <v-text-field
              v-model="newAdvisor.last_name"
              label="Last name"
          ></v-text-field>
          <br/>
          <v-text-field
              label="Email"
              type="email"
              v-model="newAdvisor.email"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- Buttons to cancel or save the new advisor -->
          <v-btn
              text="Cancel"
              @click="
              openCreateNewAdvisorModal = false;
              resetForm();
            "
          ></v-btn>
          <v-btn
              text="Save"
              color="primary"
              @click="createNewAdvisor"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <!-- Alert displayed when user is not associated with a firm -->
  <v-alert title="No Firm" type="secondary" v-else>
    You need to be associated to a firm to manage your advisors.
  </v-alert>
</template>


<script setup>
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {reactive, ref, inject} from 'vue';
import {parseError} from '@/utils/error';
import {useRouter} from 'vue-router';
import moment from 'moment';
import Billing from './Billing.vue';

// Injecting services and router
const $axios = inject('$axios');
const {show} = inject('toast');
const router = useRouter();

// Accessing user data from the store
const {user} = storeToRefs(useUserStore());

// State variables
const openCreateNewAdvisorModal = ref(false);
const currentTab = ref();
const advisors = ref([]);
const clients = ref([]);
const prospects = ref([]);

// Initial state for new advisor form
const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

// Reactive state for new advisor form
const newAdvisor = reactive({...initialState});

// Function to reset the new advisor form
const resetForm = () => {
  Object.assign(newAdvisor, initialState);
};

// Headers for data tables
const baseHeaders = [
  {title: 'Full Name', key: 'full_name', width: 0, nowrap: true},
  {title: 'Email', key: 'email', width: 0, nowrap: true},
  {text: 'Actions', value: 'actions', sortable: false},
];

const clientHeaders = [
  {key: 'actions', sortable: false, width: 0, nowrap: true},
  {title: 'Full Name', key: 'full_name', width: 0, nowrap: true},
  {title: 'Email', key: 'email', width: 0, nowrap: true},
  {title: 'Last Survey Date', key: 'last_survey_taken_date', width: 0, nowrap: true},
  {},
];

// Display state for clients and prospects
const displayState = reactive({
  hidden: 'Display Clients',
  shown: 'Hide Clients',
  hiddenProspects: 'Display Prospects',
  shownProspects: 'Hide Prospects',
  currentAdvisorViewing: null,
});

// Function to fetch advisors from the API
const getAdvisors = async () => {
  const {data} = await $axios.get(`/api/firms/${user.value.firm.id}/advisors/`);
  advisors.value = data;
};

// Fetch clients for a specific advisor
const getClients = async (advisorId) => {
  const {data} = await $axios.get(`/api/advisors/${advisorId}/clients/`);
  displayState[advisorId].clients = data.map((d) => ({
    ...d,
    last_survey_taken_date: d.last_survey_taken_date && moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
  }));
};

// Fetch prospects for a specific advisor
const getProspects = async (advisorId) => {
  const {data} = await $axios.get(`/api/advisors/${advisorId}/prospects/`);
  displayState[advisorId].prospects = data.map((d) => ({
    ...d,
    last_survey_taken_date: d.last_survey_taken_date && moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
  }));
};

// Fetch advisors if the user is associated with a firm
if (user.value.firm) {
  getAdvisors();
}

// Function to create a new advisor
const createNewAdvisor = async () => {
  try {
    await $axios.post(`/api/firms/${user.value.firm.id}/advisors/`, newAdvisor);
    openCreateNewAdvisorModal.value = false;
    getAdvisors();
    resetForm();
    show({message: 'Advisor created!'});
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

// Handle button click to view clients
const viewClients = (advisorId) => {
  if (!displayState[advisorId]) {
    displayState[advisorId] = {showClients: false, showProspects: false};
  }
  if (!displayState[advisorId].showClients) {
    getClients(advisorId);
    displayState.currentAdvisorViewing = advisorId;
  } else {
    displayState.currentAdvisorViewing = null;
  }
  displayState[advisorId].showClients = !displayState[advisorId].showClients;
  displayState[advisorId].showProspects = false; // Ensure prospects are hidden
};

// Handle button click to view prospects
const viewProspects = (advisorId) => {
  if (!displayState[advisorId]) {
    displayState[advisorId] = {showClients: false, showProspects: false};
  }
  if (!displayState[advisorId].showProspects) {
    getProspects(advisorId);
    displayState.currentAdvisorViewing = advisorId;
  } else {
    displayState.currentAdvisorViewing = null;
  }
  displayState[advisorId].showProspects = !displayState[advisorId].showProspects;
  displayState[advisorId].showClients = false; // Ensure clients are hidden
};

// Navigate to client details page
const goToClient = ({id}) => {
  router.push(`/clients/${id}#values`);
};

// Archive a client
const archiveClient = async (advisorId, {id}) => {
  if (confirm('Are you sure you want to archive this client?')) {
    try {
      await $axios.patch(`/api/advisors/${advisorId}/clients/${id}/`, {is_archived: true});
      await getClients(advisorId); // Refresh the clients list for the specific advisor
      show({message: 'Client archived!'});
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};

// Accept a prospect and convert to client
const acceptProspect = async (advisorId, {id}) => {
  if (confirm('Are you sure you want to accept this prospect as a client?')) {
    try {
      await $axios.patch(`/api/advisors/${advisorId}/prospects/${id}/`, {role: 'client'});
      await $axios.post(`/api/advisors/${advisorId}/clients/${id}/portfolio/`);
      await getClients(advisorId); // Refresh the clients list for the specific advisor
      await getProspects(advisorId); // Refresh the prospects list for the specific advisor
      show({message: 'Client created!'});
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};

// Archive a prospect
const archiveProspect = async (advisorId, {id}) => {
  if (confirm('Are you sure you want to archive this prospect?')) {
    try {
      await $axios.patch(`/api/advisors/${advisorId}/prospects/${id}/`, {is_archived: true});
      await getProspects(advisorId); // Refresh the prospects list for the specific advisor
      show({message: 'Prospect archived!'});
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};
</script>

