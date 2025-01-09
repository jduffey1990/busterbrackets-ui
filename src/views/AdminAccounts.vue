<template>
  <div class="mt-6">
    <div class="advisor-select-group">
      <v-select
          v-if="isSuper"
          v-model="chosenFirm"
          :items="allFirms"
          item-title="name"
          item-value="id"
          label="Select a Firm"
          return-object
          class="advisor-select"
      ></v-select>
    </div>
    <!-- Dropdown to select an advisor -->
    <div class="advisor-select-group">
      <v-select
          v-model="chosenAdvisor"
          :items="firmAdvisorList"
          item-title="full_name"
          item-value="id"
          label="Select an Advisor"
          return-object
          class="advisor-select"
          @update:model-value="resetToAll($event)"
      ></v-select>
    </div>
    <div v-if="chosenAdvisor !== null">
      <v-btn
          class="btn"
          color="primary"
          :text="`Edit ${chosenAdvisor.full_name}'s Profile`"
          @click="openEditAdvisorModal=true, advisorToEdit=chosenAdvisor"
      >
      </v-btn>
    </div>
  </div>

  <v-dialog max-width="500" v-model="openEditAdvisorModal">
    <v-card title="Edit Advisor Details">
      <v-card-text>
        <!-- Input fields for new advisor details -->
        <v-text-field
            v-model="advisorToEdit.first_name"
            label="First name"
        ></v-text-field>
        <br/>
        <v-text-field
            v-model="advisorToEdit.last_name"
            label="Last name"
        ></v-text-field>
        <br/>
        <v-text-field
            label="Email"
            type="email"
            v-model="advisorToEdit.email"
        ></v-text-field>
        <v-select
            label="Change Client Status"
            class="my-4"
            v-model="advisorToEdit.role"
            :items="rolesList"
            item-title="title"
            item-value="value"
        ></v-select>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <!-- Buttons to cancel or save the new advisor -->
        <v-btn text color="error" @click="() => { openEditAdvisorModal = false; resetEditForm(); }">
          Cancel
        </v-btn>
        <v-btn text="Save" color="primary" @click="submitEditedAdvisor(advisorToEdit.id)"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <div v-if="loadReports">
    <Reports advisorPage="true" :advisorLength="advisorsLength" :chosenAdvisorId="chosenAdvisor"/>
  </div>

</template>

<script setup>
import {ref, onMounted, inject, computed, watch,} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {parseError} from '@/utils/error';
import {addCommas, formatDate, funLookAtFunction} from '@/utils/string';
import {downloadCSV} from '@/utils/file';
import Reports from '@/components/Reports.vue';

const $axios = inject('$axios');
const {show} = inject('toast');

const {user} = storeToRefs(useUserStore());
const firmId = computed(() => chosenFirm.value ? chosenFirm.value.id : user.value.firm.id);

const loadReports = ref(true);

const reloadReports = () => {
  loadReports.value = false;
  setTimeout(() => {
    loadReports.value = true;
  }, 100);
};

const resetToAll = (data) => {
  data === 'All Advisors' ? chosenAdvisor.value = null : null;
  reloadReports();
};

const accountsData = ref({});
const allFirms = ref([]);
const firmAdvisorList = ref([]);
const chosenAdvisor = ref(null);
const chosenFirm = ref(null);
const emit = defineEmits(['updateChosenFirm']);
const allData = ref([])
const noResultsText = ref("This advisor has no active accounts under advisement")
const openEditAdvisorModal = ref(false)

const advisorsLength = ref(0)
const clientsLength = ref(0)
const accountsLength = ref(0)

const accountHeaders = [
  {title: 'Client', key: 'user_name'},
  {title: 'Account', key: 'account_name'},
  {title: 'Last Four', key: 'last_four'},
  {title: 'Acc Start', key: 'created_at'},
  {title: 'Acc End', key: 'deleted_at'},
  {title: 'Acc Value', key: 'value'}
];

const rolesList = [
  {title: 'Firm Administrator', value: 'firm_admin'},
  {title: 'Advisor', value: 'advisor'},
  {title: 'Archived', value: 'archived'}
]

const advisorToEdit = ref({
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  role: ""
});

