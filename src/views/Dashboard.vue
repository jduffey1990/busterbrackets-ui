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
      <v-tab @click="resetDisplayState">Clients ({{ clients.length }})</v-tab>
      <v-tab @click="resetDisplayState">Prospects ({{ prospects.length }})</v-tab>
      <v-tab @click="resetDisplayState">My Firm ({{ advisors.length }})</v-tab>
      <v-tab v-if="isAdvisorOrGreater && !isSuper" @click="resetDisplayState">Investment Preferences</v-tab>
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
              append-icon="mdi-close"
              density="compact"
              label="Search for a client"
              variant="solo"
              hide-details
              single-line
              @click:append-inner="findClient(searchInput)"
              @keydown.enter="findClient(searchInput)"
              @click:append="searchInput = ''"
              style="width: 400px; font-family: halyard-text;"
              class="mb-4 "
          ></v-text-field>

          <!-- Data table for clients -->
          <v-data-table v-if="displayState.showClients" :headers="headers" :items="clientsShown">
            <template v-slot:item.actions="{ item }">
              <!-- Button to archive a client -->
              <v-icon
                  icon="mdi-delete"
                  color="primary"
                  class="ml-2"
                  size="small"
                  @click="archiveClient(item)"
              >
              </v-icon>
            </template>
            <template v-slot:item.full_name="{ item }">
              <v-btn variant="text" @click="goToClient(item)">
                {{ item.full_name }}
              </v-btn>
            </template>
            <template v-slot:item.accounts="{item}">
              {{ accounts[findAccIndex(clients, item.id)] }}
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
              append-icon="mdi-close"
              density="compact"
              label="Search for a prospect"
              variant="solo"
              hide-details
              single-line
              @click:append-inner="findProspect(searchInputP)"
              @keydown.enter="findProspect(searchInputP)"
              @click:append="searchInputP = ''"
              style="width: 400px; font-family: halyard-text;"
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
      <v-tabs-window-item :key="2">
        <div class="client_display">
          <v-text-field
              v-model="advisorSearchInput"
              append-inner-icon="mdi-magnify"
              append-icon="mdi-close"
              density="compact"
              label="Search for a fellow advisor"
              variant="solo"
              hide-details
              single-line
              @click:append-inner="findAdvisor(advisorSearchInput)"
              @keydown.enter="findAdvisor(advisorSearchInput)"
              @click:append="advisorSearchInput = '', findAdvisor(advisorSearchInput)"
              style="width: 400px; font-family: halyard-text;"
              class="mb-4 "
          ></v-text-field>
          <v-data-table :items="advisorsShown" :headers="advisorHeaders">
            <template v-slot:item.actions="{ item }">
              <v-btn
                  color="primary"
                  @click="getClients(item.id), changeAdvisorViewing(item.id)"
                  :disabled="displayState.currentAdvisorViewing !== null && displayState.currentAdvisorViewing !== item.id"
              >
                {{
                  displayState.showOtherClients && displayState.currentAdvisorViewing === item.id ? 'Hide Clients' : 'Display Clients'
                }}
              </v-btn>
            </template>
          </v-data-table>
          <v-text-field v-if="displayState.showOtherClients"
                        v-model="otherSearchInput"
                        append-inner-icon="mdi-magnify"
                        append-icon="mdi-close"
                        density="compact"
                        label="Search for a client"
                        variant="solo"
                        hide-details
                        single-line
                        @click:append-inner="findOtherClient(otherSearchInput)"
                        @click:append="otherSearchInput = ''"
                        style="width: 400px; font-family: halyard-text;"
                        class="my-4 "
          ></v-text-field>
          <v-data-table v-if="displayState.showOtherClients" :items="otherClientsShown" :headers="headers">
            <template v-slot:item.full_name="{ item }">
              <v-btn variant="text" @click="goToClient(item)">
                {{ item.full_name }}
              </v-btn>
            </template>
            <template v-slot:item.accounts="{item}">
              {{ otherAccounts[findAccIndex(otherClients, item.id)] }}
            </template>
          </v-data-table>
        </div>

      </v-tabs-window-item>
      <v-tabs-window-item :key="3">
        <InvestmentPreferences/>
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
import InvestmentPreferences from "@/views/InvestmentPreferences.vue";

// Injected dependencies
const $axios = inject('$axios');
const {show} = inject('toast');

// Router instance
const router = useRouter();

// User store
const userStore = useUserStore();
const {isAdvisorOrGreater, isSuper} = useUserStore()
const {user} = storeToRefs(userStore);


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
const otherClients = ref([]);
const otherClientsShown = ref([]);
const otherSearchInput = ref('');
const otherFoundClient = ref([]);
const advisorSearchInput = ref('');
const advisors = ref([]);
const advisorsShown = ref([]);
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
  showOtherClients: false,
  hidden: 'Display Clients',
  shown: 'Hide Clients',
  hiddenProspects: 'Display Prospects',
  shownProspects: 'Hide Prospects',
  searched: false,
  searchedProspects: false,
  searchedOtherClients: false,
  currentAdvisorViewing: null,
});

