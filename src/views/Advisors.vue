<template>

  <v-tabs v-model="currentTab">
    <v-tab>Advisors</v-tab>
    <v-tab>Accounts Manager</v-tab>
  </v-tabs>
  <v-tabs-window v-model="currentTab">
    <v-tabs-window-item>
      <!-- Header for the Advisors section -->
      <div class="text-h4 my-4">Advisors</div>

      <!-- Data table displaying the list of advisors with action buttons -->
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
    </v-tabs-window-item>
    <v-tabs-window-item>
      <Billing/>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup>
import {ref} from 'vue'; // Importing ref for reactive variables
import {inject} from 'vue'; // Importing inject for dependency injection
import {useRouter} from 'vue-router';
import {parseError} from "@/utils/error"; // Importing useRouter for navigation
import Billing from './Billing.vue';

// Injecting axios and toast services
const $axios = inject('$axios');
const {show} = inject('toast');
const currentTab = ref();

// Initializing router instance
const router = useRouter();

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

// Function to fetch the list of advisors from the API
const getAdvisors = async () => {
  try {
    const {data} = await $axios.get(`/api/advisors/`);
    // format date for created_at
    data.forEach(advisor => {
      advisor.created_at = new Date(advisor.created_at).toLocaleString();
    });
    advisors.value = data;
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

// Fetch the list of advisors on component mount
getAdvisors();

// Function to navigate to the advisor's preferences page
const editPreferences = (item) => {
  router.push(`/advisors/${item.id}/preferences`);
};

// Function to copy the reset password URL to clipboard and show a toast notification
const copyText = (item) => {
  navigator.clipboard.writeText(item.reset_password_link);
  show({message: `Link copied to clipboard!`});
};
</script>

