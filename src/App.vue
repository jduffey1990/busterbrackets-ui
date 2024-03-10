<template>
  <v-app>
    <Header />

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import Header from './components/Header.vue';
import { useUserStore } from './store/user';

(async () => {
  await useUserStore().getSession();
})();
</script>
