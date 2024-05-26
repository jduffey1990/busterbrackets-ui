<template>
  <div>
    <div class="d-flex my-4">
      <div>
        <div class="text-h4 mb-2">
          {{ user.full_name || user.email }}'s Dashboard
        </div>
      </div>
      <v-spacer></v-spacer>

      <v-btn
        @click="copyText()"
        color="secondary"
        text="Copy Survey Link"
        class="ml-2"
      ></v-btn>

      <v-btn
        @click="viewSurvey()"
        color="info"
        text="View Survey"
        class="ml-2"
      ></v-btn>

      <v-btn
        @click="openCreateNewClientModal = true"
        color="primary"
        text="Create New Client"
        class="ml-2"
      ></v-btn>
    </div>

    <v-tabs v-model="currentTab">
      <v-tab>Clients ({{ clients.length }})</v-tab>
      <v-tab>Prospects ({{ prospects.length }})</v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item>
        <v-alert
          title="No clients yet..."
          type="info"
          v-if="!clients.length"
          class="my-4"
          >Click "Create New Client" to begin to add clients here.
        </v-alert>

        <v-data-table v-else :headers="headers" :items="clients">
          <template v-slot:item.actions="{ item }">
            <v-btn
              color="primary"
              class="ml-2"
              size="small"
              @click="goToClient(item)"
              >View Client
            </v-btn>
            <v-btn
              color="warning"
              class="ml-2"
              size="small"
              @click="archiveClient(item)"
              >Archive
            </v-btn>
          </template>
        </v-data-table>
      </v-tabs-window-item>

      <v-tabs-window-item>
        <v-alert
          title="No prospects yet..."
          type="info"
          v-if="!prospects.length"
          class="my-4"
          >Click the Copy Survey Link to send your unique firm survey to
          referrals or use to market and build a list of prospects. affilia.
        </v-alert>

        <v-data-table v-else :items="prospects" :headers="headers">
          <template v-slot:item.actions="{ item }">
            <v-btn
              color="secondary"
              class="ml-2"
              size="small"
              @click="acceptProspect(item)"
              >Accept
            </v-btn>

            <v-btn
              color="warning"
              class="ml-2"
              size="small"
              @click="archiveProspect(item)"
              >Archive
            </v-btn>
          </template>
        </v-data-table>
      </v-tabs-window-item>
    </v-tabs-window>

    <v-dialog max-width="500" v-model="openCreateNewClientModal">
      <v-card title="Create New Client">
        <v-card-text>
          <v-text-field
            v-model="newClient.first_name"
            label="First name"
          ></v-text-field>
          <br />
          <v-text-field
            v-model="newClient.last_name"
            label="Last name"
          ></v-text-field>
          <br />
          <v-text-field
            label="Email"
            type="email"
            v-model="newClient.email"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="Cancel"
            @click="
              openCreateNewClientModal = false;
              resetForm();
            "
          ></v-btn>
          <v-btn text="Save" color="primary" @click="createNewClient()"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
import { reactive } from 'vue';
import { ref } from 'vue';
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import moment from 'moment';
import { parseError } from '@/utils/error';

const $axios = inject('$axios');
const { show } = inject('toast');

const router = useRouter();

const { user } = storeToRefs(useUserStore());

const { id: advisor_id } = user.value;

const openCreateNewClientModal = ref(false);

const currentTab = ref();

const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

const newClient = reactive({ ...initialState });

const resetForm = () => {
  Object.assign(newClient, initialState);
};

const headers = [
  {
    key: 'actions',
    sortable: false,
    width: 0,
    nowrap: true,
  },
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
    title: 'Last Survey Date',
    key: 'last_survey_taken_date',
    width: 0,
    nowrap: true,
  },
  {},
];

const clients = ref([]);

const getClients = async () => {
  const { data } = await $axios.get(`/api/advisors/${advisor_id}/clients/`);

  clients.value = data.map((d) => ({
    ...d,
    last_survey_taken_date:
      d.last_survey_taken_date &&
      moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
  }));
};

getClients();

const prospects = ref([]);
const getProspects = async () => {
  const { data } = await $axios.get(`/api/advisors/${advisor_id}/prospects/`);

  prospects.value = data.map((d) => ({
    ...d,
    last_survey_taken_date:
      d.last_survey_taken_date &&
      moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
  }));
};

getProspects();

const createNewClient = async () => {
  try {
    await $axios.post(`/api/advisors/${advisor_id}/clients/`, newClient);

    openCreateNewClientModal.value = false;

    getClients();

    resetForm();

    show({ message: 'Client created!' });
  } catch (error) {
    show({ message: parseError(error), error: true });
  }
};

const goToClient = ({ id }) => {
  router.push(`/clients/${id}#values`);
};

const viewSurvey = () => {
  router.push(`/survey?advisor=${advisor_id}`);
};

const acceptProspect = async ({ id }) => {
  if (confirm('Are you sure you want to accept this prospect as a client?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_id}/prospects/${id}/`, {
        role: 'client',
      });

      await $axios.post(`/api/advisors/${advisor_id}/clients/${id}/portfolio/`);

      getClients();
      getProspects();

      show({ message: 'Client created!' });
    } catch (error) {
      show({ message: parseError(error), error: true });
    }
  }
};

const archiveProspect = async ({ id }) => {
  if (confirm('Are you sure you want to archive this prospect?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_id}/prospects/${id}/`, {
        is_archived: true,
      });

      getClients();
      getProspects();

      show({ message: 'Prospect archived!' });
    } catch (error) {
      show({ message: parseError(error), error: true });
    }
  }
};

const archiveClient = async ({ id }) => {
  if (confirm('Are you sure you want to archive this client?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_id}/clients/${id}/`, {
        is_archived: true,
      });

      getClients();
      getProspects();

      show({ message: 'Client archived!' });
    } catch (error) {
      show({ message: parseError(error), error: true });
    }
  }
};

const surveyLink = `/survey?advisor=${advisor_id}`;
const copyText = () => {
  navigator.clipboard.writeText(`${location.origin}${surveyLink}`);

  show({ message: 'Link copied to clipboard!' });
};
</script>
