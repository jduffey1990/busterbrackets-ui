<template>
  <div>
    <div class="d-flex my-6">
      <div class="text-h4">
        {{ useUserStore().getUser.full_name }}'s Dashboard
      </div>
      <v-spacer></v-spacer>

      <v-btn
        @click="openCreateNewClientModal = true"
        color="primary"
        text="Create New Client"
      ></v-btn>

      <!-- <v-btn @click="submit()" color="primary">Submit</v-btn> -->
    </div>

    <v-data-table :items="clients" @click:row="goToClient"></v-data-table>

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
import { reactive } from 'vue';
import { ref } from 'vue';
import { inject } from 'vue';
import { useRouter } from 'vue-router';
const $axios = inject('$axios');

const router = useRouter();

const openCreateNewClientModal = ref(false);

const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

const newClient = reactive({ ...initialState });

const resetForm = () => {
  Object.assign(newClient, initialState);
};

const clients = ref([]);
const getClients = async () => {
  const { data } = await $axios.get('/api/advisors/clients/');

  clients.value = data;
};

getClients();

const createNewClient = async () => {
  try {
    await $axios.post('/api/advisors/clients/', newClient);

    openCreateNewClientModal.value = false;

    getClients();

    resetForm();
  } catch (error) {}
};

const goToClient = (event, client) => {
  router.push(`/clients/${client.item.uuid}`);
};
</script>
