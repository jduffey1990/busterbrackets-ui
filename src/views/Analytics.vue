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
  <div
      v-else-if="isLoading"
      class="text-center"
  >
    <v-progress-linear
        color="primary"
        indeterminate
        class="mb-2"
    ></v-progress-linear>

    <div class="text-h4">Loading...</div>
  </div>
  <div v-else>
    <div v-if="client.needs_refreshed === true" class="refresh-div">
      <v-alert title="Preferences have changed" type="secondary">
        <br>
        <span>You have changed your investment preferences. If you would like this client to have their portfolio updated
          to reflect these changes, click "Refresh Portfolio" to apply.</span>

      </v-alert>
      <v-btn
          color="primary"
          text="Refresh Portfolio"
          @click=refreshPortfolio()
          class="mt-3"
      >
      </v-btn>
    </div>

    <div class="scatter_section mt-10">
      <h5 class="graph_title">Whole Portfolio Analysis</h5>
      <v-col class="scatter_graph">
        <div class="d-flex justify-center align-center h-100">
          <ScatterChart
              :data="getScatterChartData(wholeTableData)"
              :options="screenWidth > 700 ? bigOptions : littleOptions"
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
        <v-toolbar flat color="secondary" class="bars">
          <v-toolbar-title class="bar-title">Whole Portfolio Analysis</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.metric="{ item }">

        <p v-on:mouseover="hovering[item.metric] = true" v-on:mouseleave="hovering[item.metric] = false">
          {{ item.metric }}
          <v-tooltip
              v-if="hovering[item.metric] && wholeToolTips[item.metric]"
              :text="wholeToolTips[item.metric]"
              location="top"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                  v-bind="props"
                  size="x-small"
                  color="grayblue"
                  class="ml-2">mdi-information
              </v-icon>
            </template>
          </v-tooltip>
        </p>
      </template>
      <template #bottom></template>
    </v-data-table>

    <div v-if="lineDatasets.length !== 0" class="line_section mt-10">
      <h5 class="graph_title">Hypothetical Growth of $10,000 (5 years)</h5>
      <v-col class="line_graph">
        <div class="d-flex justify-center align-center h-100">
          <LineChart :labels="lineLabels" :datasets="lineDatasets"/>
        </div>
      </v-col>
    </div>

    <v-data-table
        :items="metricTableData"
        :headers="metricHeaders"
        :items-per-page="-1"
        class="elevation-1 mt-10"
    >
      <template
          v-for="header in metricHeaders"
          :key="header.key"
          v-slot:[`header.${header.key}`]="{ column }">
        <span>{{ column.title }}</span>
        <v-tooltip
            v-if="column.tooltip"
            :text="column.tooltip"
            location="top"
        >
          <template v-slot:activator="{ props }">
            <v-icon
                v-bind="props"
                small
                color="grayblue"
                class="ml-2">mdi-information
            </v-icon>
          </template>
        </v-tooltip>
      </template>
      <template v-slot:top>
        <v-toolbar flat color="secondary" class="bars">
          <v-toolbar-title class="bar-title">U.S. Large & Mid Cap Stock Comparison</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.metric="{ item }">

        <p v-on:mouseover="hovering[item.metric] = true" v-on:mouseleave="hovering[item.metric] = false">
          {{ item.metric }}
          <v-tooltip
              v-if="hovering[item.metric] && wholeToolTips[item.metric]"
              :text="wholeToolTips[item.metric]"
              location="top"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                  v-bind="props"
                  size="x-small"
                  color="grayblue"
                  class="ml-2">mdi-information
              </v-icon>
            </template>
          </v-tooltip>
        </p>
      </template>
      <template #bottom></template>
    </v-data-table>

    <div class="mt-2 mb-2">
      <h6>
        <sup>*</sup>As of {{ formatDate(props.metrics.as_of) }}
      </h6>
    </div>
    <div class="mt-2 mb-10">
      <h6>
        <sup>*</sup>Advisor Fee: {{ getAdvisorFee() }}
      </h6>
    </div>
  </div>
  <hr>
  <div>
    <p class="disclosure-analytics">All performance is hypothetical and backtested. The backtested performance assumes
      monthly rebalancing and the
      reinvestment of dividends and does not account for transaction costs, market impacts, and taxes. The only fees
      that are included are ETF and mutual fund expense ratios and an advisor fee, if specified. The performance is
      based on historical data and is provided for informational purposes only. Historical data used for backtesting has
      been sourced from reliable third-party vendors, but the accuracy of data cannot be guaranteed. The backtested
      results may be subject to survivorship bias, meaning the analysis only includes companies or securities that have
      survived until the end of the test period. The market proxy benchmark is provided to include the effects of
      hindsight and survivorship bias in the benchmark. Results do not represent actual portfolios. Past performance is
      no guarantee of future returns.</p>
  </div>

