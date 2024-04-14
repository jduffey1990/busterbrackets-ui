<template>
  <v-layout class="justify-center pa-4 mt-10">
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
            type="text"
            v-model="credentials.email"
          ></v-text-field>
          <br />
          <v-text-field
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            @click:append-inner="toggleShowPassword()"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            v-model="credentials.password"
          ></v-text-field>
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
import { ref } from 'vue';
import { reactive } from 'vue';

const credentials = reactive({
  email: undefined,
  password: undefined,
});

const showPassword = ref(false);
const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};

const registerUser = async () => {
  try {
    await useUserStore().register(credentials);
    await useUserStore().login(credentials);

    router.push('/');
  } catch (error) {}
};
</script>
