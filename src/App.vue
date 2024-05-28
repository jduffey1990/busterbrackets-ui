<template>
  <!-- <link rel="icon" type="image/x-icon" href="@/assets/favicon.ico" /> -->

  <v-app>
    <Header />

    <UiToast>
      <v-main>
        <v-container>
          <router-view></router-view>
        </v-container> </v-main
    ></UiToast>
  </v-app>
</template>

<script setup>
import Header from './components/Header.vue';

import UiToast from '@/components/ui/Toast.vue';
</script>
