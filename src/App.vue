<template>
  <v-app>
    <Header/>

    <UiToast>
      <v-main>
        <v-container class="gradient-background">
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

.gradient-background {
  background: linear-gradient(180deg, #E1EFFF 30%, #F9BBA9 80.05%);
  min-height: 87vh;
  max-width: 100%;
}

@media only screen and (max-width: 700px) {

  .gradient-background {
    margin-top: 71px;
  }

}


</style>
