<template>
  <v-app class="app-background">
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
import {watch} from 'vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import UiToast from '@/components/ui/Toast.vue';

// Import the Overlay component
import Overlay from './components/Overlay.vue';

// Import the Pinia store for overlay management
import {useOverlayStore} from '@/store/overlay';

// Use the overlay store to manage state
const overlayStore = useOverlayStore();

// Watch for changes to overlayStore.showOverlay
watch(
    () => overlayStore.showOverlay, // Watching the reactive property
    (newValue, oldValue) => {
      console.log('Overlay visibility changed from', oldValue, 'to', newValue);
      if (newValue) {
        // Perform any additional actions when the overlay is shown
        console.log('Overlay is now visible');
      } else {
        // Perform any additional actions when the overlay is hidden
        console.log('Overlay has been closed');
      }
    }
);
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
