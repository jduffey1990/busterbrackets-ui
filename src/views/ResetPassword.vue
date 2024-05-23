<template>
  <v-layout class="justify-center pa-4">
    <v-card width="400px">
      <v-toolbar>
        <v-toolbar-title>Reset Password</v-toolbar-title>
      </v-toolbar>

      <v-form @submit.prevent="resetPassword()">
        <v-card-text>
          <UiPassword v-model="credentials.password"></UiPassword>

          <br />
          <UiPassword
            v-model="credentials.password_confirm"
            placeholder="Confirm Password"
          ></UiPassword>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">Reset Password</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-layout>
</template>

<script setup>
import { inject, reactive } from 'vue';
import UiPassword from '@/components/ui/Password.vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const $axios = inject('$axios');
const { show } = inject('toast');

const { login } = useUserStore();

const { params } = useRoute();
const router = useRouter();

const credentials = reactive({
  password: undefined,
  password_confirm: undefined,
});

const resetPassword = async () => {
  try {
    const {
      data: { email },
    } = await $axios.put('/api/users/set-new-password/', {
      token: params.token,
      new_password: credentials.password,
    });

    await login({
      email,
      password: credentials.password,
    });

    show({ message: 'Password reset!' });

    router.push('/dashboard');
  } catch (error) {
    show({ message: `Couldn't reset password.`, error: true });
  }
};
</script>
