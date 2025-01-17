<template>
  <v-layout v-if="!showCreationSection" class="justify-center pa-4">
    <v-card width="400px">
      <v-toolbar class="title-holder">
        <v-toolbar-title class="title">Login</v-toolbar-title>
      </v-toolbar>

      <v-form @submit.prevent="loginUser()">
        <v-card-text>
          <v-text-field
              label="Email"
              type="text"
              v-model="credentials.email"
          ></v-text-field>
          <br/>

          <UiPassword v-model="credentials.password"></UiPassword>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="resetPassword()">Reset Password</v-btn>
          <v-btn type="submit">Login</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-layout>
  <div v-if="showCreationSection === false" class="button-section">
    <v-btn class="btn-primary" @click="updateCreationSection">Need To create a profile?</v-btn>
  </div>
  <v-layout v-if="showCreationSection" class="button-section">

    <v-card class="main-card">
      <v-toolbar class="title-holder">
        <v-toolbar-title class="title">Create New User</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <!-- Name and Email Fields -->
        <v-radio-group v-model="newAccount.role" title="Select Your Role">
          <v-radio
              v-for="r in clientRoles"
              :key="r.key"
              :label="r.title"
              :value="r.key"
              class="my-2"
          ></v-radio>
        </v-radio-group>
        <br/>
        <div v-if="newAccount.role !== ''">
          <div v-if="newAccount.role === 'firm_admin'">
            <v-text-field
                v-model="newAccount.firm"
                label="Business/Firm Name"
            ></v-text-field>
            <br/>
          </div>
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
import {parseError} from "@/utils/error";
import {stringIsEmail} from '@/utils/string'

const {show} = inject('toast');
const $axios = inject('$axios');
const {user, stripeAccountAssociated, cardOnFile} = storeToRefs(useUserStore());
const {login} = useUserStore();

const router = useRouter();

const credentials = reactive({
  email: undefined,
  password: undefined,
});

const timeUntilSubOver = (currentUnixTime, subscriptionEndDate) => {
  // Calculate the number of days remaining
  const daysRemaining = Math.floor((subscriptionEndDate - currentUnixTime) / (60 * 60 * 24)); // Convert seconds to days

  // Check if a message should be shown (based on specific day thresholds)
  const isShown = [15, 10, 5, 3, 2, 1].includes(daysRemaining);

  return [isShown, daysRemaining];
};

const loginUser = async () => {
  try {
    await login(credentials);

    const now = Math.floor(Date.now() / 1000); // Current Unix time in seconds
    const subscriptionEndDate = user.value.firm.subscription_end_date;

    const [bool, daysRemaining] = timeUntilSubOver(now, subscriptionEndDate);

    if (bool) {
      show({
        message: `You have ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} until your subscription lapses. ` +
            `Go to <a href="/billing">Billing</a> to pay your outstanding invoice.`,
        html: true, // Allows HTML in the message
      });
    }

    if (stripeAccountAssociated.value === true && cardOnFile.value === false) {
      router.push('/payment-info')
    } else {
      router.push('/dashboard');
    }
  } catch (error) {
    // Check if the error response contains a message from the backend
    if (error.response && error.response.data && error.response.data.detail) {
      show({
        message: error.response.data.detail,
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


const resetPassword = async () => {
  if (!credentials.email) {
    show({
      message: 'Please enter in email associated to account',
      error: true,
    });
  } else {
    try {
      await $axios.put('/api/users/reset-password/', {
        email: credentials.email,
      });
    } catch (error) {
    }

    show({
      message: 'Password reset! Please check your email.',
    });
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
const passwordReady = computed(() => {
  return longerThan8chars.value && hasSpecialCharacter.value && hasNum.value && hasLowerUpper.value && twoMatchesOne.value;
});
// Computed to check if the client info is ready, including conditional checks for firm_admin
const clientReady = computed(() => {
  const basicInfoReady = newAccount.value.lastName !== '' &&
      newAccount.value.firstName !== '' &&
      newAccount.value.email !== '';

  // Check if the firm name is required and filled out when the role is firm_admin
  const firmInfoReady = newAccount.value.role !== 'firm_admin' || newAccount.value.firm !== '';

  return basicInfoReady && firmInfoReady;
});

// Computed to determine if the submit button should be enabled
const showSubmit = computed(() => {
  return clientReady.value && passwordReady.value;
});

const newAccount = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  firm: "",
  role: "",
})

const clientRoles = [
  {title: "Investor", key: "prospect"},
  {title: "Advisor", key: "firm_admin"}
]

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

  try {
    const response = await $axios.post('/api/users/create-user/', newAccount.value);
    if (response.status === 200) {
      show({message: 'Thanks for creating an account with us. You will be redirected to login.'});
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  } catch (error) {

    console.log("error", error)

    // Check if the error is due to a duplicate email
    if (error.response && error.response.data && error.response.data.error.includes("duplicate key value violates unique constraint")) {
      show({
        message: "A user with this email already exists. Please use another email.",
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
  min-width: 600px;
}


.match-field {
  margin-top: 20px; /* Adds space above the div */
  padding: 10px; /* Adds padding inside the div */
  background-color: #f8f9fa; /* Light grey background for better contrast */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  display: flex; /* Use flexbox for layout */
  flex-direction: column; /* Stack child elements vertically */
  gap: 10px; /* Space between each span */
}

.match-field span {
  display: flex; /* Enables flexbox layout within each span */
  align-items: center; /* Centers items vertically within each span */
  gap: 8px; /* Space between icon and text */
}

.green-span, .red-span {
  color: inherit; /* Ensures text color matches dynamic class */
  font-family: "halyard-text" !important;
  font-size: 14px; /* Slightly larger text for better readability */
  font-style: normal;
  font-weight: 400; /* Normal font weight */
  line-height: 1.4; /* Adjust line height for better readability */
}

.v-icon {
  font-size: 20px; /* Size of the icon */
}


@media (max-width: 700px) {
  .title-holder {
    max-height: 64px !important;

  }

  .title {
    margin-bottom: 80px;
  }
}

</style>