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

    <div class="scatter_section mt-10">
      <h5 class="graph_title">Whole Portfolio Analysis</h5>
      <v-col class="scatter_graph">
        <div class="d-flex justify-center align-center h-100">
          <ScatterChart
              :data="getScatterChartData(wholeTableData)"
              :options="{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                labels: {
                  usePointStyle: true
                }
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Volatility (%)'
                }
              },
              y: {
                title: {
                  display: true,
                  text: '3 Year Return (%)'
                }
              }
            }

          }"
          />
        </div>
      </v-col>
    </div>

    <v-data-table
        :items="wholeTableData"
        :headers="wholeHeaders"
        :items-per-page="-1"
        class="elevation-1 mt-10"
    >
      <template v-slot:top>
        <v-toolbar flat color="secondary">
          <v-toolbar-title>Whole Portfolio Analysis</v-toolbar-title>
        </v-toolbar>
      </template>
      <template #bottom v-if="wholeHeaders.length < 10"></template>
    </v-data-table>

    <v-data-table
        :items="metricTableData"
        :headers="metricHeaders"
        :items-per-page="-1"
        class="elevation-1 mt-10"
    >
      <template v-slot:top>
        <v-toolbar flat color="secondary">
          <v-toolbar-title>U.S. Large & Mid Cap Stock Comparison</v-toolbar-title>
        </v-toolbar>
      </template>
      <template #bottom v-if="metricHeaders.length < 10"></template>
    </v-data-table>

    <div class="mt-2 mb-10">
      <h6>
        <sup>*</sup>As of {{ formatDate(props.metrics.as_of) }}
      </h6>
    </div>
  </div>
</template>

<script setup>
import {computed} from "vue";

import ScatterChart from '../components/ScatterChart.vue';

// Props
const props = defineProps({
  metrics: Object,
  client: Object,
  metricsLoading: Boolean,
  noMetrics: Boolean,
  getUniqueRandomColor: Function,
  brandColors: Array,
});

// Use a computed property to safely access client
const client = computed(() => props.client);

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

const wholeHeaders = [
  {
    title: "",
    key: 'metric',
    sortable: false,
  },
  {
    title: "Very Low Risk",
    key: 'veryLow',
    sortable: false,
  },
  {
    title: 'Low Risk',
    key: 'low',
    sortable: false,
  },
  {
    title: 'Medium Risk',
    key: 'medium',
    sortable: false,
  },
  {
    title: 'High Risk',
    key: 'high',
    sortable: false,
  },
  {
    title: 'Very High Risk',
    key: 'veryHigh',
    sortable: false,
  },
  {
    title: 'US Stocks (VTI)',
    key: 'US Stocks (VTI)',
    sortable: false,
  },
  {
    title: 'Int Stocks (VXUS)',
    key: 'Int Stocks (VXUS)',
    sortable: false,
  },
  {
    title: 'Bonds (BND)',
    key: 'Bonds (BND)',
    sortable: false,
  },
  {
    title: 'Cash (SHV)',
    key: 'Cash (SHV)',
    sortable: false,
  },
];


const metricTableData = computed(() => {
  if (!props.metrics || !props.metrics.pomarium || !props.metrics.market) {
    return [];
  }

  return [
    {
      metric: 'Investment Fit Score',
      pomariumValue: `${Math.round(props.metrics.pomarium["investment_fit"])}%`,
      marketValue: `${Math.round(props.metrics.market["investment_fit"])}%`,
    },
    {
      metric: 'Values Fit Score',
      pomariumValue: `${Math.round(props.metrics.pomarium["values_fit"])}%`,
      marketValue: `${Math.round(props.metrics.market["values_fit"])}%`,
    },
    {
      metric: '1yr Return',
      pomariumValue: toPercentage(props.metrics.pomarium["1yr return"]),
      marketValue: toPercentage(props.metrics.market["1yr return"]),
    },
    {
      metric: '3yr Return',
      pomariumValue: toPercentage(props.metrics.pomarium["3yr return"]),
      marketValue: toPercentage(props.metrics.market["3yr return"]),
    },
    {
      metric: '5yr Return',
      pomariumValue: toPercentage(props.metrics.pomarium["5yr return"]),
      marketValue: toPercentage(props.metrics.market["5yr return"]),
    },
    {
      metric: '5yr Max Drawdown',
      pomariumValue: toPercentage(props.metrics.pomarium["5yr max drawdown"]),
      marketValue: toPercentage(props.metrics.market["5yr max drawdown"]),
    },
    {
      metric: 'Volatility',
      pomariumValue: toPercentage(props.metrics.pomarium["volatility"]),
      marketValue: toPercentage(props.metrics.market["volatility"]),
    },
    {
      metric: 'Tracking Error',
      pomariumValue: toPercentage(props.metrics.pomarium["tracking_error"]),
      marketValue: toPercentage(props.metrics.market["tracking_error"]),
    },
    {
      metric: 'Beta (Market Exposure Metric)',
      pomariumValue: props.metrics.pomarium["beta"].toFixed(2), // Beta usually isn't a percentage
      marketValue: props.metrics.market["beta"].toFixed(2),
    }
  ];
});

