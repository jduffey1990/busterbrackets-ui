<template>
    <div class="d-flex mt-8">
        <v-card
            :title="props.advisorLength"
            text="Advisors"
            width="200px"
            style="text-align: center;"
            class="mr-4"
        >
        </v-card>
        <v-card
            :title="clientsWithAccts"
            text="Clients with Accounts"
            width="200px"
            style="text-align: center;"
            class="mx-4"
        >
        </v-card>
        <v-card
            :title="numOfAccts"
            text="Number of Accounts"
            width="200px"
            style="text-align: center;"
            class="mx-4"
        >
        </v-card>
    </div>
    <div class="d-flex mt-8">
        <v-card
            :title="addCommas(totalAccValue)"
            text="Total AUM"
            width="200px"
            style="text-align: center;"
            class="mr-4"
        ></v-card>
        <v-card
            :title="valueFitAvg.toFixed(2)"
            text="Average Value Fit"
            width="200px"
            style="text-align: center;"
            class="mx-4"
        ></v-card>
        <v-card
            :title="investmentFitAvg.toFixed(2)"
            text="Average Investment Fit"
            width="200px"
            style="text-align: center;"
            class="mx-4"
        ></v-card>    
    </div>
    <div class="d-flex mt-8">
        <v-card
            :title="addCommas(averageAccValue.toFixed(2))"
            text="Average Account Value"
            width="200px"
            style="text-align: center;"
            class="mr-4"
        ></v-card>
        <v-card
            :title="marketVfitAvg.toFixed(2)"
            text="Average Market VFit"
            width="200px"
            style="text-align: center;"
            class="mx-4"
        ></v-card>
        <v-card
            :title="marketIFitAvg.toFixed(2)"
            text="Average Market IFit"
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
        <template #item.name="{ item }">
            <router-link
                :to="{
              name: 'Accounts',
              params: { user_id: item.user },
              query: { account_id: item.id },
            }">
              {{ item.name }}
            </router-link>
          </template>
    </v-data-table>
    <div v-if="loadBar">
        <div class="d-flex flex-wrap my-6">
            <v-chip
                v-for="(item, index) in esgPieTitles"
                :key="index"
                @click="(item.strikethrough = !item.strikethrough), (esgBarData = filterData(esgBarData, esgBarDataCopy, esgPieTitles))"
                :class="{'text-decoration-line-through': item.strikethrough}"
                class="mx-2 my-2"
                :style="{backgroundColor: item.title === 'Reset' ? '#07152A' : '', color: item.title === 'Reset' ? 'white' : ''}"
            >
                {{item.title}}
            </v-chip>
        </div>
        <PieChart
            :data="getPieChart(esgBarData)"
            class="my-6"
            style="max-height: 70vh;"
            :options="{responsive: true, plugins: {legend: {display: false,}}}"
        />
        <div class="d-flex flex-wrap my-6">
            <v-chip
                v-for="(item, index) in pieTitles"
                :key="index"
                @click="(item.strikethrough = !item.strikethrough), (elimBarData = filterData(elimBarData, elimBarDataCopy, pieTitles))"
                :class="{'text-decoration-line-through': item.strikethrough}"
                class="mx-2 my-2"
                :style="{backgroundColor: item.title === 'Reset' ? '#07152A' : '', color: item.title === 'Reset' ? 'white' : ''}"
            >
                {{item.title}}
            </v-chip>
        </div>
        <PieChart
            :data="getPieChart(elimBarData)"
            class="my-6"
            style="max-height: 70vh;"
            :options="{responsive: true, plugins: {legend: {display: false,}}}"
        />
        <ScatterChart
            :data="getScatterChart([subtractedIFitScores, subtractedVFitScores])"
            :options="screenWidth > 700 ? bigOptions : littleOptions"
            class="my-6"
        />
    </div>
    

</template>
<script setup>
import {ref, onMounted, inject, computed,} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import { useRouter } from 'vue-router';
import {parseError} from '@/utils/error';
import { addCommas, formatDate } from '@/utils/string';
import { downloadCSV } from '@/utils/file';
import BarChart from './BarChart.vue';
import ScatterChart from './ScatterChart.vue';
import PieChart from './PieChart.vue';


const $axios = inject('$axios');
const {show} = inject('toast');

const {user} = storeToRefs(useUserStore());

const router = useRouter();

const props = defineProps({
    chosenAdvisorId: {
        type: [Object],
        default: null
    },
    chosenFirmId: {
        type: [Object],
        default: null
    },
    advisorLength: {
        type: Number,
        default: 0
    },
    advisorPage: {
        type: Boolean,
        default: false
    }
});



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
const marketIFitAvg = ref(0);
const marketVfitAvg = ref(0);
const subtractedIFitScores = ref({});
const subtractedVFitScores = ref({});
const elimPieData = ref({});
const pieTitles = ref({});
const esgPieTitles = ref({});
const elimBarDataCopy = ref([]);
const esgBarDataCopy = ref([]);
const numOfAccts = ref(0);
const clientsWithAccts = ref(0);

