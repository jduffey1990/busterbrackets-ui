<template>
  <v-layout class="justify-center pa-4">
    <v-card width="450px">
      <v-card-title>Reset password</v-card-title>

      <!-- Token expired / invalid state -->
      <v-card-text v-if="resetFailed">
        <p>This reset link is invalid or has expired.</p>
        <div class="button-section" style="margin-top: 16px;">
          <v-btn color="primary" @click="$router.push('/login')">Back to Login</v-btn>
        </div>
      </v-card-text>

      <!-- Success state -->
      <v-card-text v-else-if="resetSuccess">
        <p>Your password has been reset! You can now log in with your new password.</p>
        <div class="button-section" style="margin-top: 16px;">
          <v-btn color="primary" @click="$router.push('/login')">Go to Login</v-btn>
        </div>
      </v-card-text>

      <!-- Reset form -->
      <v-card-text v-else>
        <div>
          <v-text-field
            v-model="passwordOne"
            :type="showPassword ? 'text' : 'password'"
            label="New Password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
          ></v-text-field>
          <br/>
          <v-text-field
            v-model="passwordTwo"
            :type="showPassword ? 'text' : 'password'"
            label="Confirm New Password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
          ></v-text-field>

          <div class="match-field">
            <span :class="longerThan8chars ? 'green-span' : 'red-span'">
              <v-icon small :color="longerThan8chars ? 'green' : 'red'">
                {{ longerThan8chars ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Greater than 8 characters
            </span>
            <span :class="hasSpecialCharacter ? 'green-span' : 'red-span'">
              <v-icon small :color="hasSpecialCharacter ? 'green' : 'red'">
                {{ hasSpecialCharacter ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Special character
            </span>
            <span :class="hasNum ? 'green-span' : 'red-span'">
              <v-icon small :color="hasNum ? 'green' : 'red'">
                {{ hasNum ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Number included
            </span>
            <span :class="hasLowerUpper ? 'green-span' : 'red-span'">
              <v-icon small :color="hasLowerUpper ? 'green' : 'red'">
                {{ hasLowerUpper ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Upper and lowercase
            </span>
            <span :class="twoMatchesOne ? 'green-span' : 'red-span'">
              <v-icon small :color="twoMatchesOne ? 'green' : 'red'">
                {{ twoMatchesOne ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              Passwords match
            </span>
          </div>

          <br/>
          <div class="button-section">
            <v-btn
              color="primary"
              @click="submitReset"
              :disabled="!passwordReady"
              :loading="isSubmitting"
            >
              Reset Password
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { inject } from 'vue';

const $users = inject('$usersApi');
const { show } = inject('toast');
const route = useRoute();
const router = useRouter();

const passwordOne = ref('');
const passwordTwo = ref('');
const showPassword = ref(false);
const isSubmitting = ref(false);
const resetSuccess = ref(false);
const resetFailed = ref(false);

// Validation refs
const longerThan8chars = ref(false);
const hasSpecialCharacter = ref(false);
const hasNum = ref(false);
const hasLowerUpper = ref(false);
const twoMatchesOne = ref(false);

const passwordReady = computed(() => {
  return longerThan8chars.value &&
    hasSpecialCharacter.value &&
    hasNum.value &&
    hasLowerUpper.value &&
    twoMatchesOne.value;
});

const checkPasswordValidity = () => {
  longerThan8chars.value = passwordOne.value.length > 8;
  hasSpecialCharacter.value = /[!@#$%^&*(),.?":{}|<>]/.test(passwordOne.value);
  hasNum.value = /\d/.test(passwordOne.value);
  hasLowerUpper.value = /[a-z]/.test(passwordOne.value) && /[A-Z]/.test(passwordOne.value);
  twoMatchesOne.value = passwordOne.value === passwordTwo.value && passwordOne.value !== '';
};

watch(passwordOne, checkPasswordValidity);
watch(passwordTwo, checkPasswordValidity);

onMounted(() => {
  const token = route.query.token;
  if (!token) {
    resetFailed.value = true;
  }
});

const submitReset = async () => {
  const token = route.query.token;
  if (!token) {
    resetFailed.value = true;
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await $users.post('/reset-password', {
      token,
      newPassword: passwordOne.value,
    });
    resetSuccess.value = true;
  } catch (error) {
    const msg = error.response?.data?.error || 'Something went wrong. Please try again.';
    // If token is invalid/expired, show the failed state
    if (error.response?.status === 400) {
      resetFailed.value = true;
    }
    show({ message: msg, error: true });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.button-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
</style>
