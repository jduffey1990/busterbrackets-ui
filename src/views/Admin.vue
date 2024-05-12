<template>
  <div>
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
        <v-data-table :items="advisors" :headers="baseHeaders"> </v-data-table>
      </v-tabs-window-item>
    </v-tabs-window>

    <v-dialog max-width="500" v-model="openCreateNewAdvisorModal">
      <v-card title="Create New Advisor">
        <v-card-text>
          <v-text-field
            v-model="newAdvisor.first_name"
            label="First name"
          ></v-text-field>
          <br />
          <v-text-field
            v-model="newAdvisor.last_name"
            label="Last name"
          ></v-text-field>
          <br />
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

const { user } = storeToRefs(useUserStore());

const openCreateNewAdvisorModal = ref(false);

const currentTab = ref();

const initialState = {
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

const newAdvisor = reactive({ ...initialState });

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
];

const advisors = ref([]);

const getAdvisors = async () => {
  console.log(user.value);

  const { data } = await $axios.get(
    `/api/firms/${user.value.firm.id}/advisors/`
  );

  advisors.value = data;
};

getAdvisors();

const createNewAdvisor = async () => {
  try {
    await $axios.post(`/api/firms/${user.value.firm.id}/advisors/`, newAdvisor);

    openCreateNewAdvisorModal.value = false;

    getAdvisors();

    resetForm();

    show({ message: 'Advisor created!' });
  } catch (error) {
    show({ message: `Couldn't create advisor`, error: true });
  }
};
</script>
