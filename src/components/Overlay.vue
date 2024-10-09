<template>
  <!-- Overlay component with updated styles -->
  <div class="overlay">
    <div class="overlay-content">
      <!-- Close button positioned in the upper right corner -->
      <button class="close-button" @click="closeOverlay">
        <v-icon>mdi-close</v-icon>
      </button>
      <h2 class="overlay-title">{{ title }}</h2>
      <img :src="backgroundImage" alt="Overlay Image" class="overlay-image"/>
      <p class="overlay-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>

// Define props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Default Title'
  },
  text: {
    type: String,
    default: 'Default Text'
  },
  backgroundImage: {
    type: String,
    default: '/default-image.png'
  }
});

// Define emits
const emit = defineEmits(['close']);

// Method to close the overlay
const closeOverlay = () => {
  emit('close');
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure overlay is above other elements */
}

.overlay-content {
  position: relative; /* To position child elements like the close button */
  background: white;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px; /* Add some rounding to the content box */
  overflow: hidden; /* Clip the text if it overflows the container */
  max-width: 80%;
  max-height: 80%;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: grey;
  font-family: "halyard-text" !important;
  font-size: 20px;
  cursor: pointer;
  z-index: 100; /* Ensure button stays on top of other content */

}

.overlay-image {
  width: 100%;
  height: auto;
  opacity: 0.3; /* Make the image 50% translucent */
}

.overlay-title {
  position: absolute;
  top: 50px;
  left: 20px;
  right: 20px;
  color: #07152A;
  font-size: 24px;
  font-weight: bold;
  z-index: 1; /* Ensure the title is on top of the image */

}

.overlay-text {
  position: absolute;
  top: 80px; /* Adjust this value as needed to place text where desired */
  left: 20px;
  right: 20px;
  color: #07152A;
  font-size: 16px;
  z-index: 1; /* Ensure the text is on top of the image */
}

@media only screen and (max-width: 700px) {

  .overlay-content {
    max-width: 100%;
    max-height: 100%;
  }

  .overlay-text {
    position: absolute;
    top: 100px; /* Adjust this value as needed to place text where desired */
    left: 20px;
    right: 20px;
    color: #07152A;
    font-size: 12px;
    z-index: 1; /* Ensure the text is on top of the image */
  }

}
</style>

