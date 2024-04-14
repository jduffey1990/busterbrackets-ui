<template>
  <v-layout class="justify-center pa-4">
    <v-card min-width="600px">
      <v-toolbar>
        <v-toolbar-title>Account Settings</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-form @submit.prevent="saveProfile()">
        <v-card-text>
          <v-text-field
            v-model="account.first_name"
            label="First name"
          ></v-text-field>
          <br />
          <v-text-field
            v-model="account.last_name"
            label="Last name"
          ></v-text-field>
          <br />
          <v-text-field
            label="Email"
            type="email"
            v-model="account.email"
          ></v-text-field>
          <!-- <br />
          <UiPassword v-model="account.password"></UiPassword> -->
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn type="submit">Save</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-layout>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { reactive } from 'vue';
// import UiPassword from '@/components/ui/Password.vue';
import { inject } from 'vue';
const $axios = inject('$axios');

const { first_name, last_name, email } = useUserStore().getUser;

const account = reactive({
  first_name,
  last_name,
  email,
});

const saveProfile = async () => {
  try {
    await $axios.put('/api/users/me/', account);
  } catch (error) {
    console.log(error);
  }
};
</script>
