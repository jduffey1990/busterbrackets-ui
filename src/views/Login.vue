<template>
  <v-layout v-if="!showCreationSection" class="justify-center pa-4">
    <v-card width="400px">
      <v-card-title>Log in</v-card-title>

      <v-form @submit.prevent="loginUser()">
        <v-card-text>
          <v-text-field
              label="Username"
              type="text"
              v-model="credentials.username"
          ></v-text-field>
          <br/>

          <UiPassword v-model="credentials.password"></UiPassword>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn type="submit" color="primary" variant="flat">Log in</v-btn>
        </v-card-actions>
      </v-form>

      <!-- Forgot Password Section -->
      <v-card-text v-if="!showForgotPassword">
        <div class="button-section">
          <v-btn variant="text" size="small" @click="showForgotPassword = true">
            Forgot Password?
          </v-btn>
        </div>
      </v-card-text>

      <v-card-text v-if="showForgotPassword">
        <v-divider class="mb-4"></v-divider>
        <p class="text-body-2 mb-2">Enter the email address associated with your account and we'll send you a reset link.</p>
        <v-text-field
          label="Email"
          type="email"
          v-model="forgotEmail"
        ></v-text-field>
        <div class="button-section">
          <v-btn
            color="primary"
            @click="submitForgotPassword"
            :loading="forgotLoading"
            :disabled="!forgotEmail"
          >
            Send Reset Link
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            @click="showForgotPassword = false"
            class="mt-2"
          >
            Cancel
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-layout>
  <div v-if="showCreationSection === false" class="button-section">
    <v-btn class="btn-primary" @click="updateCreationSection" color="warning">New Here?</v-btn>
  </div>
  <v-layout v-if="showCreationSection" class="button-section">

    <v-card class="main-card">
      <v-card-title class="title-holder">
        <span>Create an account</span>
        <button type="button" class="close-button" aria-label="Close" @click="updateCreationSection">
          <v-icon>mdi-close</v-icon>
        </button>
      </v-card-title>

      <v-card-text>
        <!-- Name and Email Fields -->
          <v-text-field
              v-model="newAccount.firstName"
              label="First Name"
          ></v-text-field>
          <br/>
          <v-text-field
              v-model="newAccount.lastName"
              label="Last Name"
          ></v-text-field>
          <br/>
          <v-text-field
              label="Email"
              type="email"
              v-model="newAccount.email"
          ></v-text-field>
          <br/>
          <v-text-field
              label="Username"
              v-model="newAccount.username"
          ></v-text-field>
          <br/>
          <div>
            <v-text-field
                v-model="passwordOne"
                :type="showPassword ? 'text' : 'password'"
                label="Enter New Password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
            ></v-text-field>
            <br/>
            <v-text-field
                v-model="passwordTwo"
                :type="showPassword ? 'text' : 'password'"
                label="Reenter Password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
            ></v-text-field>
            <div class="match-field">
              <span :class="longerThan8chars ? 'green-span' : 'red-span'">
                  <v-icon small :color="longerThan8chars ? 'green' : 'red'">{{
                      longerThan8chars ? 'mdi-check-circle' : 'mdi-close-circle'
                    }}</v-icon>
                  Greater than 8 characters
              </span>
              <span :class="hasSpecialCharacter ? 'green-span' : 'red-span'">
                  <v-icon small :color="hasSpecialCharacter ? 'green' : 'red'">{{
                      hasSpecialCharacter ? 'mdi-check-circle' : 'mdi-close-circle'
                    }}</v-icon>
                  Special character
              </span>
              <span :class="hasNum ? 'green-span' : 'red-span'">
                  <v-icon small :color="hasNum ? 'green' : 'red'">{{
                      hasNum ? 'mdi-check-circle' : 'mdi-close-circle'
                    }}</v-icon>
                  Number included
              </span>
              <span :class="hasLowerUpper ? 'green-span' : 'red-span'">
                  <v-icon small :color="hasLowerUpper ? 'green' : 'red'">{{
                      hasLowerUpper ? 'mdi-check-circle' : 'mdi-close-circle'
                    }}</v-icon>
                  Upper and lowercase
              </span>
              <span :class="twoMatchesOne ? 'green-span' : 'red-span'">
                  <v-icon small :color="twoMatchesOne ? 'green' : 'red'">{{
                      twoMatchesOne ? 'mdi-check-circle' : 'mdi-close-circle'
                    }}</v-icon>
                  Passwords match
              </span>
            </div>
            <br/>
            <div class="button-section">
              <v-btn class="btn-primary" color="primary" @click="submitNewClient" :disabled="!showSubmit">Submit Profile
              </v-btn>
            </div>
          </div>
        
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script setup>
import {useUserStore} from '@/store/user';
import {computed, reactive, ref, watch} from 'vue';
import UiPassword from '@/components/ui/Password.vue';
import {useRouter} from 'vue-router';
import {inject} from 'vue';
import {storeToRefs} from 'pinia';
import {stringIsEmail} from '@/utils/string'

