<template>
  <!-- Main container that checks if the user is associated with a firm -->
  <div v-if="user.firm">
    <!-- Header section with the firm name and button to create a new advisor -->
    <div class="admin-header">
      <div class="text-h4 mobile-margin">{{ user.firm?.name }} Admin Dashboard</div>
      <v-spacer></v-spacer>
      <v-btn
          @click="openCreateNewAdvisorModal = true"
          color="primary"
          text="Create New Advisor"
          class="ml-2 mobile-margin"
      ></v-btn>
    </div>

    <!-- Tabs for navigation, showing the number of advisors -->
    <v-tabs v-model="currentTab">
      <v-tab>Admin</v-tab>
      <v-tab>White Label Settings</v-tab>
      <v-tab>Billing</v-tab>
    </v-tabs>

    <!-- Content of the selected tab -->
    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item>
        <AdminAccounts @updateChosenFirm="handleChosenFirmUpdate"/>
      </v-tabs-window-item>
      <v-tabs-window-item>
        <h4 class="pt-6">White Label</h4>
        <p>Please note: this only affects the survey. Pages on the app from the advisor view will remain branded as
          Pomarium.</p>
        <ImageUpload/>
        <div>
          <h4 class="pt-6">Background Color</h4>
          <v-radio-group row class="my-4 radios" style="font-family: halyard-text;" v-model="theme">
            <v-radio value="1" label="Pomarium Theme"></v-radio>
            <v-radio value="2" label="White"></v-radio>
          </v-radio-group>
          <v-btn @click="saveWhiteLabelSettings">Save</v-btn>
        </div>
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
import Billing from './Billing.vue';
import ImageUpload from '@/components/ImageUpload.vue';
import AdminAccounts from "@/views/AdminAccounts.vue";

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
const theme = ref();
const chosenFirm = ref(null);

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

function handleChosenFirmUpdate(updatedFirm) {
  chosenFirm.value = updatedFirm;
}

// Function to fetch advisors from the API
const getAdvisors = async () => {
  const {data} = await $axios.get(`/api/firms/${user.value.firm.id}/advisors/`);
  advisors.value = data;
};

// Fetch advisors if the user is associated with a firm
if (user.value.firm) {
  getAdvisors();
}

// Function to create a new advisor
const createNewAdvisor = async () => {
  let firm
  try {
    if (chosenFirm.value) {
      firm = chosenFirm.value.id
    } else {
      firm = user.value.firm.id
    }

    await $axios.post(`/api/firms/${firm}/advisors/`, newAdvisor);
    openCreateNewAdvisorModal.value = false;
    await $axios.post(`/api/billing/subscription-quantity-update/`);
    await getAdvisors();
    show({message: 'Advisor created!'});

    // Set a timeout before reloading the page
    setTimeout(() => {
      window.location.reload();
    }, 1200); // Delay of 1200 milliseconds

  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

const whiteLabelSettings = ref({});

const getWhiteLabelSettings = async () => {
  try {
    const response = await $axios.get(`/api/firms/${user.value.firm.id}/firmSettings/`);
    whiteLabelSettings.value = response.data;
    theme.value = `${response.data.theme}`;
  } catch (error) {
    console.error('Error fetching white label settings:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};
getWhiteLabelSettings();

const saveWhiteLabelSettings = async () => {
  whiteLabelSettings.value.theme = Number(theme.value);
  try {
    const response = await $axios.put(`/api/firms/${user.value.firm.id}/firmSettings/`, whiteLabelSettings.value);
    show({type: 'success', message: 'White label settings saved!'});
    location.reload();
  } catch (error) {
    console.error('Error saving white label settings:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};
</script>

<style scoped>
.admin-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

@media only screen and (max-width: 700px) {
  .admin-header {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .v-locale--is-ltr {
    transform: translateY(100px);
  }

  .v-container {
    transform: translateY(100px);
  }

  .v-main {
    padding-top: 50px;
  }

  .mobile-margin {
    margin-bottom: 20px;
  }

  .radios {
    transform: translateY(-1px);
  }

}
</style>