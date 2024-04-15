<template>
  <div>
    <div class="d-flex my-6">
      <div class="text-h4">{{ client.full_name }}</div>

      <v-spacer></v-spacer>

      <v-btn
        color="primary"
        text="Create Survey"
        @click="router.push(`/clients/${client.uuid}/survey`)"
      ></v-btn>
    </div>

    <div>{{ client }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const $axios = inject('$axios');

const client = ref({});

const getClient = async () => {
  const { data } = await $axios.get(
    `/api/advisors/clients/${useRoute().params.uuid}/`
  );

  client.value = data;
};

getClient();
</script>
