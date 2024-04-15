<template>
  <v-layout class="justify-center pa-4">
    <v-card width="400px">
      <v-toolbar>
        <v-toolbar-title>Login</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <!-- <router-link to="/register" custom v-slot="{ navigate }">
            <v-btn class="text-caption" @click="navigate()"> Register? </v-btn>
          </router-link> -->
        </v-toolbar-items>
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
const { show } = inject('toast');

const router = useRouter();

const credentials = reactive({
  email: undefined,
  password: undefined,
});

const loginUser = async () => {
  try {
    await useUserStore().login(credentials);

    const { full_name, email } = useUserStore().getUser;

    show({ message: `Welcome back ${full_name || email}!` });

    router.push('/');
  } catch (error) {
    show({ message: 'Invalid credentials', error: true });
  }
};
</script>
