<template>
    <!-- <v-btn @click="clg(billingDataSuper)">test</v-btn> -->
    <div class="d-flex mt-8">
        <v-card
            :title="addCommas(totalAccValue)"
            text="Total AUM"
            width="200px"
            style="text-align: center;"
            class="mr-4"
        ></v-card>
        <v-card
            :title="addCommas(averageAccValue.toFixed(2))"
            text="Average Account Value"
            width="200px"
            style="text-align: center;"
            class="mx-4"
        ></v-card>
        <v-card
            :title="addCommas(valueFitAvg.toFixed(2))"
            text="Average Value Fit"
            width="200px"
            style="text-align: center;"
            class="mx-4"
        ></v-card>
        <v-card
            :title="addCommas(investmentFitAvg.toFixed(2))"
            text="Average Investment Fit"
            width="200px"
            style="text-align: center;"
            class="mx-4"
        ></v-card>
    </div>

    <h4 class="my-6">All Accounts</h4>
    <div class="d-flex mb-6">
        <v-select
            label="Filters"
            v-model="selectedFilters"
            :items="filterItems"
            chips
            multiple
            style="width: 300px; max-width: 300px;"
        >
        </v-select>
        <v-btn class="my-2 mx-2" @click="apply" color="primary">Apply</v-btn>
        <v-btn class="my-2 mx-2" @click="downloadCSV(billingDataSuper, billingHeaders, 'AllAccounts')">Download CSV</v-btn>
    </div>
    <v-data-table
        :headers="billingHeaders"
        :items="billingDataSuper"
        :items-per-page="10"
        class="elevation-1"
    >
    </v-data-table>
    <div v-if="loadBar">
        <BarChart
            :data="getBarChart(esgBarData)"
            :options="screenWidth > 700 ? barOptions : barOptionsSmall"
            class="my-6"
        />
        <BarChart
            :data="getBarChart(elimBarData)"
            :options="screenWidth > 700 ? barOptions : barOptionsSmall"
            class="my-6"
        />
    </div>
    

</template>
<script setup>
import {ref, onMounted, inject, computed,} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {parseError} from '@/utils/error';
import { addCommas, formatDate } from '@/utils/string';
import { downloadCSV } from '@/utils/file';
import BarChart from './BarChart.vue';


const $axios = inject('$axios');
const {show} = inject('toast');

const {user} = storeToRefs(useUserStore());

const billingDataSuper = ref([]);
const selectedFilters = ref([]);
const dataCopy = ref([]);
const loadBar = ref(false);
const accounts = ref([]);
const totalAccValue = ref(0);
const averageAccValue = ref(0);
const esgNames = ref([]);
const esgCount = ref({});
const eliminationNames = ref([]);
const eliminationCount = ref({});
const esgBarData = ref([]);
const elimBarData = ref([]);
const valueFitAvg = ref(0);
const investmentFitAvg = ref(0);

const billingHeaders = [
{title: 'Firm', key: 'firm_name'},
{title: 'Advisor ', key: 'advisor_full_name'},
{title: 'Client', key: 'user_full_name'},
{title: 'Last Four', key: 'last_four'},
{title: 'Account', key: 'name'},
{title: 'Start Date', key: 'created_at', nowrap: true},
{title: 'End Date', key: 'closed_at'},
{title: 'Account Value', key: 'value'},
];

const fetchAccountsForErik = async () => {
    try {
        const response = await $axios.get('/api/reports/all-accounts-report/');
        const newData = response.data.map((data) => {
            const createdAt = formatDate(data.created_at);
            const valueWithCommas = addCommas(Number(data.value), true);
            return {
                ...data,
                created_at: createdAt,
                value: valueWithCommas,
            };
        });
        billingDataSuper.value = billingDataSuper.value.concat(newData);
        dataCopy.value = billingDataSuper.value;
    }
    catch (error) {
        parseError(error);
    };
};

