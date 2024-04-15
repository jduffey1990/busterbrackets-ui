<template>
  <slot />

  <v-snackbar v-model="show" :color="color" location="top" :timeout="3000">
    {{ message }}
    <template #actions>
      <v-btn variant="text" @click="show = false">
        <v-icon icon="mdi-close-thick"></v-icon
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { provide, ref } from 'vue';

const show = ref(false);
const message = ref('');
const color = ref('');

provide('toast', {
  show(options) {
    message.value = options.message;
    color.value = options.error ? 'error' : 'success';
    show.value = true;
  },
});
</script>
