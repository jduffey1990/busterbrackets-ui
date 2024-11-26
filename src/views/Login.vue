<template>
  <v-layout class="justify-center pa-4">
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
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { reactive } from 'vue';
import UiPassword from '@/components/ui/Password.vue';
import { useRouter } from 'vue-router';
import { inject } from 'vue';
import { storeToRefs } from 'pinia';

const { show } = inject('toast');
const $axios = inject('$axios');

const { user } = storeToRefs(useUserStore());
const { login } = useUserStore();
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

    console.log(stripeAccountAssociated.value)
    console.log(cardOnFile.value)

    if (stripeAccountAssociated.value && !cardOnFile.value) {
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
    } catch (error) {}

    show({
      message: 'Password reset! Please check your email.',
    });
  }
};
</script>

<style>

@media (max-width: 700px) {
  .title-holder {
    max-height: 64px !important;

  }

  .title {
    margin-bottom: 80px;
  }
}

</style>