</template>

<script setup>
import {computed, inject, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useUserStore} from "@/store/user";

const {show} = inject('toast');
const $axios = inject('$axios');

import ScatterChart from '../components/ScatterChart.vue';
import LineChart from '../components/LineChart.vue';
import {parseError} from "@/utils/error";

const screenWidth = window.innerWidth;
const {user} = storeToRefs(useUserStore());
const isLoading = ref(false)
const hovering = ref({
  'Volatility': false,
  '3 Year Return (Net of fees)': false,
  'Max Drawdown': false,
  'Sharpe Ratio': false,
  "Investment Fit Score": false,
  "Values Fit Score": false,
  "1yr Return": false,
  "3yr Return": false,
  "5yr Return": false,
  "Sortino Ratio": false,
  "Beta": false,
  "Tracking Error": false,
  "Active Share": false,
  "Up Capture": false,
  "Down Capture": false,
  "Correlation": false,
  "Best Year": false,
  "Worst Year": false,
});
const clg = (msg) => console.log(msg);
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
const clientLoaded = ref(false);
const lineLabels = computed(() =>
    Object.keys(props.metrics.net_growth_of_10k.IWB)
);

// Compute all datasets dynamically
const lineDatasets = computed(() => {

  const dataSeries = props.metrics.net_growth_of_10k;
  // Define the keys you want to include in the datasets
  const allowedKeys = ['pomarium', 'IWB', 'market'];

  const datasets = Object.keys(dataSeries)
      .filter(key => allowedKeys.includes(key)) // Only process allowed keys
      .map((key, index) => {
        const color =
            props.brandColors && props.brandColors[index]
                ? props.brandColors[index]
                : props.getUniqueRandomColor();

        let keyEnd = key.slice(1, key.length);
        let upperKey
        if (key === 'pomarium') {
          let firstName = client.value.first_name
          let firstEnd = firstName.slice(1, firstName.length)
          let changedName = firstName[0].toUpperCase() + firstEnd
          upperKey = `${changedName}'s Recommendation`
        } else {
          upperKey = key[0].toUpperCase() + keyEnd;
        }

        return {
          label: `${upperKey}`,
          data: Object.values(dataSeries[key]),
          borderColor: color,
          backgroundColor: `${color}33`, // Add transparency to the color
          fill: true,
          tension: 0.4,
        };
      });

  return datasets;
});

const refreshPortfolio = async () => {
  if (!confirm('By choosing to continue, you will reload the current page and may lose your existing portfolio ' +
      'allocations. Are you sure you want to continue?')) {
    return;  // Exit if user cancels the operation
  }

  isLoading.value = true

  try {
    let user_id = client.value.id
    let advisor_id = user.value.id
    await $axios.post(`/api/advisors/${advisor_id}/clients/${user_id}/portfolio/`);
    await updateClientRefreshField();  // Call patch request after POST succeeds
  } catch (error) {
    show({message: parseError(error), error: true});
  }

  location.reload();  // Reload only after all async operations complete successfully
};

const updateClientRefreshField = async () => {
  try {
    // Ensure that the correct data format is sent to the backend
    console.log("This is called")
    await $axios.patch(`/api/users/refresh-portfolio/${client.value.id}/`);
  } catch (error) {
    show({message: parseError(error), error: true});
  }
}


const getAdvisorFee = () => {
  clientLoaded.value = true
  return toPercentage(client.value.advisor_fee)
}

