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
      <v-tab @click="resetDisplayState">Clients ({{ allRolesClients.length }})</v-tab>
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
            v-if="!allRolesClients.length"
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
          <!--              needs Fixing!-->
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
              class="mb-4 search"
          ></v-text-field>

          <!-- Data table for clients -->
          <v-data-table v-if="displayState.showClients" :headers="headers" :items="clientsShown"
                        :mobile-breakpoint="700">
            <template v-slot:item.actions="{ item }">
              <template v-if="item.role === 'Active'">
                <!-- Active Client Actions -->
                <v-btn
                    color="secondary"
                    class="ml-2 secondary-btn"
                    size="small"
                    @click="archiveClient(item)"
                >
                  Archive
                </v-btn>

                <v-icon
                    icon="mdi-pencil"
                    color="primary"
                    class="ml-4"
                    size="small"
                    @click="editClient(item, 'clients')"
                ></v-icon>
              </template>
              <template v-else-if="item.role === 'New (prospect)'">
                <!-- Prospect Actions -->
                <v-btn
                    color="secondary"
                    class="ml-2 secondary-btn"
                    size="small"
                    @click="acceptProspect(item)"
                >
                  Accept
                </v-btn>

                <v-btn
                    color="secondary"
                    class="ml-2 secondary-btn"
                    size="small"
                    @click="archiveProspect(item)"
                >
                  Archive
                </v-btn>

                <v-icon
                    icon="mdi-pencil"
                    color="secondary-btn"
                    class="ml-2"
                    size="small"
                    @click="editClient(item, 'prospects')"
                ></v-icon>
              </template>
            </template>
            <template v-slot:item.full_name="{ item }">
              <template v-if="item.role === 'Active'">
                <v-btn variant="text" @click="goToClient(item)">
                  {{ item.full_name }}
                </v-btn>
              </template>
              <template v-else>
                <v-btn variant="text" disabled>
                  {{ item.full_name }}
                </v-btn>
              </template>
            </template>
            <template v-slot:item.accounts="{item}">
              <template v-if="item.role === 'Active'">
                {{ accounts[findAccIndex(clients, item.id)] }}
              </template>
            </template>
            <template #bottom v-if="clients.length < 10"></template>
          </v-data-table>
        </div>
      </v-tabs-window-item>

      <!-- Prospects tab content -->
      <v-tabs-window-item :key="1">

        <v-alert
            title="View Firm Clients"
            type="secondary"
            class="my-4"
        >
          If an advisor in your firm has enabled the option to share their client list, you can select their name
          here to view their clients.
        </v-alert>

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
              class="mb-4 search"
          ></v-text-field>
          <v-data-table :items="advisorsShown" :headers="advisorHeaders" :mobile-breakpoint="700">
            <template v-slot:item.actions="{ item }">
              <v-btn
                  color="primary"
                  @click="getClients(item.id), getProspects(item.id), changeAdvisorViewing(item.id)"
                  :disabled="displayState.currentAdvisorViewing !== null && displayState.currentAdvisorViewing !== item.id"
              >
                {{
                  displayState.showOtherClients && displayState.currentAdvisorViewing === item.id ? 'Hide Clients' : 'Display Clients'
                }}
              </v-btn>
            </template>
            <template #bottom v-if="advisorsShown.length < 10"></template>
          </v-data-table>
          <v-text-field
              v-if="displayState.showOtherClients"
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
              class="mt-8 mb-4 search"
          ></v-text-field>
          <v-data-table v-if="displayState.showOtherClients" :items="otherClientsShown" :headers="headers"
                        :mobile-breakpoint="700">
            <template v-slot:item.full_name="{ item }">
              <template v-if="item.role === 'Active'">
                <v-btn variant="text" @click="goToClient(item)">
                  {{ item.full_name }}
                </v-btn>
              </template>
              <template v-else>
                <v-btn variant="text" disabled>
                  {{ item.full_name }}
                </v-btn>
              </template>
            </template>
            <template v-slot:item.accounts="{item}">
              <template v-if="item.role === 'Active'">
                {{ otherAccounts[findAccIndex(otherClientsShown, item.id)] }}
              </template>
            </template>
            <template #bottom v-if="otherClientsShown.length < 10"></template>
          </v-data-table>
        </div>

      </v-tabs-window-item>
      <v-tabs-window-item :key="2">
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
    <!-- Dialog for creating a new advisor -->
    <v-dialog max-width="500" v-model="openEditClientModal">
      <v-card title="Edit Client Details">
        <v-card-text>
          <!-- Input fields for new advisor details -->
          <v-text-field
              v-model="clientToEdit.first_name"
              label="First name"
          ></v-text-field>
          <br/>
          <v-text-field
              v-model="clientToEdit.last_name"
              label="Last name"
          ></v-text-field>
          <br/>
          <v-text-field
              label="Email"
              type="email"
              v-model="clientToEdit.email"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- Buttons to cancel or save the new advisor -->
          <v-btn text color="error" @click="() => { openEditClientModal = false; resetEditForm(); }">
            Cancel
          </v-btn>
          <v-btn text="Save" color="primary" @click="submitEditedClient(clientToEdit.id)"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>