const billingHeaders = [
{title: 'Firm', key: 'firm_name'},
{title: 'Advisor ', key: 'advisor_full_name'},
{title: 'Client', key: 'user_full_name'},
{title: 'Last Four', key: 'last_four'},
{title: 'Account', key: 'name'},
{title: 'Created On', key: 'created_at', nowrap: true},
{title: 'Account Value', key: 'value'},
{title: 'Archived', key: 'is_archived'},
];

const fetchAccountsForErik = async () => {
    try {
        const url = props.advisorPage ? `/api/reports/firm-accounts-report/${user.value.firm.id}/` : '/api/reports/all-accounts-report/';

        const response = await $axios.get(url);
        console.log(response.data, 'accounts data');
        props.chosenFirmId && props.chosenFirmId.id ? response.data = response.data.filter((account) => account.firm_id === props.chosenFirmId.id) : response.data;
        props.chosenAdvisorId && props.chosenAdvisorId.id ? response.data = response.data.filter((account) => account.advisor_id === props.chosenAdvisorId.id) : response.data;

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
        getTotalAccValue();

        const uniqueClients = new Set();
        response.data.forEach((account) => {
            uniqueClients.add(account.user);
        });
        clientsWithAccts.value = uniqueClients.size;
    }
    catch (error) {
        parseError(error);
    };
};

const fetchPD = async () => {
    try{
        const url = props.advisorPage ? `/api/reports/pd-firm/${user.value.firm.id}/` : '/api/reports/pd/';
        const response = await $axios.get(url);
        console.log(response.data, 'pd data');

        props.chosenFirmId && props.chosenFirmId.id ? response.data = response.data.filter((portfolio) => portfolio.firm_id === props.chosenFirmId.id) : response.data;
        props.chosenAdvisorId && props.chosenAdvisorId.id ? response.data = response.data.filter((portfolio) => portfolio.advisor_id === props.chosenAdvisorId.id) : response.data;

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
            for (const [title, keys] of Object.entries(esgTypesMap)) {
                if (keys.includes(key)) {
                    esgBarData.value.push({
                    title: title,
                    value: esgCount.value[key],
                    type: key,
                    });
                    break;
                }
            }
        });

        Object.keys(eliminationCount.value).forEach((key) => {
            for (const [title, keys] of Object.entries(typesMap)) {
                if (keys.includes(key)) {
                        elimBarData.value.push({
                        title: Object.keys(typesMap).find(type => typesMap[type].includes(key)) || key,
                        value: eliminationCount.value[key],
                        type: categoriesMap[key] || key,
                    });
                    break;
                }
            }
        });

        valueFitAvg.value = calculateAverage(response.data, 'overall_values_fit');
        investmentFitAvg.value = calculateAverage(response.data, 'overall_investment_fit');
        marketVfitAvg.value = calculateAverage(response.data, 'market_values_fit');
        marketIFitAvg.value = calculateAverage(response.data, 'market_investment_fit');

        subtractedIFitScores.value = {
            metric: "Investment Fit"
        };

        response.data.forEach((portfolio, index) => {
            subtractedIFitScores.value[`client${index + 1}`] = portfolio.portfolio_data.overall_investment_fit - portfolio.portfolio_data.market_investment_fit;
        });

        subtractedVFitScores.value = {
            metric: "Values Fit"
        };

        response.data.forEach((portfolio, index) => {
            subtractedVFitScores.value[`client${index + 1}`] = portfolio.portfolio_data.overall_values_fit - portfolio.portfolio_data.market_values_fit;
        });

        pieTitles.value['Reset'] = {title: 'Reset', strikethrough: false};
        elimBarData.value.forEach((item) => {
            pieTitles.value[item.title] = {title: item.title, strikethrough: false};
        });

        esgPieTitles.value['Reset'] = {title: 'Reset', strikethrough: false};
        esgBarData.value.forEach((item) => {
            esgPieTitles.value[item.title] = {title: item.title, strikethrough: false};
        });

        elimBarDataCopy.value = elimBarData.value;
        esgBarDataCopy.value = esgBarData.value;

        loadBar.value = true;
    } catch (error) {
        parseError(error);
    };
};

const calculateAverage = (data, key) => {
    console.log(data, 'average data');
    const filteredData = data.filter(portfolio => portfolio.portfolio_data[key] !== undefined);
    const sum = filteredData.reduce((acc, portfolio) => acc + portfolio.portfolio_data[key], 0);
    return sum / filteredData.length;
};

