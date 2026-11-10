<template>
  <v-app class="overall-app">
    <Header/>
    <UiToast>
      <v-main>
        <v-container>
          <router-view></router-view>
        </v-container>
      </v-main>
    </UiToast>

    <Overlay
        v-if="overlayStore.showOverlay"
        :title="overlayStore.overlayContent.title"
        :text="overlayStore.overlayContent.text"
        :backgroundImage="overlayStore.overlayContent.backgroundImage"
        @close="overlayStore.closeOverlay"
    />

    <Footer/>
  </v-app>
</template>

<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import UiToast from '@/components/ui/Toast.vue';
import { useRouter } from 'vue-router';
import Overlay from './components/Overlay.vue';

import { useOverlayStore } from '@/store/overlay';
import { useUserStore } from '@/store/user';
import { onMounted } from 'vue';

const overlayStore = useOverlayStore();

const router = useRouter();

let timeout;
let debounceTimeout;

const startTimer = () => {
  timeout = setTimeout(() => {
    useUserStore().logout();
    router.push('/login');
  }, 600000); // 10 minutes
};

const resetTimer = () => {
  clearTimeout(timeout);
  startTimer();
};

const debounce = (func, delay) => {
  return (...args) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const debouncedResetTimer = debounce(resetTimer, 1000);

onMounted(() => {
  startTimer();
});

document.addEventListener('click', debouncedResetTimer);
document.addEventListener('keydown', debouncedResetTimer);
document.addEventListener('mousemove', debouncedResetTimer);
document.addEventListener('scroll', debouncedResetTimer);
</script>

<style>
.overall-app {
  width: 100%;
  background: var(--bb-court) !important;
}
</style>
