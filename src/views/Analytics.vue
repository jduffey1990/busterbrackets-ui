<template>
  <div v-if="noMetrics">
    <v-alert v-if="noMetrics" title="No analytics have been generated yet" type="secondary">
      <br>If you haven't taken the survey, those "values" are needed for analysis to be run. If you have taken the
      survey, you may need to simply resubmit to see this page. Both options can be done at the link below.
    </v-alert>
    <router-link
        :to="{ name: 'Survey', query: { user_id: client.id } }"
        custom
        v-slot="{ navigate }"
    >
      <v-btn
          color="primary"
          text="Open Values Profile"
          @click="navigate"
          class="mt-3"
      >
      </v-btn>
    </router-link>
  </div>
  <div v-else>
    <v-data-table
        :items="tableData"
        :headers="metricHeaders"
        :items-per-page="-1"
        class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Metrics Comparison</v-toolbar-title>
        </v-toolbar>
      </template>
      <template #bottom v-if="metricHeaders.length < 10"></template>
    </v-data-table>
    <div>
      <h6>
        <sup>*</sup> This comparison is from data that is valid as of {{ formatDate(props.metrics.as_of) }}
      </h6>
    </div>
  </div>
</template>


<script setup>
import {computed} from "vue";
// Props
const props = defineProps({
  metrics: Object,
  client: Object,
  metricsLoading: Boolean,
  noMetrics: Boolean,
});

// Use a computed property to safely access client
const client = computed(() => props.client);

// Log the client to see when it becomes available
console.log("the client is", client.value);

// Define headers for the v-data-table
const metricHeaders = [
  {
    title: '',
    key: 'metric',
    sortable: false,
  },
  {
    title: 'Pomarium',
    key: 'pomariumValue',
    sortable: false,
  },
  {
    title: 'Market',
    key: 'marketValue',
    sortable: false,
  },
];

// Prepare data for the table only if metrics are available and structured correctly
const tableData = computed(() => {
  if (!props.metrics || !props.metrics.pomarium || !props.metrics.market) {
    return [];
  }

  return [
    {
      metric: '1yr Return',
      pomariumValue: props.metrics.pomarium["1yr return"],
      marketValue: props.metrics.market["1yr return"],
    },
    {
      metric: '3yr Return',
      pomariumValue: props.metrics.pomarium["3yr return"],
      marketValue: props.metrics.market["3yr return"],
    },
    {
      metric: '5yr Return',
      pomariumValue: props.metrics.pomarium["5yr return"],
      marketValue: props.metrics.market["5yr return"],
    },
    {
      metric: '5yr Max Drawdown',
      pomariumValue: props.metrics.pomarium["5yr max drawdown"],
      marketValue: props.metrics.market["5yr max drawdown"],
    },
    {
      metric: 'Volatility',
      pomariumValue: props.metrics.pomarium["volatility"],
      marketValue: props.metrics.market["volatility"],
    },
    {
      metric: 'Tracking Error',
      pomariumValue: props.metrics.pomarium["tracking_error"],
      marketValue: props.metrics.market["tracking_error"],
    },
    {
      metric: 'Beta (Market Exposure Metric)',
      pomariumValue: props.metrics.pomarium["beta"],
      marketValue: props.metrics.market["beta"],
    },
    {
      metric: 'Investment Fit Score',
      pomariumValue: props.metrics.pomarium["investment_fit"],
      marketValue: props.metrics.market["investment_fit"],
    },
    {
      metric: 'Values Fit Score',
      pomariumValue: props.metrics.pomarium["values_fit"],
      marketValue: props.metrics.market["values_fit"],
    },
  ];
});

function formatDate(dateString) {
  if (dateString === '' || dateString === null || dateString === undefined) {
    return dateString
  }
  const [year, month, day] = dateString.split('-');
  const date = new Date(Date.UTC(year, month - 1, day));  // Treat the date as UTC

  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  return date.toLocaleDateString('en-US', options);
}
</script>


<style scoped>
.elevation-1 {
  margin-top: 20px;
}

h6 {
  margin-top: 10px;
  font-style: italic;
  color: #666; /* Adjust color to fit with your design */
}

h6 sup {
  font-size: 0.8em; /* Smaller superscript */
  vertical-align: center; /* Align the superscript properly */
  color: #000; /* Superscript color, can be adjusted */
}
</style>
