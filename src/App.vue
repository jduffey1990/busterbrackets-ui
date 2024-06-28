<template>
  <v-app>
    <Header/>

    <UiToast>
      <v-main>
        <v-container>
          <router-view></router-view>
        </v-container>
      </v-main
      >
    </UiToast>

    <Footer/>
  </v-app>
</template>

<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

import UiToast from '@/components/ui/Toast.vue';
</script>

