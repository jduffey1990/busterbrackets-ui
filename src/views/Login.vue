<template>
  <v-layout class="justify-center pa-4">
    <v-card width="400px">
      <v-toolbar>
        <v-toolbar-title>Login</v-toolbar-title>
      </v-toolbar>

      <v-form @submit.prevent="loginUser()">
        <v-card-text>
          <v-text-field
            label="Email"
            type="text"
            v-model="credentials.email"
          ></v-text-field>
          <br />

          <UiPassword v-model="credentials.password"></UiPassword>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
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

const { user } = storeToRefs(useUserStore());
const { login } = useUserStore();

const router = useRouter();

const credentials = reactive({
  email: undefined,
  password: undefined,
});

const loginUser = async () => {
  try {
    await login(credentials);

    show({
      message: `Welcome back ${user.value.full_name || user.value.email}!`,
    });

    router.push('/');
  } catch (error) {
    console.log(error);
    show({ message: 'Invalid credentials', error: true });
  }
};
</script>
