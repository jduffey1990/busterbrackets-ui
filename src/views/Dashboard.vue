<template>
  <div>
    <!-- Top section with user dashboard header and buttons -->
    <div class="top_line_dash mb-6">
      <div>
        <!-- User dashboard title displaying either full name or email -->
        <div class="text-h4 mb-2 justify-center">
          {{ user.full_name || user.email }}'s Dashboard
        </div>
      </div>
      <v-spacer></v-spacer>

      <!-- Button to copy the survey link -->
      <v-btn
          @click="copyText()"
          color="secondary"
          text="Copy Survey Link"
          class="survey_button secondary-btn"
      ></v-btn>

      <!-- Button to open the modal for creating a new client -->
      <v-btn
          @click="openCreateNewClientModal = true"
          color="primary"
          text="Take Survey with Client"
          class="survey_button"
      ></v-btn>
    </div>

    <!-- Tabs for switching between clients and prospects -->
    <v-tabs v-model="currentTab">
      <v-tab>Clients ({{ clients.length }})</v-tab>
      <v-tab>Prospects ({{ prospects.length }})</v-tab>
    </v-tabs>

    <!-- Content of the selected tab -->
    <v-tabs-window v-model="currentTab">
      <!-- Clients tab content -->
      <v-tabs-window-item :key="0">
        <!-- Alert if there are no clients -->
        <v-alert
            title="No clients yet..."
            type="secondary"
            v-if="!clients.length"
            class="my-4"
        >
          Click "Take Survey with Client" to start adding clients to your list.
        </v-alert>

        <!-- Clients display section -->
        <div v-else class="client_display">
          <!-- Button to toggle the display of clients -->
          <v-btn color="primary" @click="toggleClients" class="client_button">
            {{ !displayState.showClients ? `${displayState.hidden}` : `${displayState.shown}` }}
          </v-btn>

          <v-text-field
            v-model="searchInput"
            append-inner-icon="mdi-magnify"
            density="compact"
            label="Search for a client"
            variant="solo"
            hide-details
            single-line
            @click:append-inner="findClient(searchInput)"
            @keydown.enter="findClient(searchInput)"
            style="width: 400px;"
            class="mb-4"
          ></v-text-field>

          <!-- Data table for clients -->
          <v-data-table v-if="displayState.showClients" :headers="headers" :items="clientsShown">
            <template v-slot:item.actions="{ item }">
              <!-- Button to view client details -->
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
                  @click="archiveClient(item)"
              >Archive
              </v-btn>
            </template>
            <template #bottom v-if="clients.length < 10"></template>
          </v-data-table>
        </div>
      </v-tabs-window-item>

      <!-- Prospects tab content -->
      <v-tabs-window-item :key="1">
        <!-- Alert if there are no prospects -->
        <v-alert
            title="No prospects yet..."
            type="secondary"
            v-if="!prospects.length"
            class="my-4"
        >
          Click the "Copy Survey Link" to send your unique firm survey to
          referrals or use to market and build a list of prospects.
        </v-alert>

        <!-- Prospects display section -->
        <div v-else class="mt-10 px-10">
          <!-- Button to toggle the display of prospects -->
          <v-btn color="primary" @click="toggleProspects" class="mb-4">
            {{ !displayState.showProspects ? `${displayState.hiddenProspects}` : `${displayState.shownProspects}` }}
          </v-btn>

          <v-text-field
            v-model="searchInputP"
            append-inner-icon="mdi-magnify"
            density="compact"
            label="Search for a client"
            variant="solo"
            hide-details
            single-line
            @click:append-inner="findProspect(searchInputP)"
            @keydown.enter="findProspect(searchInputP)"
            style="width: 400px;"
            class="mb-4"
          ></v-text-field>

          <!-- Data table for prospects -->
          <v-data-table v-if="displayState.showProspects" :headers="headers" :items="prospectsShown">
            <template v-slot:item.actions="{ item }">
              <!-- Button to accept a prospect -->
              <v-btn
                  color="secondary"
                  class="ml-2 secondary-btn"
                  size="small"
                  @click="acceptProspect(item)"
              >Accept
              </v-btn>

              <!-- Button to archive a prospect -->
              <v-btn
                  color="secondary"
                  class="ml-2 secondary-btn"
                  size="small"
                  @click="archiveProspect(item)"
              >Archive
              </v-btn>
            </template>
          </v-data-table>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Dialog for creating a new client -->
    <v-dialog max-width="500" v-model="openCreateNewClientModal">
      <v-card title="Create New Client">
        <v-card-text>
          <!-- Input fields for new client details -->
          <v-text-field
              v-model="newClient.first_name"
              label="First name"
          ></v-text-field>
          <br/>
          <v-text-field
              v-model="newClient.last_name"
              label="Last name"
          ></v-text-field>
          <br/>
          <v-text-field
              label="Email"
              type="email"
              v-model="newClient.email"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <!-- Button to cancel client creation and reset the form -->
          <v-btn
              text="Cancel"
              @click="
              openCreateNewClientModal = false;
              resetForm();
            "
          ></v-btn>
          <!-- Button to save the new client -->
          <v-btn text="Save" color="primary" @click="createNewClient()"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script setup>
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {ref, reactive, computed, inject} from 'vue';
import {useRouter} from 'vue-router';
import moment from 'moment';
import {parseError} from '@/utils/error';

// Injected dependencies
const $axios = inject('$axios');
const {show} = inject('toast');

// Router instance
const router = useRouter();