<script setup>
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {ref, reactive, computed, inject, onMounted} from 'vue';
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
const openEditClientModal = ref(false);
const currentTab = ref(0);
const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};
const clientToEdit = ref({
  id: "",
  first_name: "",
  last_name: "",
  email: "",
});
// Survey link
const surveyLink = `/survey?advisor=${advisor_id}`;

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
const editingRole = ref("")
const accounts = ref([]);
const otherAccounts = ref([]);
const allRolesClients = ref([])

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
  {title: 'Status', key: 'role', width: 0, nowrap: true},
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
  const formattedClients = data.map((d) => ({
    ...d,
    last_survey_taken_date: d.last_survey_taken_date
        ? moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma')
        : 'N/A', // Default value if date is missing
    role: "Active", // Default role if undefined
  }));

  if (a === advisor_id) {
    clients.value = formattedClients;
    await getAccountsForAllClients(clients, accounts);
  } else {
    otherClients.value = formattedClients;
    await getAccountsForAllClients(otherClients, otherAccounts);
    otherClientsShown.value = otherClientsShown.value.concat(otherClients.value);
    otherClientsShown.value.sort((a, b) => a.role.localeCompare(b.role));
  }
};

const getAdvisors = async () => {
  const {data} = await $axios.get(`/api/firms/${user.value.firm.id}/advisors-and-admin/`);
  advisors.value = data.filter(advisor => advisor.share_clients === true);
  advisors.value = advisors.value.filter(advisor => advisor.id !== advisor_id);
  advisorsShown.value = advisors.value;
};

// Fetch prospects data
const getProspects = async (theirAdvisor = null) => {
  let advisor
  theirAdvisor ? advisor = theirAdvisor : advisor = advisor_id
  const {data} = await $axios.get(`/api/advisors/${advisor}/prospects/`);
  prospects.value = data.map((d) => ({
    ...d,
    last_survey_taken_date: d.last_survey_taken_date
        ? moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma')
        : 'N/A', // Default value if date is missing
    role: "New (prospect)"
  }));
  if (theirAdvisor) {
    //Skipping otherClients because it is just a middle man to get to otherClientsShown here
    otherClientsShown.value = otherClientsShown.value.concat(prospects.value);
    otherClientsShown.value.sort((a, b) => a.role.localeCompare(b.role));
  }
};

// Form reset
const resetForm = () => {
  Object.assign(newClient, initialState);
};

//edit form reset
const resetEditForm = () => {
  clientToEdit.value = {
    id: null,
    first_name: "",
    last_name: "",
    email: "",
  };
}


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

      show({message: 'Client created!'});

      setTimeout(() => {
        window.location.reload()
      }, 1000); // 1 second
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};

const archiveProspect = async ({id}) => {
  if (confirm('Are you sure you want to archive this prospect?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_id}/prospects/${id}/`, {is_archived: true});

      show({message: 'Prospect archived!'});

      setTimeout(() => {
        window.location.reload()
      }, 1000); // 1 second
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
      show({message: 'Client archived!'});

      setTimeout(() => {
        window.location.reload()
      }, 1000); // 1 second
    } catch (error) {
      show({message: parseError(error), error: true});
    }
  }
};

const editClient = (item, role) => {
  // Populate the `clientToEdit` with the selected client's details
  editingRole.value = role;
  clientToEdit.value = {
    id: item.id,
    first_name: item.first_name,
    last_name: item.last_name,
    email: item.email,
  };
  openEditClientModal.value = true;
};

const submitEditedClient = async (id) => {
  try {
    const result = await $axios.patch(
        `/api/advisors/${advisor_id}/${editingRole.value}/${id}/`,
        {
          first_name: clientToEdit.value.first_name,
          last_name: clientToEdit.value.last_name,
          email: clientToEdit.value.email.toLowerCase(),
        }
    );
    openEditClientModal.value = false;
    resetEditForm();
    window.location.reload();
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Check if the error is related to a duplicate email
      const emailErrors = error.response.data.email;
      if (emailErrors && emailErrors.includes("User with this email already exists.")) {
        show({
          message: "A user with this email already exists. " +
              "Please use another email to update this user.", error: true
        });
      } else {
        show({message: "An error occurred while updating the user. Please try again.", error: true});
      }
    } else {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please contact support.");
    }
  }
};


const copyText = () => {
  navigator.clipboard.writeText(`${location.origin}${surveyLink}`);
  show({
    message: `<div>Link copied to clipboard!</div>`,
  });
};

// Toggle display functions
const toggleClients = () => {
  displayState.showClients = !displayState.showClients;
  displayState.searched = false;
  clientsToShow();
};

// Find client function for search bar 
const findClient = (search) => {
  if (search === '') {
    displayState.searched = false;
    displayState.showClients = false;
  } else {
    foundClient.value = allRolesClients.value.filter((client) => {
      return client.full_name.toLowerCase().includes(search.toLowerCase()) || client.email.toLowerCase().includes(search.toLowerCase());
    });
    displayState.searched = true;
    clientsToShow();
    displayState.showClients = true;
  }
};

const findOtherClient = (search) => {
  if (search === '') {
    displayState.searchedOtherClients = false;
  } else {
    otherFoundClient.value = otherClientsShown.value.filter((client) => {
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
  return displayState.searched ? clientsShown.value = foundClient.value : clientsShown.value = allRolesClients.value;
};

const otherClientsToShow = () => {
  return displayState.searchedOtherClients ? otherClientsShown.value = otherFoundClient.value : otherClientsShown.value = otherClients.value;
};


const getAccountsForAllClients = async (c, acc) => {
  acc.value = [];
  for (const client of c.value) {
    const {data} = await $axios.get(`/api/advisors/${advisor_id}/clients/${client.id}/accounts/`);
    acc.value.push(data.length);
  }
};

const findAccIndex = (c, id) => {
  return c.findIndex((client) => {
    return client.id === id
  });
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

onMounted(async () => {
  // Initial data fetch
  await getAdvisors();
  await getClients(advisor_id);
  await getProspects();

  allRolesClients.value = allRolesClients.value.concat(clients.value).concat(prospects.value)

})
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

.search {
  width: 400px;
  font-family: halyard-text;
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

  .search {
    width: 75%;
  }

}
</style>