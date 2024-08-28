// stores/overlay.js
import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useOverlayStore = defineStore('overlay', () => {
    // Reactive state for overlay visibility
    const showOverlay = ref(false);
    const overlayContent = ref({
        title: '',
        text: '',
        backgroundImage: ''
    });

    // Action to open overlay
    const openOverlay = (title, text, backgroundImage) => {
        overlayContent.value = {title, text, backgroundImage};
        showOverlay.value = true;
    };

    // Action to close overlay
    const closeOverlay = () => {
        showOverlay.value = false;
    };

    return {showOverlay, overlayContent, openOverlay, closeOverlay};
});