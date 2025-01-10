<template>
  <v-layout class="justify-center pa-4">
    <v-card class="main-card">
      <v-toolbar class="title-holder">
        <v-toolbar-title class="title">Settings</v-toolbar-title>

        <v-toolbar-items>
          <v-btn
              v-if="isEditing"
              color="primary"
              variant="elevated"
              @click="saveProfile()"
          >
            Save
          </v-btn>
          <v-btn
              v-if="isEditing"
              color="error"
              variant="elevated"
              @click="cancelEdit"
          >
            Cancel Edit
          </v-btn>
          <v-btn
              v-else
              color="primary"
              variant="elevated"
              @click="startEditing"
          >
            Edit Settings
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <!-- Name and Email Fields -->
        <v-text-field
            v-model="account.first_name"
            label="First name"
            :readonly="!isEditing"
        ></v-text-field>
        <br/>
        <v-text-field
            v-model="account.last_name"
            label="Last name"
            :readonly="!isEditing"
        ></v-text-field>
        <br/>
        <v-text-field
            label="Email"
            type="email"
            v-model="account.email"
            :readonly="!isEditing"
        ></v-text-field>

        <!-- New Notification Section -->
        <v-container v-if="isAdvisorOrGreater">
          <div class="d-flex justify-center">
            <v-card-subtitle class="sub_header">Notifications</v-card-subtitle>
          </div>
          <p>Notify me by email when:</p>

          <v-switch
              v-model="account.email_surveys"
              label="A prospect completes a survey"
              :color="isEditing ? 'success' : '#AAAFB4'"
              :false-value="false"
              :true-value="true"
              inset
              :readonly="!isEditing"
              @click="preventClickWhenReadOnly"
          ></v-switch>
          <hr class="my-4">
          <div class="d-flex justify-center">
            <v-card-subtitle class="sub_header">Privacy</v-card-subtitle>
          </div>
          <p>Allow other Advisors in your firm see your clients</p>
          <v-switch
              v-model="account.share_clients"
              :label="account.share_clients ? 'Yes' : 'No'"
              :color="isEditing ? 'success' : '#AAAFB4'"
              :false-value="false"
              :true-value="true"
              inset
              :readonly="!isEditing"
              @click="preventClickWhenReadOnly"
          ></v-switch>
          <hr class="my-4">

          <div class="d-flex justify-center">
            <v-card-subtitle class="sub_header">Survey Changes</v-card-subtitle>

          </div>
          <p>Show my clients the demographic question in the survey</p>
          <v-switch
              v-model="clientDemo"
              :label="clientDemo ? 'Yes' : 'No'"
              :color="isEditing ? 'success' : '#AAAFB4'"
              :false-value="false"
              :true-value="true"
              inset
              :readonly="!isEditing"
              @click="preventClickWhenReadOnly"
          ></v-switch>
          <p>Show my clients the risk questions in the survey</p>
          <v-switch
              v-model="clientRisk"
              :label="clientRisk ? 'Yes' : 'No'"
              :color="isEditing ? 'success' : '#AAAFB4'"
              :false-value="false"
              :true-value="true"
              inset
              :readonly="!isEditing"
              @click="preventClickWhenReadOnly"
          ></v-switch>
          <p class="small">The answers to these questions will not be deleted from your client profiles if they have
            already completed a survey with these values</p>
          <hr class=my-4>

          <div v-if="isAdvisorOrGreater" class="client-move">
            <p class="my-4">Move Clients</p>
            <v-btn
                class="btn"
                color="primary"
                :text="`Move Your Clients`"
                @click="openSwapClientsModal=true; getClients(user.id); getProspects(user.id)"
            ></v-btn>
          </div>
          <hr class=my-4>

          <div class="client-move">
            <p class="my-4">Archive Account</p>
            <v-btn color="error" @click="archiveUser()">Archive</v-btn>
          </div>


          <v-dialog max-width="500" v-model="openSwapClientsModal">
            <v-card title="Swap Clients">
              <v-card-text>
                <!-- Checkbox to select all clients -->
                <v-checkbox
                    label="Select All Clients"
                    @change="handleAllClientsSelected"
                ></v-checkbox>
                <br/>
                <v-autocomplete
                    v-if="allClientsSelected === false"
                    v-model="selectedSwapClients"
                    label="Select Client to swap"
                    :items="advisorClientList"
                    chips
                    closable-chips
                    multiple
                    clear-on-select
                    item-title="full_name"
                    item-value="id"
                    class="advisor-select"
                    no-data-text="No Clients Available"
                ></v-autocomplete>
                <br/>
                <v-select
                    v-model="swapToAdvisor"
                    :items="justAdvisorsList"
                    item-title="full_name"
                    item-value="id"
                    label="Advisor Receiving Clients"
                    return-object
                    class="advisor-select"
                    no-data-text="No Advisors to Select"
                ></v-select>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <!-- Buttons to cancel or save the new advisor -->
                <v-btn text color="error" @click="() => { openSwapClientsModal = false; resetSwapForm(); }">
                  Cancel
                </v-btn>
                <v-btn
                    :loading="swapIsSubmitting"
                    color="primary"
                    @click="submitSwap"
                    :disabled="!swapReady"
                >Submit Client Swap
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        </v-container>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script setup>
import {useUserStore} from '@/store/user';
import {reactive, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {inject} from 'vue';
import {parseError} from '@/utils/error';
import {storeToRefs} from "pinia";

// Inject dependencies
const $axios = inject('$axios');
const {show} = inject('toast');

// Get user data
const {first_name, last_name, email, email_surveys, share_clients, survey_version} = useUserStore().user;
const {user} = storeToRefs(useUserStore())
const {isAdvisorOrGreater} = useUserStore();
const showClientModal = ref(false);
const advisors = ref([])
const selectedAdvisor = ref("")
const isSubmitting = ref(false);
const clientDemo = ref(true)
const clientRisk = ref(true)
const isEditing = ref(false)

// Reactive data for account and accountCopy
const account = reactive({
  first_name,
  last_name,
  email,
  email_surveys,
  share_clients,
  survey_version
});

const accountCopy = reactive({...account}); // Create a copy of the account


const resetForm = () => {
  selectedAdvisor.value = '';
  showClientModal.value = false;
};

const startEditing = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  // Reset the account to the saved state
  Object.assign(account, accountCopy);
};

