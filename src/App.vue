<template>
  <v-app class="app-background">
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

<style>

.app-background {
  background: linear-gradient(180deg, #E1EFFF 50%, #F9BBA9 90.05%) !important;
  min-height: 87vh;
  width: 100% !important;
}

.trans-background {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

@media only screen and (max-width: 700px) {

  .app-background {
    padding-top: 80px;
  }

}

</style>
