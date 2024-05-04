<template>
  <div>
    <div class="d-flex my-6">
      <div class="text-h4">{{ user.full_name || user.email }}'s Dashboard</div>
      <v-spacer></v-spacer>

      <v-btn
        @click="copyText()"
        text="Get Survey Link"
        color="info"
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
      <v-tab>Prospects ({{ prospects.length }})</v-tab>
      <v-tab>Clients ({{ clients.length }})</v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item>
        <v-data-table :items="prospects" :headers="prospectHeaders">
          <template v-slot:item.actions="{ item }">
            <v-btn color="success" class="ml-2" @click="acceptProspect(item)"
              >Accept
            </v-btn>

            <v-btn color="error" class="ml-2" @click="archiveProspect(item)"
              >Archive
            </v-btn>
          </template>
        </v-data-table>
      </v-tabs-window-item>

      <v-tabs-window-item>
        <v-data-table
          :headers="clientHeaders"
          :items="clients"
          @click:row="goToClient"
        ></v-data-table>
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

const $axios = inject('$axios');
const { show } = inject('toast');

const router = useRouter();

const { user } = storeToRefs(useUserStore());

const { uuid: advisor_uuid } = user.value;

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
    title: 'Last Survey Date',
    key: 'last_survey_taken_date',
  },
];

const clients = ref([]);
const clientHeaders = [...baseHeaders];
const getClients = async () => {
  const { data } = await $axios.get(`/api/advisors/${advisor_uuid}/clients/`);

  clients.value = data.map((d) => ({
    ...d,
    last_survey_taken_date:
      d.last_survey_taken_date &&
      moment(d.last_survey_taken_date).format('MM/DD/YYYY hh:mma'),
  }));
};

getClients();

const prospectHeaders = [
  {
    key: 'actions',
    sortable: false,
    width: 0,
    nowrap: true,
  },
  ...baseHeaders,
];
const prospects = ref([]);
const getProspects = async () => {
  const { data } = await $axios.get(`/api/advisors/${advisor_uuid}/prospects/`);

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
    await $axios.post(`/api/advisors/${advisor_uuid}/clients/`, newClient);

    openCreateNewClientModal.value = false;

    getClients();

    resetForm();

    show({ message: 'Client created!' });
  } catch (error) {
    show({ message: `Couldn't create client`, error: true });
  }
};

const goToClient = (event, client) => {
  router.push(`/clients/${client.item.uuid}`);
};

const copyText = () => {
  const domain =
    import.meta.env.VITE_DOMAIN_URL || 'https://dev.getpomarium.com';

  navigator.clipboard.writeText(`${domain}/survey?advisor=${advisor_uuid}`);

  show({ message: 'Link copied to clipboard!' });
};

const acceptProspect = async ({ uuid }) => {
  if (confirm('Are you sure you want to accept this prospect as a client?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_uuid}/prospects/${uuid}/`, {
        role: 'client',
      });

      getClients();
      getProspects();

      show({ message: 'Client created!' });
    } catch (error) {
      show({ message: `Couldn't create client`, error: true });
    }
  }
};

const archiveProspect = async ({ uuid }) => {
  if (confirm('Are you sure you want to archive this prospect?')) {
    try {
      await $axios.patch(`/api/advisors/${advisor_uuid}/prospects/${uuid}/`, {
        is_archived: true,
      });

      getClients();
      getProspects();

      show({ message: 'Prospect archived!' });
    } catch (error) {
      show({ message: `Couldn't archive prospect`, error: true });
    }
  }
};
</script>