const {show} = inject('toast');
const $users = inject('$usersApi');
const $brackets = inject('$bracketsApi');
const {user, stripeAccountAssociated, cardOnFile} = storeToRefs(useUserStore());
const {login} = useUserStore();

// Forgot password
const showForgotPassword = ref(false);
const forgotEmail = ref('');
const forgotLoading = ref(false);

const router = useRouter();

const credentials = reactive({
  username: undefined,
  password: undefined,
});

const submitForgotPassword = async () => {
  if (!forgotEmail.value) {
    show({ message: 'Please enter your email address', error: true });
    return;
  }

  forgotLoading.value = true;
  try {
    await $users.post('/forgot-password', { email: forgotEmail.value });
    show({ message: 'If an account with that email exists, a reset link has been sent. Check your inbox!' });
    showForgotPassword.value = false;
    forgotEmail.value = '';
  } catch (error) {
    // Backend always returns 200 to prevent enumeration,
    // but handle network errors gracefully
    show({ message: 'Something went wrong. Please try again later.', error: true });
  } finally {
    forgotLoading.value = false;
  }
};

const loginUser = async () => {
  try {
    await login(credentials);
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data && error.response.data.message) {
      show({
        message: error.response.data.message,
        error: true,
      });
    } else {
      // Generic fallback for unexpected errors
      show({
        message: 'An unexpected error occurred. Please try again later.',
        error: true,
      });
    }
  }
};

const showCreationSection = ref(false)
const passwordOne = ref("")
const passwordTwo = ref("")
const showPassword = ref(false);
const longerThan8chars = ref(false);
const hasSpecialCharacter = ref(false);
const hasNum = ref(false);
const hasLowerUpper = ref(false);
const twoMatchesOne = ref(false);

// create form readiness check
const passwordReady = computed(() => {
  return longerThan8chars.value && hasSpecialCharacter.value && hasNum.value && hasLowerUpper.value && twoMatchesOne.value;
});
const clientReady = computed(() => {
  const basicInfoReady = newAccount.value.lastName !== '' &&
      newAccount.value.firstName !== '' &&
      newAccount.value.email !== '' &&
      newAccount.value.username;

  return basicInfoReady
});
const showSubmit = computed(() => {
  return clientReady.value && passwordReady.value;
});


const newAccount = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  name: ""
})

const updateCreationSection = () => showCreationSection.value = !showCreationSection.value

const checkPasswordValidity = () => {
  longerThan8chars.value = passwordOne.value.length > 8;
  hasSpecialCharacter.value = /[!@#$%^&*(),.?":{}|<>]/.test(passwordOne.value);
  hasNum.value = /\d/.test(passwordOne.value);
  hasLowerUpper.value = /[a-z]/.test(passwordOne.value) && /[A-Z]/.test(passwordOne.value);
  twoMatchesOne.value = passwordOne.value === passwordTwo.value;
};

const submitNewClient = async () => {
  if (!passwordReady.value) {
    show({
      message: `Password requirements not met. Please fix errors and try again.`,
      error: true
    });
    return;
  }

  if (!clientReady.value) {
    show({
      message: `Please fill out all required fields.`,
      error: true
    });
    return;
  }

  if (!stringIsEmail(newAccount.value.email)) {
    show({
      message: `Email does not match required format`,
      error: true
    });
    return;
  }

  newAccount.value.email = newAccount.value.email.toLowerCase();
  newAccount.value.password = passwordOne.value
  newAccount.value.name = newAccount.value.firstName + " " + newAccount.value.lastName

  try {
    const response = await $users.post('/create-user', newAccount.value);
    if (response.status === 201) {
      show({message: 'Thanks for creating an account with us. You will be redirected to login.'});
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  } catch (error) {

    console.error("error", error)

    // Check if the error is due to a duplicate email
    if (error.response && error.response.data && error.response.data.error.includes("duplicate key value violates unique constraint")) {
      show({
        message: "A user with this username or email already exists, please try again",
        error: true
      });
    } else {
      // Handle other types of errors
      const errorMessage = error.response ? error.response.data.error : "An unknown error occurred. Please try again.";
      show({message: errorMessage, error: true});
    }
  }
};


watch(passwordOne, () => {
  checkPasswordValidity();
});

watch(passwordTwo, () => {
  checkPasswordValidity();
});


</script>

<style scoped>
.button-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-card {
  width: 100%;
  max-width: 600px;
}

.title-holder {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-field {
  margin-top: 20px;
  padding: 12px;
  background-color: var(--bb-raised);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-field span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.v-icon {
  font-size: 20px;
}

.close-button {
  background: none;
  border: none;
  color: var(--bb-muted);
  cursor: pointer;
  display: flex;
}
</style>
