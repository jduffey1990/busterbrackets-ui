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
              color="warning"
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
            v-model="account.firstName"
            label="First name"
            :readonly="!isEditing"
        ></v-text-field>
        <br/>
        <v-text-field
            v-model="account.lastName"
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
        <br/>
        <v-text-field
            v-model="account.credits"
            label="Credits Remaining"
            readonly
        ></v-text-field>
        <br/>
        <!-- Password Change Section -->
        <v-divider class="mb-4"></v-divider>
        <div class="button-section">
          <v-btn
            v-if="!showPasswordChange"
            variant="outlined"
            color="primary"
            @click="showPasswordChange = true"
          >
            Change Password
          </v-btn>
        </div>

        <div v-if="showPasswordChange">
          <v-text-field
            v-model="currentPassword"
            :type="showPwdField ? 'text' : 'password'"
            label="Current Password"
            :append-icon="showPwdField ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPwdField = !showPwdField"
          ></v-text-field>
          <br/>
          <v-text-field
            v-model="newPasswordOne"
            :type="showPwdField ? 'text' : 'password'"
            label="New Password"
            :append-icon="showPwdField ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPwdField = !showPwdField"
          ></v-text-field>
          <br/>
          <v-text-field
            v-model="newPasswordTwo"
            :type="showPwdField ? 'text' : 'password'"
            label="Confirm New Password"
            :append-icon="showPwdField ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPwdField = !showPwdField"
          ></v-text-field>

          <div class="match-field">
            <span :class="pwdLongerThan8 ? 'green-span' : 'red-span'">
              <v-icon small :color="pwdLongerThan8 ? 'green' : 'red'">
                {{ pwdLongerThan8 ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Greater than 8 characters
            </span>
            <span :class="pwdHasSpecial ? 'green-span' : 'red-span'">
              <v-icon small :color="pwdHasSpecial ? 'green' : 'red'">
                {{ pwdHasSpecial ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Special character
            </span>
            <span :class="pwdHasNum ? 'green-span' : 'red-span'">
              <v-icon small :color="pwdHasNum ? 'green' : 'red'">
                {{ pwdHasNum ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Number included
            </span>
            <span :class="pwdHasLowerUpper ? 'green-span' : 'red-span'">
              <v-icon small :color="pwdHasLowerUpper ? 'green' : 'red'">
                {{ pwdHasLowerUpper ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Upper and lowercase
            </span>
            <span :class="pwdMatch ? 'green-span' : 'red-span'">
              <v-icon small :color="pwdMatch ? 'green' : 'red'">
                {{ pwdMatch ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Passwords match
            </span>
          </div>

          <br/>
          <div class="button-section">
            <v-btn
              color="primary"
              @click="submitPasswordChange"
              :disabled="!pwdReady"
              :loading="pwdSubmitting"
            >
              Update Password
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              @click="cancelPasswordChange"
              class="mt-2"
            >
              Cancel
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { parseError } from '@/utils/error';
import { storeToRefs } from "pinia";
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';

// Inject dependencies
const $users = inject('$usersApi');
const {show} = inject('toast');

// Get user data
const {user} = storeToRefs(useUserStore())
const showClientModal = ref(false);
const advisors = ref([])
const selectedAdvisor = ref("")
const isSubmitting = ref(false);
const clientDemo = ref(true)
const clientRisk = ref(true)
const isEditing = ref(false)
// Password change
const showPasswordChange = ref(false);
const showPwdField = ref(false);
const currentPassword = ref('');
const newPasswordOne = ref('');
const newPasswordTwo = ref('');
const pwdSubmitting = ref(false);

const pwdLongerThan8 = ref(false);
const pwdHasSpecial = ref(false);
const pwdHasNum = ref(false);
const pwdHasLowerUpper = ref(false);
const pwdMatch = ref(false);


// Reactive data for account and accountCopy
const account = ref({
  firstName: "",
  lastName: "",
  email: "",
  credits: ""
});

const accountCopy = ref({...account});

const getUser = async () => {
  try {
    let response = await $users.get(`/get-user?id=${user.value._id}`);
    let userReturned = response.data
      let arrayOfNames = userReturned.name.split(" ")
      account.value.firstName = arrayOfNames[0]
      account.value.lastName = arrayOfNames[1]
      account.value.email = userReturned.email
      account.value.credits =userReturned.credits

      accountCopy.value = {...account.value}
    }catch (error) {
    console.error(error)
  }
}

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
  try {
    await $users.patch('/edit-user', account.value);
    Object.assign(accountCopy, {...account}); // Update accountCopy after saving
    show({message: 'Account saved!'});
    isEditing.value=false
  } catch (error) {
    show({message: parseError(error), error: true});
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


// Password change logic:
const pwdReady = computed(() => {
  return pwdLongerThan8.value && pwdHasSpecial.value && pwdHasNum.value &&
    pwdHasLowerUpper.value && pwdMatch.value && currentPassword.value !== '';
});

const checkPwdValidity = () => {
  pwdLongerThan8.value = newPasswordOne.value.length > 8;
  pwdHasSpecial.value = /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordOne.value);
  pwdHasNum.value = /\d/.test(newPasswordOne.value);
  pwdHasLowerUpper.value = /[a-z]/.test(newPasswordOne.value) && /[A-Z]/.test(newPasswordOne.value);
  pwdMatch.value = newPasswordOne.value === newPasswordTwo.value && newPasswordOne.value !== '';
};

watch(newPasswordOne, checkPwdValidity);
watch(newPasswordTwo, checkPwdValidity);

const cancelPasswordChange = () => {
  showPasswordChange.value = false;
  currentPassword.value = '';
  newPasswordOne.value = '';
  newPasswordTwo.value = '';
};

const submitPasswordChange = async () => {
  pwdSubmitting.value = true;
  try {
    await $users.patch('/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPasswordOne.value,
    });
    show({ message: 'Password updated successfully!' });
    cancelPasswordChange();
  } catch (error) {
    const msg = error.response?.data?.error || 'Failed to update password';
    show({ message: msg, error: true });
  } finally {
    pwdSubmitting.value = false;
  }
};
//--------------------------------------------------------------------------------------------------------


// Register the event listener on mounted and remove it on unmount
onMounted(async () => {
  await getUser()
  window.addEventListener('beforeunload', beforeUnloadHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler);
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

.main-card {
  width: 600px !important;
}

.client-move {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.match-field {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-field span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.green-span, .red-span {
  font-family: "halyard-text" !important;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
}

@media (max-width: 700px) {
  .main-card {
    min-width: 95vw;
  }

  .title-holder {
    max-height: 64px !important;
  }

  .title-holder .v-btn {
    font-size: xx-small;
  }

  .title {
    margin-bottom: 80px;
    font-size: small;
  }
}

</style>

