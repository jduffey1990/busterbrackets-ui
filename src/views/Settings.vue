<template>
  <v-layout class="justify-center pa-4">
    <v-card min-width="600px">
      <v-toolbar>
        <v-toolbar-title>Settings</v-toolbar-title>

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
        </v-container>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script setup>
import {useUserStore} from '@/store/user';
import {reactive, onBeforeUnmount, onMounted} from 'vue';
import {inject} from 'vue';
import {parseError} from '@/utils/error';

// Inject dependencies
const $axios = inject('$axios');
const {show} = inject('toast');

// Get user data
const {first_name, last_name, email, email_surveys} = useUserStore().user;
const {isAdvisorOrGreater} = useUserStore();

// Reactive data for account and accountCopy
const account = reactive({
  first_name,
  last_name,
  email,
  email_surveys
});

const accountCopy = reactive({...account}); // Create a copy of the account

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
</style>

