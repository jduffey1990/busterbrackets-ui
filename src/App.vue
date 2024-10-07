<template>
  <v-app :class="[ onSurvey ? (theme === 1 ? appBackground : whiteBackground) : appBackground ]">
    <Header/>

    <UiToast>
      <v-main>
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

// Import the Overlay component
import Overlay from './components/Overlay.vue';

// Import the Pinia store for overlay management
import {useOverlayStore} from '@/store/overlay';

// Use the overlay store to manage state
const overlayStore = useOverlayStore();
import { inject, ref } from 'vue';
const $axios = inject('$axios');

import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
const {user} = storeToRefs(useUserStore());
const firm_id = user.value.firm.id;

const theme = ref(null);
const getTheme = async () => {
  try {
    const response = await $axios.get(`/api/firms/${firm_id}/firmSettings/`);
    theme.value = response.data.theme;
  } catch (error) {
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};
getTheme();

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
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(() => {
  checkSurvey();
});

watch(route, () => {
  checkSurvey();
});
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

@media only screen and (max-width: 700px) {

  .app-background {
    padding-top: 80px;
  }

}
</style>