// Data tables headers
const headers = [
  {title: 'Full Name', key: 'full_name', width: 0, nowrap: true},
  {title: 'Email', key: 'email', width: 0, nowrap: true},
  {title: 'Last Survey Date', key: 'last_survey_taken_date', width: 0, nowrap: true},
  {title: 'Accounts', key: 'accounts', width: 0, nowrap: true},
  {key: 'actions', sortable: false, width: 0, nowrap: true},
  {}
];

const advisorHeaders = [
  {title: 'Full Name', key: 'full_name', width: 0, nowrap: true},
  {title: 'Email', key: 'email', width: 0, nowrap: true},
  {key: 'actions', sortable: false, width: 0, nowrap: true},
  {}
]

// Fetch clients data
const getClients = async (a) => {
  const {data} = await $axios.get(`/api/advisors/${a}/clients/`);
  if (a === advisor_id) {
    clients.value = data.map((d) => ({
      ...d,
      last_survey_taken_date: d.last_survey_taken_date && moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
    }));
    await getAccountsForAllClients(clients, accounts);
  } else {
    otherClients.value = data.map((d) => ({
      ...d,
      last_survey_taken_date: d.last_survey_taken_date && moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
    }));
    await getAccountsForAllClients(otherClients, otherAccounts);
    otherClientsShown.value = otherClients.value;
  }

};

const getAdvisors = async () => {
  const {data} = await $axios.get(`/api/firms/${user.value.firm.id}/advisors-and-admin/`);
  advisors.value = data.filter(advisor => advisor.share_clients === true);
  advisors.value = advisors.value.filter(advisor => advisor.id !== advisor_id);
  advisorsShown.value = advisors.value;
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
getAdvisors();
getClients(advisor_id);
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
  if (search === '') {
    displayState.searched = false;
    displayState.showClients = false;
  } else {
    foundClient.value = clients.value.filter((client) => {
      return client.full_name.toLowerCase().includes(search.toLowerCase()) || client.email.toLowerCase().includes(search.toLowerCase());
    });
    displayState.searched = true;
    clientsToShow();
    displayState.showClients = true;
  }
};

const findProspect = (search) => {
  if (search === '') {
    displayState.searchedProspects = false;
    displayState.showProspects = false;
  } else {
    foundProspect.value = prospects.value.filter((prospect) => {
      return prospect.full_name.toLowerCase().includes(search.toLowerCase()) || prospect.email.toLowerCase().includes(search.toLowerCase());
    });
    displayState.searchedProspects = true;
    prospectsToShow();
    displayState.showProspects = true;
  }
};

const findOtherClient = (search) => {
  if (search === '') {
    displayState.searchedOtherClients = false;
  } else {
    otherFoundClient.value = otherClients.value.filter((client) => {
      return client.full_name.toLowerCase().includes(search.toLowerCase()) || client.email.toLowerCase().includes(search.toLowerCase());
    });
    displayState.searchedOtherClients = true;
    otherClientsToShow();
  }
};

const findAdvisor = (search) => {
  if (search === '') {
    advisorsShown.value = advisors.value;
  } else {
    advisorsShown.value = advisors.value.filter((advisor) => {
      return advisor.full_name.toLowerCase().includes(search.toLowerCase()) || advisor.email.toLowerCase().includes(search.toLowerCase());
    });
  }
};

const clientsToShow = () => {
  return displayState.searched ? clientsShown.value = foundClient.value : clientsShown.value = clients.value;
};

const prospectsToShow = () => {
  return displayState.searchedProspects ? prospectsShown.value = foundProspect.value : prospectsShown.value = prospects.value;
};

const otherClientsToShow = () => {
  return displayState.searchedOtherClients ? otherClientsShown.value = otherFoundClient.value : otherClientsShown.value = otherClients.value;
};

const accounts = ref([]);
const otherAccounts = ref([]);
const getAccountsForAllClients = async (c, acc) => {
  acc.value = [];
  for (const client of c.value) {
    const {data} = await $axios.get(`/api/advisors/${advisor_id}/clients/${client.id}/accounts/`);
    acc.value.push(data.length);
  }
};

const findAccIndex = (c, id) => {
  return c.findIndex((client) => client.id === id);
};

const changeAdvisorViewing = (id) => {
  displayState.showOtherClients = !displayState.showOtherClients;
  displayState.currentAdvisorViewing === null ? (otherClientsShown.value = []) && (otherClients.value = []) : null;
  displayState.currentAdvisorViewing === null ?
      displayState.currentAdvisorViewing = id :
      displayState.currentAdvisorViewing = null;
};

const resetDisplayState = () => {
  displayState.showClients = false;
  displayState.showProspects = false;
  displayState.showOtherClients = false;
  displayState.currentAdvisorViewing = null;
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