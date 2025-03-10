<template>
  <v-app class="overall-app">
    <div class="header-div">
      <Header/>
    </div>
    <UiToast>
      <v-main class="padding-add">
        <v-container>
          <router-view></router-view>
        </v-container>
      </v-main>
    </UiToast>

    <!-- Conditionally render Overlay component based on store state -->
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
import {useRouter} from 'vue-router';
// Import the Overlay component
import Overlay from './components/Overlay.vue';

// Import the Pinia store for overlay management
import {useOverlayStore} from '@/store/overlay';

// Use the overlay store to manage state
const overlayStore = useOverlayStore();
import {inject, ref} from 'vue';

const $axios = inject('$axios');

import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';

const {user} = storeToRefs(useUserStore());
const router = useRouter();

const screenWidth = window.innerWidth;


// Define the classes for the background
const appBackground = 'appBackground';
const whiteBackground = 'whiteBackground';

import {onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();

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
  background: linear-gradient(135deg, #28F6F4 0%, #1071A0 100%) !important;
}
.header-div {
  height: 150px;
}  

.padding-add {
  padding-top: 40px !important;
  padding: 2rem;
}

.appBackground {
  background: linear-gradient(180deg, #E1EFFF 50%, #F9BBA9 90.05%) !important;
  min-height: 87vh;
  width: 100% !important;
}

.whiteBackground {
  background-color: white !important;
  min-height: 87vh;
  width: 100% !important;
}

.trans-background {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

@media only screen and (max-width: 700px) {
  .header-div{
    height:190px;
    transform: translateY(20px);
  }
}
</style>
