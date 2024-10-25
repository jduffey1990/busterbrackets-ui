<template>
  <v-app :class="[ onSurvey ? (theme === 1 ? appBackground : whiteBackground) : appBackground ]">
    <Header v-if="screenWidth < 700" style="transform: translateY(-30px);"/>
    <Header v-else/>

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

const theme = ref(null);
const getTheme = async () => {
  try {
    const response = await $axios.get(`/api/firms/${user.value.firm.id}/firmSettings/`);
    theme.value = response.data.theme;
  } catch (error) {
  }
};


// Define the classes for the background
const appBackground = 'appBackground';
const whiteBackground = 'whiteBackground';

const onSurvey = ref(false);
//check if url contains survey every time the route changes
const checkSurvey = () => {
  if (window.location.href.includes('survey')) {
    onSurvey.value = true;
  } else {
    onSurvey.value = false;
  }
};
import {onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();

onMounted(() => {
  getTheme();
  checkSurvey();
});

watch(route, () => {
  checkSurvey();
});

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
</script>

<style>

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
</style>
