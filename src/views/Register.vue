<template>
  <v-layout class="justify-center pa-4">
    <v-card width="400px">
      <v-toolbar color="primary">
        <v-toolbar-title>Register</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <router-link to="/login" custom v-slot="{ navigate }">
            <v-btn class="text-caption" @click="navigate()"> Login? </v-btn>
          </router-link>
        </v-toolbar-items>
      </v-toolbar>

      <v-form @submit.prevent="registerUser()">
        <v-card-text>
          <v-text-field
            label="Email"
            type="email"
            v-model="credentials.email"
          ></v-text-field>
          <br />
          <UiPassword v-model="credentials.password"></UiPassword>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">Register</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-layout>
</template>

<script setup>
import router from '@/router';
import { useUserStore } from '@/store/user';
import { reactive } from 'vue';
import UiPassword from '@/components/ui/Password.vue';

const credentials = reactive({
  email: undefined,
  password: undefined,
});

const registerUser = async () => {
  try {
    await useUserStore().register(credentials);
    await useUserStore().login(credentials);

    router.push('/');
  } catch (error) {}
};
</script>