// Prepare data for the table only if metrics are available and structured correctly
const wholeTableData = computed(() => {
  if (!props.metrics || !props.metrics.full_portfolio) {
    return [];
  }

  return [
    {
      metric: 'Volatility',
      veryLow: toPercentage(props.metrics.full_portfolio[0]["volatility"]),
      low: toPercentage(props.metrics.full_portfolio[1]["volatility"]),
      medium: toPercentage(props.metrics.full_portfolio[2]["volatility"]),
      high: toPercentage(props.metrics.full_portfolio[3]["volatility"]),
      veryHigh: toPercentage(props.metrics.full_portfolio[4]["volatility"]),
      "US Stocks (VTI)": toPercentage(props.metrics.full_portfolio['VTI']["volatility"]),
      "Int Stocks (VXUS)": toPercentage(props.metrics.full_portfolio['VXUS']["volatility"]),
      "Bonds (BND)": toPercentage(props.metrics.full_portfolio['BND']["volatility"]),
      "Cash (SHV)": toPercentage(props.metrics.full_portfolio['SHV']["volatility"]),
    },
    {
      metric: 'Max Drawdown',
      veryLow: toPercentage(props.metrics.full_portfolio[0]['5yr max drawdown']),
      low: toPercentage(props.metrics.full_portfolio[1]['5yr max drawdown']),
      medium: toPercentage(props.metrics.full_portfolio[2]['5yr max drawdown']),
      high: toPercentage(props.metrics.full_portfolio[3]['5yr max drawdown']),
      veryHigh: toPercentage(props.metrics.full_portfolio[4]['5yr max drawdown']),
    },
    {
      metric: '3 Year Return (Net of fees)',
      veryLow: toPercentage(props.metrics.full_portfolio[0]['3yr return']),
      low: toPercentage(props.metrics.full_portfolio[1]['3yr return']),
      medium: toPercentage(props.metrics.full_portfolio[2]['3yr return']),
      high: toPercentage(props.metrics.full_portfolio[3]['3yr return']),
      veryHigh: toPercentage(props.metrics.full_portfolio[4]['3yr return']),
      "US Stocks (VTI)": toPercentage(props.metrics.full_portfolio['VTI']["3yr return"]),
      "Int Stocks (VXUS)": toPercentage(props.metrics.full_portfolio['VXUS']["3yr return"]),
      "Bonds (BND)": toPercentage(props.metrics.full_portfolio['BND']["3yr return"]),
      "Cash (SHV)": toPercentage(props.metrics.full_portfolio['SHV']["3yr return"]),
    },
    // {
    //   metric: 'Expense Ratio',
    //   veryLow: props.metrics.full_portfolio[0]['expense_ratio'].toFixed(2),
    //   low: props.metrics.full_portfolio[1]['expense_ratio'].toFixed(2),
    //   medium: props.metrics.full_portfolio[2]['expense_ratio'].toFixed(2),
    //   high: props.metrics.full_portfolio[3]['expense_ratio'].toFixed(2),
    //   veryHigh: props.metrics.full_portfolio[4]['expense_ratio'].toFixed(2),
    // },
  ];
});

const getScatterChartData = (data) => {
  const volatilityEntry = data.find(metric => metric.metric === 'Volatility');
  const returnEntry = data.find(metric => metric.metric === '3 Year Return (Net of fees)');

  if (!volatilityEntry || !returnEntry) {
    return {datasets: []};
  }

  const usedColors = new Set();

  // Separate risk categories (portfolios) and indices
  const portfolios = [
    {key: 'veryLow', label: 'Very Low'},
    {key: 'low', label: 'Low'},
    {key: 'medium', label: 'Medium'},
    {key: 'high', label: 'High'},
    {key: 'veryHigh', label: 'Very High'}
  ];

  const indices = ['US Stocks (VTI)', 'Int Stocks (VXUS)', 'Bonds (BND)', 'Cash (SHV)'];

  // Create datasets for portfolios (circles)
  const portfolioDatasets = portfolios.map((portfolio) => ({
    label: portfolio.label, // Display friendly label in the legend
    data: [{
      x: parseFloat(volatilityEntry[portfolio.key] || 0), // x-axis is Volatility
      y: parseFloat(returnEntry[portfolio.key] || 0), // y-axis is 3 Year Return
    }],
    backgroundColor: props.getUniqueRandomColor(props.brandColors, usedColors),
    radius: 5,
    pointStyle: 'circle', // Portfolios will have circle points
  }));

  // Create datasets for indices (triangles)
  const indexDatasets = indices.map((index) => ({
    label: index,
    data: [{
      x: parseFloat(volatilityEntry[index] || 0), // x-axis is Volatility
      y: parseFloat(returnEntry[index] || 0), // y-axis is 3 Year Return
    }],
    backgroundColor: props.getUniqueRandomColor(props.brandColors, usedColors),
    radius: 4,
    pointStyle: 'triangle', // Indices will have triangle points
  }));

  // Combine portfolios and indices into the datasets array
  const datasets = [...portfolioDatasets, ...indexDatasets];

  return {datasets};
};


function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  // Split the date string into year, month, and day
  const [year, month, day] = dateString.split('-');

  // Create a Date object without UTC conversion
  const date = new Date(year, month - 1, day); // No UTC conversion

  // Format the date as "Month Day, Year"
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  return date.toLocaleDateString('en-US', options);
}

function toPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}
</script>

<style>
.scatter_section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.graph_title {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 20px;
  font-size: 20px;
}

.scatter_graph {
  max-width: 60%;
  padding-top: 0px;
}

@media only screen and (max-width: 1275px) {
  .scatter_graph {
    max-width: 80%;
  }
}

@media only screen and (max-width: 700px) {
  .scatter_graph {
    max-width: 100%;
  }
}
</style>