// const getAllAccounts = async () => {
//     try {
//         const response = await $axios.get('/api/accounts/all-accounts/');
//         accounts.value = response.data;
//         getTotalAccValue();
//     }
//     catch (error) {
//         parseError(error);
//     };
// };

const getTotalAccValue = () => {
    const data = billingDataSuper.value.filter((account) => account.is_archived === false);
    const dataLength = data.length;
    numOfAccts.value = dataLength;
    totalAccValue.value = data.reduce((acc, account) => acc + Number(account.value.replace(/,/g, '')), 0);
    getAverageAccValue(dataLength);
};

const getAverageAccValue = (dataLength) => {
    averageAccValue.value = totalAccValue.value / dataLength;
};

const filterItems = ['Archived', 'Not Archived'];

const apply = () => {
    billingDataSuper.value = dataCopy.value;
    if (selectedFilters.value.length === 0) {
        billingDataSuper.value = billingDataSuper.value;
    } else {
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

    const datasets = [];

    const labels = [...new Set(data.map(item => item.title))];
    data.forEach((item) => {
        const dataArray = new Array(labels.length).fill(0);
        const index = labels.indexOf(item.title);
        dataArray[index] = item.value;
        datasets.push({
            label: item.type,
            data: dataArray,
            backgroundColor: getUniqueRandomColor(brandColors, usedColors),
        });
    });
    
    

    return {
        labels: [...new Set(data.map(item => item.title))],
        datasets: datasets,
    };
}

const getScatterChart = (data) => {
    const valuesEntry = data.find(metric => metric.metric === "Values Fit");
    const investmentEntry = data.find(metric => metric.metric === "Investment Fit");
    const usedColors = new Set();
    if (!valuesEntry || !investmentEntry) {
        return {
            datasets: [],
        };
    }

    const theData = Object.keys(valuesEntry).map((key) => {
        if (key !== "metric") {
            return {
                label: key,
                data: [{x: investmentEntry[key], y: valuesEntry[key]}],
                backgroundColor: getUniqueRandomColor(brandColors, usedColors),
                radius:4
            };
        }
    }).filter(item => item !== undefined);

    const datasets = [...theData];
    return {
        datasets: datasets,
    };
};

const getPieChart = (data) => {
    const labels = data.map(item => item.type);
    const usedColors = new Set();

    const orderedColors = {
        value: labels.map(() => getUniqueRandomColor(brandColors, usedColors)),
    };

    return {
        labels: labels,
        datasets: [
            {
                backgroundColor: orderedColors.value,
                data: data.map(item => item.value),
            }
        ],
    };
}


const filterData = (data, copy, pietitles) => {
    data = copy;
    if (!data) return [];
    if (pietitles.Reset.strikethrough) {
        const filteredData = copy;

        for (const title in pietitles) {
            pietitles[title].strikethrough = false;
        }
        return filteredData;
    } else{
        const filteredData = data.filter((item) => {
            return !Object.values(pietitles).some((title) => title.title === item.title && title.strikethrough);
        });
        return filteredData;
    }
};


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
        text: 'Investment Fit'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Values Fit'
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
        text: 'Investment Fit'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Values Fit'
      }
    }
  }
};

const categoriesMap = {
    "telecommunications": "Telecommunications",
    "mediaAndEntertainment": "Media and Entertainment",
    "consumerDiscretionary": "Consumer Discretionary",
    "automobilesAndParts": "Automobiles and Parts",
    "consumerDurablesAndApparel": "Consumer Durables and Apparel",
    "consumerServices": "Consumer Services",
    "consumerStaples": "Consumer Staples",
    "foodBeverageTobacco": "Food, Beverage, Tobacco",
    "householdAndPersonalProducts": "Household and Personal Products",
    "banks": "Banks",
    "commercialAndProfessionalServices": "Commercial and Professional Services",
    "insurance": "Insurance",
    "healthcareEquipmentServices": "Health Care Equipment & Services",
    "pharmaceuticalsBiotechnologyAndLifeSciences": "Pharmaceuticals, Biotechnology, Life Sciences",
    "transportation": "Transportation",
    "captialGoods": "Capital Goods",
    "technologyHardware": "Technology Hardware",
    "softwareAndServices": "Software and Services",
    "semiconductorsAndEquipment": "Semiconductors and Equipment",
    "equityRealEstateInvestmentTrustsReits": "Equity Real Estate Investment Trusts (REITs)",
    "realEstateManagementAndDevelopment": "Real Estate Management and Development",
    "energy": "Energy",
    "materials": "Materials",
    "utilities": "Utilities",
    "gmoCrops": "Genetically Modified Plants and Seeds (GMO)",
    "palmOil": "Palm Oil",
    "pesticides": "Pesticides",
    "animalTesting": "Animal Testing",
    "furAndSpecialtyLeather": "Fur and Leather",
    "porkProducts": "Pork Products",
    "whaleMeat": "Whale Meat",
    "alcoholicBeverages": "Alcohol",
    "tobaccoProducts": "Tobacco",
    "cannabis": "Cannabis",
    "gambling": "Gambling",
    "arcticOilAndGasExploration": "Arctic Oil and Gas",
    "coalPower": "Thermal Coal",
    "nuclearPower": "Nuclear Power",
    "oilAndGasProduction": "Oil and Gas",
    "oilSands": "Oil Sands",
    "shaleEnergy": "Shale Energy",
    "controversialWeapons": "Weapons",
    "smallArms": "Personal Arms",
    "militaryContracting": "Military Contracting",
    "privatePrisons": "Private Prisons",
    "riotControl": "Riot Control",
    "humanEmbryonicAndFetalStemCellUse": "Embryonic and Fetal Stem Cell Use",
    "abortion": "Abortion",
    "contraceptives": "Contraceptives",
    "predatoryLending": "Predatory Lending",
    "socialMediaPlatforms": "Social Media",
    "adultEntertainment": "Adult Entertainment",
}

