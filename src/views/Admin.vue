<template>
  <div v-if="user.firm">
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

    <v-tabs v-model="currentTab">
      <v-tab>Advisors ({{ advisors.length }})</v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item>
        <v-data-table :items="advisors" :headers="baseHeaders">
          <template v-slot:item.actions="{ item }">
            <v-btn
                color="primary"
                @click="viewClients(item.id)"
                :disabled="displayState.currentAdvisorViewing !== null && displayState.currentAdvisorViewing !== item.id"
            >
              {{ !displayState[item.id]?.showClients ? displayState.hidden : displayState.shown }}
            </v-btn>
            <v-btn
                color="primary"
                @click="viewProspects(item.id)"
                class="ml-5"
                :disabled="displayState.currentAdvisorViewing !== null && displayState.currentAdvisorViewing !== item.id"
            >
              {{ !displayState[item.id]?.showProspects ? displayState.hiddenProspects : displayState.shownProspects }}
            </v-btn>
          </template>
        </v-data-table>


        <template v-for="advisor in advisors" :key="advisor.id">
          <v-data-table
              v-if="displayState[advisor.id]?.showClients"
              :headers="clientHeaders"
              :items="displayState[advisor.id]?.clients"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn
                  color="primary"
                  class="ml-2"
                  size="small"
                  @click="goToClient(item)"
              >View Client
              </v-btn>
              <v-btn
                  color="secondary"
                  class="ml-2"
                  size="small"
                  @click="archiveClient(advisor.id, item)"
              >Archive
              </v-btn>
            </template>
          </v-data-table>

          <v-data-table
              v-if="displayState[advisor.id]?.showProspects"
              :headers="clientHeaders"
              :items="displayState[advisor.id]?.prospects"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn
                  color="primary"
                  class="ml-2"
                  size="small"
                  @click="acceptProspect(advisor.id, item)"
              >Accept Prospect
              </v-btn>
              <v-btn
                  color="warning"
                  class="ml-2"
                  size="small"
                  @click="archiveProspect(advisor.id, item)"
              >Archive
              </v-btn>
            </template>
          </v-data-table>
        </template>
      </v-tabs-window-item>
    </v-tabs-window>

    <v-dialog max-width="500" v-model="openCreateNewAdvisorModal">
      <v-card title="Create New Advisor">
        <v-card-text>
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
              @click="createNewAdvisor()"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <v-alert title="No Firm" type="warning" v-else
  >You need to be associated to a firm to manage your advisors.
  </v-alert>
</template>

<script setup>
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {reactive} from 'vue';
import {ref} from 'vue';
import {inject} from 'vue';
import {parseError} from '@/utils/error';
import {useRouter} from 'vue-router';
import moment from "moment";

const $axios = inject('$axios');
const {show} = inject('toast');
const router = useRouter()

const {user} = storeToRefs(useUserStore());

const openCreateNewAdvisorModal = ref(false);

const currentTab = ref();

const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

const newAdvisor = reactive({...initialState});

const resetForm = () => {
  Object.assign(newAdvisor, initialState);
};

const baseHeaders = [
  {
    title: 'Full Name',
    key: 'full_name',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Email',
    key: 'email',
    width: 0,
    nowrap: true,
  },
  {
    text: 'Actions',
    value: 'actions',
    sortable: false
  },
];

const clientHeaders = [
  {key: 'actions', sortable: false, width: 0, nowrap: true},
  {title: 'Full Name', key: 'full_name', width: 0, nowrap: true},
  {title: 'Email', key: 'email', width: 0, nowrap: true},
  {title: 'Last Survey Date', key: 'last_survey_taken_date', width: 0, nowrap: true},
  {},
];

const advisors = ref([]);
const clients = ref([]);
const prospects = ref([])
const displayState = reactive({
  hidden: 'Display Clients',
  shown: 'Hide Clients',
  hiddenProspects: 'Display Prospects',
  shownProspects: 'Hide Prospects',
  currentAdvisorViewing: null,
});

const getAdvisors = async () => {
  const {data} = await $axios.get(
      `/api/firms/${user.value.firm.id}/advisors/`
  );

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

if (user.value.firm) {
  getAdvisors();
}

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

const goToClient = ({id}) => {
  router.push(`/clients/${id}#values`);
};

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
