<template>
  <pre>{{ useUserStore().getUser }}</pre>
</template>

<script setup>
import { useUserStore } from '@/store/user';
</script>
