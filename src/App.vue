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
import { useServerStatusStore } from '@/store/serverStatus';
import { inject, onMounted } from 'vue';

const overlayStore = useOverlayStore();
const serverStatusStore = useServerStatusStore();

const $users = inject('$usersApi');
const $brackets = inject('$bracketsApi');

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

// Users backend: still a one-shot ping (assumed always live)
const pingBackendUser = async () => {
  try {
    const response = await $users.get('/ping-user');
    if (response.status === 200) {
      console.log('backend users pinged');
    }
  } catch (error) {
    console.error('Users backend ping failed:', error);
  }
};

onMounted(() => {
  startTimer();
  pingBackendUser();

  // Brackets backend: retry-polling until live or exhausted
  // Sets bracketsReady / bracketsError / bracketsChecking on the store
  serverStatusStore.awaitBracketsReady($brackets);
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