const fetchAdminData = async () => {
  try {

    const response = await $axios.get(`/api/firms/${firmId.value}/advisors-and-admin/`);
    firmAdvisorList.value = response.data;
    advisorsLength.value = firmAdvisorList.value.length;
    firmAdvisorList.value.push({id: null, full_name: 'All Advisors'});

    let accountsArray = [];
    let clientsSet = new Set();

    // Update the total accounts and clients
    accountsLength.value = accountsArray.length;
    clientsLength.value = clientsSet.size;

    // Log final accounts data object (keyed by advisor ID)

  } catch (error) {
    console.error('Error fetching billing data:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

const submitEditedAdvisor = async (id) => {
  let advisorProfile = {}
  if (advisorToEdit.value.role === 'archived') {
    await archiveAdvisor(advisorToEdit.value.id)
    openEditAdvisorModal.value = false;
    resetEditForm();
    window.location.reload();
  } else {
    advisorProfile = {
      first_name: advisorToEdit.value.first_name,
      last_name: advisorToEdit.value.last_name,
      email: advisorToEdit.value.email.toLowerCase(),
      role: advisorToEdit.value.role
    }
  }
  try {
    const result = await $axios.patch(
        `api/users/update-user/${advisorToEdit.value.id}/`, advisorProfile
    );
    openEditAdvisorModal.value = false;
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
}

const archiveAdvisor = async (id) => {
  const confirmation = confirm(
      "Archiving a user does not delete them from the database. However, they will lose access to Pomarium. " +
      "All clients remaining to this advisor will also be archived. Continue?"
  );

  if (confirmation) {
    try {
      const response = await $axios.patch(`/api/users/archive-user/${id}/`);

      if (response.status === 200) {

        //remove advisor from stripe subscription
        await $axios.post(`/api/billing/subscription-quantity-update/`);

        // Log the user out and redirect to the login page
        setTimeout(async () => {
          location.reload()
        }, 1000)
      } else {
        console.error("Unexpected response status:", response.status);
        alert("An unexpected error occurred while archiving the user.");
      }
    } catch (error) {
      console.error("Error archiving user:", error);
      alert("Failed to archive the user. Please try again later.");
    }
  }
};


const isSuper = ref(false);

// Check if the user is a super user
if (user.value.role === 'super') {
  isSuper.value = true;
}


//fetch firms
const fetchFirms = async () => {
  try {
    const response = await $axios.get('/api/firms/');
    allFirms.value = response.data
    await fetchAdminData()
  } catch (error) {
    console.error('Error fetching firms:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

const resetEditForm = () => {
  advisorToEdit.value = {
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    role: ""
  };
}


// Fetch billing data based on the user role
onMounted(() => {
  if (isSuper.value) {
    fetchFirms();
  } else {
    fetchAdminData();
  }
});

watch(chosenFirm, async (newFirm) => {
  if (newFirm) {
    emit('updateChosenFirm', newFirm);
    await fetchAdminData();  // Fetch data for the newly selected firm
  }
});
</script>

<style scoped>

.card-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  margin-bottom: 150px;
}

.square-card {
  width: 100%;
  max-width: 300px;
  height: 300px;
  background-color: rgba(255, 255, 255, 0.2); /* Translucent background */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
  padding: 0;
}

.circle {
  background-color: rgba(255, 255, 255, 1); /* Opaque background */
  border-radius: 50%;
  height: 80px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin: 0 auto; /* Center horizontally */
}

.card-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.v-row.no-gutters {
  margin-right: 0;
  margin-left: 0;
}

.v-row.no-gutters > .v-col {
  padding-right: 0;
  padding-left: 0;
}

.advisor-select-group {
  display: flex;
  justify-content: start;
}

.advisor-select {
  max-width: 400px;
  margin-bottom: 20px;
}

.csv-download {
  display: flex;
  align-items: center;
  justify-content: end;
}

@media only screen and (max-width: 1275px) {

  .card-group {
    margin-top: 40px;
    margin-bottom: 40px;
  }

  .square-card {
    max-width: 200px;
    height: 200px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
}

@media only screen and (max-width: 700px) {

  .card-group {
    flex-direction: column;
  }

  .square-card {
    max-width: 400px;
    height: 200px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .advisor-select-group {
    justify-content: center;
  }

}
</style>