// Define headers for the v-data-table
const metricHeaders = [
  {
    title: '',
    key: 'metric',
    sortable: false,
  },
  {
    title: `${client.value.first_name}'s Recommendation`,
    key: 'pomariumValue',
    sortable: false,
  },
  {
    title: 'Market',
    key: 'marketValue',
    sortable: false,
    tooltip: "Market is a backtested version of the current Russell 1000 to account for the effects of hindsight" +
        " and survivorship bias"
  },
  {
    title: 'Russell 1000 ETF (IWB)',
    key: 'iwb',
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
      iwb: `${Math.round(props.metrics.IWB["investment_fit"])}%`,

    },
    {
      metric: 'Values Fit Score',
      pomariumValue: `${Math.round(props.metrics.pomarium["values_fit"])}%`,
      marketValue: `${Math.round(props.metrics.market["values_fit"])}%`,
      iwb: `${Math.round(props.metrics.IWB["values_fit"])}%`,
    },
    {
      metric: '1yr Return',
      pomariumValue: toPercentage(props.metrics.pomarium["1yr return"]),
      marketValue: toPercentage(props.metrics.market["1yr return"]),
      iwb: toPercentage(props.metrics.IWB["1yr return"]),

    },
    {
      metric: '3yr Return',
      pomariumValue: toPercentage(props.metrics.pomarium["3yr return"]),
      marketValue: toPercentage(props.metrics.market["3yr return"]),
      iwb: toPercentage(props.metrics.IWB["3yr return"]),
    },
    {
      metric: '5yr Return',
      pomariumValue: toPercentage(props.metrics.pomarium["5yr return"]),
      marketValue: toPercentage(props.metrics.market["5yr return"]),
      iwb: toPercentage(props.metrics.IWB["5yr return"]),
    },
    {
      metric: 'Volatility',
      pomariumValue: toPercentage(props.metrics.pomarium["volatility"]),
      marketValue: toPercentage(props.metrics.market["volatility"]),
      iwb: toPercentage(props.metrics.IWB["volatility"]),
    },
    {
      metric: 'Sharpe Ratio',
      pomariumValue: props.metrics.pomarium["sharpe ratio"].toFixed(2),
      marketValue: props.metrics.market["sharpe ratio"].toFixed(2),
      iwb: props.metrics.IWB["sharpe ratio"].toFixed(2),
    },
    {
      metric: 'Sortino Ratio',
      pomariumValue: props.metrics.pomarium["sortino ratio"].toFixed(2),
      marketValue: props.metrics.market["sortino ratio"].toFixed(2),
      iwb: props.metrics.IWB["sortino ratio"].toFixed(2),
    },
    {
      metric: 'Max Drawdown',
      pomariumValue: toPercentage(props.metrics.pomarium["5yr max drawdown"]),
      marketValue: toPercentage(props.metrics.market["5yr max drawdown"]),
      iwb: toPercentage(props.metrics.IWB["5yr max drawdown"]),
    },
    {
      metric: 'Beta',
      pomariumValue: props.metrics.pomarium["beta"].toFixed(2),
      marketValue: props.metrics.market["beta"].toFixed(2),
      iwb: props.metrics.IWB["beta"].toFixed(2),
    },
    {
      metric: 'Yield (12mo)',
      pomariumValue: toPercentage(props.metrics.pomarium["yield"]),
      marketValue: toPercentage(props.metrics.market["yield"]),
      iwb: toPercentage(props.metrics.IWB["yield"]),
    },
    {
      metric: 'Tracking Error',
      pomariumValue: toPercentage(props.metrics.pomarium["tracking_error"]),
      marketValue: toPercentage(props.metrics.market["tracking_error"]),
      iwb: toPercentage(props.metrics.IWB["tracking_error"]),
    },
    {
      metric: 'Active Share',
      pomariumValue: `${Math.round(props.metrics.pomarium["active_share"])}%`,
      marketValue: `${Math.round(props.metrics.market["active_share"])}%`,
      iwb: `${Math.round(props.metrics.IWB["active_share"])}%`,
    },
    {
      metric: 'Up Capture',
      pomariumValue: `${Math.round(props.metrics.pomarium["upcapture"])}%`,
      marketValue: `${Math.round(props.metrics.market["upcapture"])}%`,
      iwb: `${Math.round(props.metrics.IWB["upcapture"])}%`,
    },
    {
      metric: 'Down Capture',
      pomariumValue: `${Math.round(props.metrics.pomarium["downcapture"])}%`,
      marketValue: `${Math.round(props.metrics.market["downcapture"])}%`,
      iwb: `${Math.round(props.metrics.IWB["downcapture"])}%`,
    },
    {
      metric: 'Correlation',
      pomariumValue: props.metrics.pomarium["correlation"].toFixed(2),
      marketValue: props.metrics.market["correlation"].toFixed(2),
      iwb: props.metrics.IWB["correlation"].toFixed(2),
    },
    {
      metric: 'Best Year',
      pomariumValue: toPercentage(props.metrics.pomarium["best_year"]),
      marketValue: toPercentage(props.metrics.market["best_year"]),
      iwb: toPercentage(props.metrics.IWB["best_year"]),
    },
    {
      metric: 'Worst Year',
      pomariumValue: toPercentage(props.metrics.pomarium["worst_year"]),
      marketValue: toPercentage(props.metrics.market["worst_year"]),
      iwb: toPercentage(props.metrics.IWB["worst_year"]),
    },
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
      "US Stocks (VTI)": toPercentage(props.metrics.full_portfolio['VTI']['5yr max drawdown']),
      "Int Stocks (VXUS)": toPercentage(props.metrics.full_portfolio['VXUS']['5yr max drawdown']),
      "Bonds (BND)": toPercentage(props.metrics.full_portfolio['BND']['5yr max drawdown']),
      "Cash (SHV)": toPercentage(props.metrics.full_portfolio['SHV']['5yr max drawdown']),
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
    {
      metric: 'Sharpe Ratio',
      veryLow: props.metrics.full_portfolio[0]['sharpe ratio'].toFixed(2),
      low: props.metrics.full_portfolio[1]['sharpe ratio'].toFixed(2),
      medium: props.metrics.full_portfolio[2]['sharpe ratio'].toFixed(2),
      high: props.metrics.full_portfolio[3]['sharpe ratio'].toFixed(2),
      veryHigh: props.metrics.full_portfolio[4]['sharpe ratio'].toFixed(2),
      "US Stocks (VTI)": props.metrics.full_portfolio['VTI']['sharpe ratio'].toFixed(2),
      "Int Stocks (VXUS)": props.metrics.full_portfolio['VXUS']['sharpe ratio'].toFixed(2),
      "Bonds (BND)": props.metrics.full_portfolio['BND']['sharpe ratio'].toFixed(2),
      "Cash (SHV)": props.metrics.full_portfolio['SHV']['sharpe ratio'].toFixed(2),
    },
    {
      metric: 'Yield (12mo)',
      veryLow: toPercentage(props.metrics.full_portfolio[0]['yield']),
      low: toPercentage(props.metrics.full_portfolio[1]['yield']),
      medium: toPercentage(props.metrics.full_portfolio[2]['yield']),
      high: toPercentage(props.metrics.full_portfolio[3]['yield']),
      veryHigh: toPercentage(props.metrics.full_portfolio[4]['yield']),
      "US Stocks (VTI)": toPercentage(props.metrics.full_portfolio['VTI']["yield"]),
      "Int Stocks (VXUS)": toPercentage(props.metrics.full_portfolio['VXUS']["yield"]),
      "Bonds (BND)": toPercentage(props.metrics.full_portfolio['BND']["yield"]),
      "Cash (SHV)": toPercentage(props.metrics.full_portfolio['SHV']["yield"]),
    },
    {
      metric: 'Expense Ratio',
      veryLow: toPercentage(props.metrics.full_portfolio[0]['expense ratio'], 2),
      low: toPercentage(props.metrics.full_portfolio[1]['expense ratio'], 2),
      medium: toPercentage(props.metrics.full_portfolio[2]['expense ratio'], 2),
      high: toPercentage(props.metrics.full_portfolio[3]['expense ratio'], 2),
      veryHigh: toPercentage(props.metrics.full_portfolio[4]['expense ratio'], 2),
      "US Stocks (VTI)": toPercentage(props.metrics.full_portfolio['VTI']["expense ratio"], 2),
      "Int Stocks (VXUS)": toPercentage(props.metrics.full_portfolio['VXUS']["expense ratio"], 2),
      "Bonds (BND)": toPercentage(props.metrics.full_portfolio['BND']["expense ratio"], 2),
      "Cash (SHV)": toPercentage(props.metrics.full_portfolio['SHV']["expense ratio"], 2),
    },
  ];
});