// Function to check if there are unsaved changes
const hasUnsavedChanges = () => {
  return JSON.stringify(account) !== JSON.stringify(accountCopy);
};

// Save profile function
const saveProfile = async () => {
  pageToVersion()
  try {
    await $axios.put('/api/users/me/', account);
    Object.assign(accountCopy, {...account}); // Update accountCopy after saving
    show({message: 'Account saved!'});

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    show({message: parseError(error), error: true});
  }
};

const archiveUser = async () => {
  const confirmation = confirm(
      "Archiving a user does not delete them from the database. However, you will lose access to Pomarium. " +
      "If you are an admin or advisor, all clients remaining to you will also be archived. Continue?"
  );

  if (confirmation) {
    try {
      const response = await $axios.patch(`/api/users/archive-user/${user.value.id}/`);

      if (response.status === 200) {
        show({message: "You have been archived. You will now be logged out."});

        //remove advisor from stripe subscription
        await $axios.post(`/api/billing/subscription-quantity-update/`);

        // Log the user out and redirect to the login page
        setTimeout(async () => {
          await useUserStore().logout();
          router.push('/login');
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

const pageToVersion = () => {
  let demo = clientDemo.value;
  let risk = clientRisk.value;

  if (demo && risk) {
    account.survey_version = 1; // Both are true
  } else if (!demo && risk) {
    account.survey_version = 2; // Demo is false, Risk is true
  } else if (demo && !risk) {
    account.survey_version = 3; // Demo is true, Risk is false
  } else {
    account.survey_version = 4; // Both are false
  }
};

const versionToPage = () => {
  if (survey_version === 1) {
    // Do nothing; both values remain true
  } else if (survey_version === 2) {
    clientDemo.value = false;
  } else if (survey_version === 3) {
    clientRisk.value = false;
  } else if (survey_version === 4) {
    clientDemo.value = false;
    clientRisk.value = false;
  }
};


// Warn the user if they have unsaved changes when leaving the page
const beforeUnloadHandler = (event) => {
  if (hasUnsavedChanges() && isEditing.value) {
    event.preventDefault();
    event.returnValue = ''; // Required to trigger the confirmation dialog
  }
};

const preventClickWhenReadOnly = (event) => {
  if (!isEditing.value) {
    event.preventDefault();
    event.stopPropagation();
  }
}

const openSwapClientsModal = ref(false)
const allClientsSelected = ref(false)
const swapIsSubmitting = ref(false);
const swapReady = ref(false)
const swapToAdvisor = ref(null)
const selectedSwapClients = ref([])
const advisorClientList = ref([])
const justAdvisorsList = ref([])

const getClients = async (a) => {
  try {
    const {data} = await $axios.get(`/api/advisors/${a}/clients/`);
    let fetchedClientList = data.map(client => ({
      ...client,
      full_name: `${client.first_name} ${client.last_name}` // Constructing full name if needed
    }));

    advisorClientList.value = advisorClientList.value.concat(fetchedClientList)
  } catch (error) {
    console.error('Error fetching clients:', error);
  }
};

const getProspects = async (a) => {
  try {
    const {data} = await $axios.get(`/api/advisors/${a}/prospects/`);
    let fetchedProspectList = data.map(client => ({
      ...client,
      full_name: `${client.first_name} ${client.last_name}` // Constructing full name if needed
    }));

    advisorClientList.value = advisorClientList.value.concat(fetchedProspectList)
  } catch (error) {
    console.error('Error fetching clients:', error);
  }
};

const fetchAdminData = async () => {
  try {

    const response = await $axios.get(`/api/firms/${user.value.firm.id}/advisors-and-admin/`);
    justAdvisorsList.value = response.data;

  } catch (error) {
    console.error('Error fetching admin data:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

const submitSwap = async () => {
  isSubmitting.value = true;
  // Extract only the ids from selectedSwapClients.value
  try {
    const payload = {
      current_advisor_id: user.value.id,
      new_advisor_id: swapToAdvisor.value.id,
      clients_to_move: selectedSwapClients.value
    };

    console.log("woof", payload)

    await $axios.patch(`/api/users/transfer-clients/`, payload);
    let finishedMessage = payload.clients_to_move.length === 1 ?
        "Client Transferred Successfully!" :
        "Clients Transferred Successfully!";
    show({type: 'success', message: finishedMessage});
    setTimeout(() => {
      location.reload()
    }, 1000);
  } catch (error) {
    console.error('Error transferring clients:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  } finally {
    openSwapClientsModal.value = false
  }
}

const handleAllClientsSelected = () => {
  allClientsSelected.value = !allClientsSelected.value
  selectedSwapClients.value = advisorClientList.value
}

const checkSwapReady = () => {
  let thisBool = false
  let clientsAreSelected = allClientsSelected.value === true || selectedSwapClients.value.length !== 0
  if (swapToAdvisor.value !== null && clientsAreSelected) {
    thisBool = true
  }
  swapReady.value = thisBool
}

const resetSwapForm = () => {
  allClientsSelected.value = false
  selectedSwapClients.value = []
  advisorClientList.value = []
  swapToAdvisor.value = null
  swapIsSubmitting.value = false
}

// Register the event listener on mounted and remove it on unmount
onMounted(async () => {
  versionToPage()
  await fetchAdminData()
  window.addEventListener('beforeunload', beforeUnloadHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler);
});

watch(swapToAdvisor, async (newAdvisor) => {
  if (newAdvisor) {
    checkSwapReady()
  }
});

watch(allClientsSelected, async (newBoolValue) => {
  if (newBoolValue) {
    checkSwapReady()
  }
});

watch(selectedSwapClients, async (newSwapList) => {
  if (newSwapList) {
    checkSwapReady()
  }
});

// need watch function here:
</script>

<style scoped>
.sub_header {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 1.25rem;
  color: #666;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-bottom: 2px solid black;
  padding-bottom: 5px;
  width: fit-content;
}

.toggle {
  transform: translateY(-10px);
}

main-card {
  min-width: 600px;
}

.client-move {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (max-width: 700px) {
  .main-card {
    min-width: 90vw;
  }

  .title-holder {
    max-height: 64px !important;

  }

  .title {
    margin-bottom: 80px;
  }
}

</style>

