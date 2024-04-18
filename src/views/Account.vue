<template>
  <v-layout class="justify-center pa-4">
    <v-card min-width="600px">
      <v-toolbar>
        <v-toolbar-title> Account Settings </v-toolbar-title>

        <v-toolbar-items>
          <v-btn color="primary" variant="elevated" @click="saveProfile()">
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

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
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { reactive } from 'vue';
import { inject } from 'vue';
const $axios = inject('$axios');
const { show } = inject('toast');

const { first_name, last_name, email } = useUserStore().user;

const account = reactive({
  first_name,
  last_name,
  email,
});

const saveProfile = async () => {
  try {
    await $axios.put('/api/users/me/', account);

    await useUserStore().getSession();

    show({ message: 'Account saved!' });
  } catch (error) {
    show({ message: `Couldn't save account`, error: true });
  }
};
</script>