const wholeToolTips = {
  'Volatility': 'A measure of price variation over time; higher values generally indicate greater risk.',
  '3 Year Return (Net of fees)': 'The largest percentage loss from a peak before a recovery.',
  'Max Drawdown': 'The annualized return over three years, after fees.',
  'Sharpe Ratio': 'A measure of risk-adjusted return; higher is better.',
  "Investment Fit Score": "How well the investment aligns with your advisor's investment preferences.",
  "Values Fit Score": "How well the investment aligns with your personal values.",
  "1yr Return": "The total return of the investment over the past year, after fees.",
  "3yr Return": "The annualized return of the investment over the past three years, after fees.",
  "5yr Return": "The annualized return of the investment over the past five years, after fees.",
  "Sortino Ratio": "A risk-adjusted return metric that focuses only on downside risk.",
  "Beta": "The investment's sensitivity to market movements; 1 = moves with the market.",
  "Tracking Error": "How closely the investment follows benchmark performance.",
  "Active Share": "The percentage of the portfolio that differs from its benchmark.",
  "Up Capture": "How well the portfolio performs during market upswings.",
  "Down Capture": "How well the portfolio limits losses during market downturns.",
  "Correlation": "How closely the investment's returns move with the market's.",
  "Best Year": "The highest annual return the investment has achieved.",
  "Worst Year": "The lowest annual return the investment has experienced.",
}

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

function toPercentage(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

const bigOptions = {
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
};

const littleOptions = {
  responsive: true,
  aspectRatio: 1,
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
};

console.log("needs refreshed", client.value)
</script>

<style>
.refresh-div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.scatter_section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.line_section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.graph_title {
  background-color: transparent;
  padding: 20px;
  font-size: 20px;
}

.scatter_graph {
  max-width: 60%;
  padding-top: 0px;
}

.line_graph {
  max-width: 80%;
  padding-top: 0px;
}

.disclosure-analytics {
  font-size: 14px !important;
  color: rgba(7, 21, 42, 0.6);
  line-height: 1.3;
  margin-top: 20px;
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

  .bars {
    height: 40px;
  }

  .bar-title {
    transform: translateY(-55px);
  }
}

</style>