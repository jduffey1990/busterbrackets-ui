<template>
    <div class="d-flex my-6">
      <v-file-input label="Firm logo" @change="handleFileUpload" variant="solo" style="max-width: 400px; font-family: halyard-text;" density="compact"/>
      <v-btn @click="uploadImage" color="primary" class="mx-6 my-2">Upload</v-btn>
    </div>
  </template>
  
  <script setup>
  import { ref, inject } from 'vue';
  import { useUserStore } from '@/store/user';
  import { storeToRefs } from 'pinia';
  
  const { user } = storeToRefs(useUserStore());
  const firm_id = user.value.firm.id;
  const $axios = inject('$axios');
  const {show} = inject('toast');
  
  const selectedFile = ref(null);
  
  function handleFileUpload(event) {
    selectedFile.value = event.target.files[0];
  }
  
  async function uploadImage() {
    if (!selectedFile.value) {
      console.error('Please select an image first.');
      return;
    }
    const dataToSend = {
      firm_logo: selectedFile.value,
      logo_title: selectedFile.value.name
    };
  
    try {
      const response = await $axios.put(`/api/firms/${firm_id}/logo/`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      show({type: 'success', message: 'Image uploaded successfully'});
    } catch (error) {
      console.error('FAILURE', error);
    }
  }
  </script>  