const fetchPD = async () => {
    try{
        const response = await $axios.get('/api/reports/pd/');
        console.log(response.data);
        response.data.forEach((portfolio) => {
            esgNames.value.push(portfolio.portfolio_data.esg_factor_data.esg_names);
        });
        response.data.forEach((portfolio) => {
            eliminationNames.value.push(portfolio.portfolio_data.eliminations)
        });
        esgNames.value.forEach((esgName) => {
            esgName.forEach((name) => {
                if (esgCount.value[name]) {
                    esgCount.value[name] += 1;
                } else {
                    esgCount.value[name] = 1;
                }
            });
        });
        eliminationNames.value.forEach((elimName) => {
            Object.keys(elimName).forEach((key) => {
            if (eliminationCount.value[key]) {
                eliminationCount.value[key] += 1;
            } else {
                eliminationCount.value[key] = 1;
            }
            });
        });
        Object.keys(esgCount.value).forEach((key) => {
            esgBarData.value.push({
                title: 'Values',
                value: esgCount.value[key],
                type: key,
            });
        });
        Object.keys(eliminationCount.value).forEach((key) => {
            elimBarData.value.push({
                title: 'Eliminations',
                value: eliminationCount.value[key],
                type: key,
            });
        });
        //get the average portfolio_data.market_investment_fit and portfolio_data.market_values_fit
        const valueFitSum = response.data.reduce((acc, portfolio) => acc + portfolio.portfolio_data.market_values_fit, 0);
        valueFitAvg.value = valueFitSum / response.data.length;
        const investmentFitSum = response.data.reduce((acc, portfolio) => acc + portfolio.portfolio_data.market_investment_fit, 0);
        investmentFitAvg.value = investmentFitSum / response.data.length;
        console.log(investmentFitAvg.value);
        console.log(valueFitAvg.value);
        loadBar.value = true;
    } catch (error) {
        parseError(error);
    };
};

const getAllAccounts = async () => {
    try {
        const response = await $axios.get('/api/accounts/all-accounts/');
        accounts.value = response.data;
        getTotalAccValue();
        getAverageAccValue();
    }
    catch (error) {
        parseError(error);
    };
};

const getTotalAccValue = () => {
    totalAccValue.value = accounts.value.reduce((acc, account) => acc + Number(account.value), 0);
};

const getAverageAccValue = () => {
    averageAccValue.value = totalAccValue.value / accounts.value.length;
};

const filterItems = ['Live', 'Archived', 'Not Archived'];

const apply = () => {
    billingDataSuper.value = dataCopy.value;
    if (selectedFilters.value.length === 0) {
        billingDataSuper.value = billingDataSuper.value;
    } else {
        if (selectedFilters.value.includes('Live')) {
            billingDataSuper.value = billingDataSuper.value.filter((account) => account.active === true);
        }
        if (selectedFilters.value.includes('Not Archived')) {
            billingDataSuper.value = billingDataSuper.value.filter((account) => account.is_archived === false);
        }
        if (selectedFilters.value.includes('Archived')) {
            billingDataSuper.value = billingDataSuper.value.filter((account) => account.is_archived === true);
        }
    }
};

const brandColors = [
  '#07152A', '#F9BBA9', '#FFE6B6', '#CF6232', '#CDD0D4', '#636970',
  '#903F30', '#0E2F5F', '#FCC35B', '#FEFCF7', '#9CA1AA', '#F2E7D2', '#6F4C45',
  'rgba(7, 21, 42, 0.9)', 'rgba(249, 187, 169, 0.9)', 'rgba(255, 230, 182, 0.9)', 'rgba(207, 98, 50, 0.9)', 'rgba(205, 208, 212, 0.9)', 'rgba(99, 105, 112, 0.9)',
  'rgba(144, 63, 48, 0.9)', 'rgba(14, 47, 95, 0.9)', 'rgba(252, 195, 91, 0.9)', 'rgba(254, 252, 247, 0.9)', 'rgba(156, 161, 170, 0.9)', 'rgba(242, 231, 210, 0.9)', 'rgba(111, 76, 69, 0.9)'
];

const generateRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, '0')}`;
};

const getUniqueRandomColor = (colors, usedColors) => {
  let color;
  if (usedColors.size >= colors.length) {
    do {
      color = generateRandomColor();
    } while (usedColors.has(color));
  } else {
    do {
      const index = Math.floor(Math.random() * colors.length);
      color = colors[index];
    } while (usedColors.has(color));
  }
  usedColors.add(color);
  return color;
};

const getBarChart = (data) => {
    if (!data || !data.length) {
        return {
            labels: ['Values'],
            datasets: [],
        };
    }
    const usedColors = new Set();
    const sortedData = data.sort((a, b) => b.value - a.value);
    const datasets = sortedData.map((item) => {
        return {
            label: item.type,
            data: [item.value],
            backgroundColor: getUniqueRandomColor(brandColors, usedColors),
        };
    });
    return {
        labels: [data[0].title],
        datasets: datasets,
    };
}

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
  },
  scales: {
        x: {
        stacked: false,
        },
    }
};

const barOptionsSmall = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  x: {
    ticks: false,
  },
};

const screenWidth = window.innerWidth;
onMounted(() => {
    fetchAccountsForErik();
    fetchPD();
    getAllAccounts();
});

</script>
<style>

</style>