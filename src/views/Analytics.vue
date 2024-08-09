<template>
  <div v-if="metricsLoading" class="text-center">
    <v-progress-linear color="primary" indeterminate class="mb-2"></v-progress-linear>
    <div class="text-h4">Loading...</div>
  </div>
  <div v-else>
    <div class="metrics-content">
      <div class="metric-item" v-for="(value, key) in metrics" :key="key">
        <div class="text-h4">{{ key }}</div>
        <div>{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  metrics: Object,
  metricsLoading: Boolean,
  getMetrics: Function
});
</script>

<style scoped>
.metrics-content {
  /* placeholder */
}

.metric-item {
  margin-bottom: 1rem;
}
</style>