const typesMap = {
    'Agriculture': ['gmoCrops', 'palmOil', 'pesticides'],
    'Animal Products': ['animalTesting', 'furAndSpecialtyLeather', 'porkProducts', 'whaleMeat'],
    'Addictive Substances': ['alcoholicBeverages', 'tobaccoProducts', 'cannabis', 'gambling'],
    'Fossil Fuels': ['arcticOilAndGasExploration', 'coalPower', 'nuclearPower', 'oilAndGasProduction', 'oilSands', 'shaleEnergy'],
    'Weapons and Defense': ['controversialWeapons', 'smallArms', 'militaryContracting', 'riotControl', 'privatePrisons'],
    'Controversial Products and Practices': ['humanEmbryonicAndFetalStemCellUse', 'abortion', 'contraceptives', 'predatoryLending', 'socialMediaPlatforms', 'adultEntertainment'],
    'Communication Services': ['telecommunications', 'mediaAndEntertainment', 'Media & Entertainment', 'Telecommunication Services'],
    'Consumer Discretionary': ['consumerDiscretionary', 'Automobiles & Components', 'automobilesAndParts', 'consumerDurablesAndApparel', 'consumerServices', 'Consumer Discretionary Distribution & Retail','Consumer Durables & Apparel', 'Consumer Services'],
    'Consumer Staples': ['consumerStaples', 'foodBeverageTobacco', 'householdAndPersonalProducts', 'Food Beverage & Tobacco', 'Household & Personal Products'],
    'Financials': ['banks', 'Banks', 'commercialAndProfessionalServices', 'insurance', 'Commercial & Professional Services', 'Insurance'],
    'Health Care': ['healthcareEquipmentServices', 'pharmaceuticalsBiotechnologyAndLifeSciences', 'Health Care Equipment & Services', 'Pharmaceuticals Biotechnology & Life Sciences'],
    'Industrials': ['transportation', 'capitalGoods', 'Capital Goods', 'Transportation'],
    'Information Technology': ['technologyHardware', 'softwareAndServices', 'semiconductorsAndEquipment', 'Semiconductors & Semiconductor Equipment', 'Software & Services', 'Technology Hardware & Equipment'],
    'Real Estate': ['equityRealEstateInvestmentTrustsReits', 'realEstateManagementAndDevelopment', 'Equity Real Estate Investment Trusts (REITs)', 'Real Estate Management & Development'],
    'Energy': ['energy', 'Energy'],
    'Materials': ['materials', 'Materials'],
    'Utilities': ['utilities', 'Utilities'],
}

const esgTypesMap = {
    'Environmental Responsibility': ['Efficient Resource Use', 'Climate Action and Environmental Protection', 'Sustainable Materials', 'Pollustion Reduction'],
    'Workplace and Employees': ['Worker Health and Safety', 'Employee Training and Development', 'Diverse and Inclusive Workplace', 'Fair Compensation and Benefits'],
    'Governance and Ethics': ['Ethical Leadership and Governance', 'Responsible Supply Chain Management', 'Fair and Diverse Leadership'],
    'Customer Relations': ['Customer Privacy and Data Security', 'Honest Advertising and Labeling', 'Beneficial Products', 'Fair Customer Treatment'],
    'Community and Social Impact': ['Community Engagement', 'Local Community Support', 'Human Rights Protection'],
}

const screenWidth = window.innerWidth;
onMounted(() => {
    fetchAccountsForErik();
    fetchPD();
    // getAllAccounts();
});

</script>
<style>

</style>