// User store
const userStore = useUserStore();
const {user} = storeToRefs(userStore);
const isFirmAdminOrGreater = computed(() => userStore.isFirmAdminOrGreater);

// User info
const {id: advisor_id} = user.value;

// State variables
const openCreateNewClientModal = ref(false);
const currentTab = ref(0);
const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};
const newClient = reactive({...initialState});
const clients = ref([]);
const advisors = ref([]);
const prospects = ref([]);
const clientsShown = ref([]);
const searchInput = ref('');
const foundClient = ref([]);
const searchInputP = ref('');
const foundProspect = ref([]);
const prospectsShown = ref([]);

// Display state
const displayState = reactive({
  showClients: false,
  showProspects: false,
  hidden: 'Display Clients',
  shown: 'Hide Clients',
  hiddenProspects: 'Display Prospects',
  shownProspects: 'Hide Prospects',
  searched: false,
  searchedProspects: false,
});

// Data tables headers
const headers = [
  {key: 'actions', sortable: false, width: 0, nowrap: true},
  {title: 'Full Name', key: 'full_name', width: 0, nowrap: true},
  {title: 'Email', key: 'email', width: 0, nowrap: true},
  {title: 'Last Survey Date', key: 'last_survey_taken_date', width: 0, nowrap: true},
  {},
];

// Fetch clients data
const getClients = async () => {
  const {data} = await $axios.get(`/api/advisors/${advisor_id}/clients/`);
  clients.value = data.map((d) => ({
    ...d,
    last_survey_taken_date: d.last_survey_taken_date && moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
  }));
};

const getAdvisors = async () => {
  if (isFirmAdminOrGreater.value) {
    const {data} = await $axios.get(`/api/firms/${user.value.firm.id}/advisors/`);
    advisors.value = data;
  }
};

// Fetch prospects data
const getProspects = async () => {
  const {data} = await $axios.get(`/api/advisors/${advisor_id}/prospects/`);
  prospects.value = data.map((d) => ({
    ...d,
    last_survey_taken_date: d.last_survey_taken_date && moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
  }));
};

// Initial data fetch
getClients();
isFirmAdminOrGreater.value && getAdvisors()
getProspects();

// Form reset
const resetForm = () => {
  Object.assign(newClient, initialState);
};

// Create new client
const createNewClient = async () => {
  try {
    const {data: {id}} = await $axios.post(`/api/advisors/${advisor_id}/clients/`, newClient);
    openCreateNewClientModal.value = false;
    show({message: 'Client created!'});
    router.push(`/survey?user_id=${id}`);
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

// Navigation functions
const goToClient = ({id}) => {
  router.push(`/clients/${id}#values`);
};

// Prospect actions
const acceptProspect = async ({id}) => {
  if (confirm('Are you sure you want to accept this prospect as a client?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_id}/prospects/${id}/`, {role: 'client'});
      await $axios.post(`/api/advisors/${advisor_id}/clients/${id}/portfolio/`);
      getClients();
      getProspects();
      show({message: 'Client created!'});
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};

const archiveProspect = async ({id}) => {
  if (confirm('Are you sure you want to archive this prospect?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_id}/prospects/${id}/`, {is_archived: true});
      getClients();
      getProspects();
      show({message: 'Prospect archived!'});
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};

// Client actions
const archiveClient = async ({id}) => {
  if (confirm('Are you sure you want to archive this client?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_id}/clients/${id}/`, {is_archived: true});
      getClients();
      getProspects();
      show({message: 'Client archived!'});
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};

// Survey link and clipboard functions
const surveyLink = `/survey?advisor=${advisor_id}`;
const copyText = () => {
  navigator.clipboard.writeText(`${location.origin}${surveyLink}`);
  show({
    message: `<div>Link copied to clipboard!</div><br/><div>NOTE: Not mobile friendly yet but will be shortly</div>`,
  });
};

// Toggle display functions
const toggleClients = () => {
  displayState.showClients = !displayState.showClients;
  displayState.searched = false;
  clientsToShow();
};

const toggleProspects = () => {
  displayState.showProspects = !displayState.showProspects;
  displayState.searchedProspects = false;
  prospectsToShow();
};

// Find client function for search bar 
const findClient = (search) => {
  foundClient.value = clients.value.filter((client) => {
    return client.full_name.toLowerCase().includes(search.toLowerCase()) || client.email.toLowerCase().includes(search.toLowerCase());
  });
  displayState.searched = true;
  clientsToShow();
  displayState.showClients = true;
};

const findProspect = (search) => {
  foundProspect.value = prospects.value.filter((prospect) => {
    return prospect.full_name.toLowerCase().includes(search.toLowerCase()) || prospect.email.toLowerCase().includes(search.toLowerCase());
  });
  displayState.searchedProspects = true;
  prospectsToShow();
  displayState.showProspects = true;
};

const clientsToShow = () => {
  return displayState.searched ? clientsShown.value=foundClient.value : clientsShown.value=clients.value;
};

const prospectsToShow = () => {
  return displayState.searchedProspects ? prospectsShown.value=foundProspect.value : prospectsShown.value=prospects.value;
};
</script>

<style>
.top_line_dash {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.survey_button {
  margin-left: 10px;
}


.client_display {
  display: flex;
  flex-direction: column;
  justify-content: start;
  margin-top: 20px;
}

.client_button {
  max-width: fit-content;
  margin-bottom: 30px;
}

@media only screen and (max-width: 700px) {

  .top_line_dash {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .survey_button {
    margin-top: 10px;
  }

  .client_display {
    justify-content: center;
    align-items: center;
  }
}
</style>