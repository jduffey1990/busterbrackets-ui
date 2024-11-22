<template>
  <v-layout class="justify-center pa-4">
    <v-card class="main-card">
      <v-toolbar class="title-holder">
        <v-toolbar-title class="title">Settings</v-toolbar-title>

        <v-toolbar-items>
          <v-btn color="primary" variant="elevated" @click="saveProfile()">
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <!-- Name and Email Fields -->
        <v-text-field
            v-model="account.first_name"
            label="First name"
        ></v-text-field>
        <br/>
        <v-text-field
            v-model="account.last_name"
            label="Last name"
        ></v-text-field>
        <br/>
        <v-text-field
            label="Email"
            type="email"
            v-model="account.email"
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
              color="success"
              :false-value="false"
              :true-value="true"
              inset
          ></v-switch>
          <div class="d-flex justify-center">
            <v-card-subtitle class="sub_header">Privacy</v-card-subtitle>
          </div>
          <p>Allow other Advisors in your firm see your clients</p>
          <v-switch
              v-model="account.share_clients"
              :label="account.share_clients ? 'Yes' : 'No'"
              color="success"
              :false-value="false"
              :true-value="true"
              inset
          ></v-switch>
          <hr class=my-4>


          <div v-if="isAdvisorOrGreater" class="client-move">
            <p class="my-4">Move all clients to new manager</p>
            <v-btn @click="openClientModal()" color="primary">Transfer All Clients</v-btn>
          </div>
          <hr class=my-4>

          <div class="client-move">
            <p class="my-4">ArchiveAccount</p>
            <v-btn color="error" @click="archiveUser()">Archive</v-btn>
          </div>


          <v-dialog v-model="showClientModal" max-width="600">
            <v-card>
              <v-card-title>
                <span class="text-h5">Transfer Clients</span>
              </v-card-title>

              <v-card-text>
                <v-select
                    label="Choose advisor to accept your clients"
                    class="mb-4"
                    v-model="selectedAdvisor"
                    :items="advisors"
                    item-title="title"
                    item-value="value"
                ></v-select>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="resetForm()">Cancel</v-btn>
                <v-btn
                    :loading="isSubmitting"
                    :disabled="!selectedAdvisor"
                    @click="submitChanges()"
                >
                  Submit Changes
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
import {reactive, onBeforeUnmount, onMounted, ref} from 'vue';
import {inject} from 'vue';
import {parseError} from '@/utils/error';
import {storeToRefs} from "pinia";

// Inject dependencies
const $axios = inject('$axios');
const {show} = inject('toast');

// Get user data
const {first_name, last_name, email, email_surveys, share_clients} = useUserStore().user;
const {user} = storeToRefs(useUserStore())
const {isAdvisorOrGreater} = useUserStore();
const showClientModal = ref(false);
const advisors = ref([])
const selectedAdvisor = ref("")
const isSubmitting = ref(false);

// Reactive data for account and accountCopy
const account = reactive({
  first_name,
  last_name,
  email,
  email_surveys,
  share_clients
});

const accountCopy = reactive({...account}); // Create a copy of the account


const resetForm = () => {
  selectedAdvisor.value = '';
  showClientModal.value = false;
};
const openClientModal = async () => {
  showClientModal.value = true;
  try {
    const firm_id = user.value.firm.id
    console.log("user", firm_id)
    const response = await $axios.get(`/api/firms/${user.value.firm.id}/advisors-and-admin/`);
    const fetchedAdvisors = response.data;

    advisors.value = fetchedAdvisors.map(advisor => ({
      title: advisor.full_name,
      value: advisor.id,
    }));
  } catch (error) {
    console.error('Error fetching advisors:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

const submitChanges = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      current_advisor_id: user.value.id,
      new_advisor_id: selectedAdvisor.value,
    };

    await $axios.patch(`/api/users/transfer-clients/`, payload);

    show({type: 'success', message: 'Clients successfully transferred!'});
    resetForm();
  } catch (error) {
    console.error('Error transferring clients:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  } finally {
    isSubmitting.value = false;
  }
};

// Function to check if there are unsaved changes
const hasUnsavedChanges = () => {
  return JSON.stringify(account) !== JSON.stringify(accountCopy);
};

// Save profile function
const saveProfile = async () => {
  try {
    await $axios.put('/api/users/me/', account);
    Object.assign(accountCopy, {...account}); // Update accountCopy after saving
    await useUserStore().getSession();
    show({message: 'Account saved!'});
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
      const response = await $axios.patch('/api/users/archive-user');

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


// Warn the user if they have unsaved changes when leaving the page
const beforeUnloadHandler = (event) => {
  if (hasUnsavedChanges()) {
    event.preventDefault();
    event.returnValue = 'Oops, you have unsaved changes to your settings. Are you sure you want to continue?';
    return event.returnValue;
  }
};

// Register the event listener on mounted and remove it on unmount
onMounted(() => {
  window.addEventListener('beforeunload', beforeUnloadHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler);
});
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

