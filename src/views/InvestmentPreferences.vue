<template>
  <div>
    <!-- Header section with advisor's name and action buttons -->
    <div class="d-flex my-4">
      <div class="text-h4">
        <!-- Display current advisor's full name if available -->
        <span v-if="currentAdvisor">{{ currentAdvisor.full_name }}</span>
        Investment Preferences
      </div>
      <v-spacer></v-spacer>

      <!-- Buttons for navigation and saving preferences, shown only if canEdit (super admin) is true -->
      <template v-if="canEdit">
        <!-- Button to navigate back to advisors list -->
        <v-btn
            @click="router.push('/advisors')"
            text="Back"
            class="ml-2"
        ></v-btn>

        <!-- Button to save factor levers -->
        <v-btn
            @click="saveFactorLevers()"
            color="primary"
            text="Save"
            class="ml-2"
        ></v-btn>
      </template>
    </div>

    <!-- Section for factor levers -->
    <div class="text-h6 mb-3">Factor Levers</div>
    <!-- Checkbox for Momentum factor -->
    <v-checkbox
        :readonly="!canEdit"
        v-model="factorLevers.momentum"
        label="Momentum"
        :disabled="!canEdit"
    ></v-checkbox>

    <!-- Checkbox for Quality factor -->
    <v-checkbox
        :readonly="!canEdit"
        v-model="factorLevers.quality"
        label="Quality"
        :disabled="!canEdit"
    ></v-checkbox>

    <!-- Checkbox for Value factor -->
    <v-checkbox
        :readonly="!canEdit"
        v-model="factorLevers.value"
        label="Value"
        :disabled="!canEdit"
    ></v-checkbox>

    <!-- Checkbox for Low Volatility factor -->
    <v-checkbox
        :readonly="!canEdit"
        v-model="factorLevers.low_volatility"
        label="Low Volatility"
        :disabled="!canEdit"
    ></v-checkbox>

    <div class="d-flex my-4 align-center">
      <div class="text-h6 my-4">Advisor Fee %</div>
    </div>
    <v-row>
      <v-col cols="6">
        <v-select
            label="Advisor Fee"
            class="mb-4"
            v-model="advisorFee"
            :items="rates"
            item-title="title"
            item-value="value"
        ></v-select>
      </v-col>
    </v-row>
    <div class="d-flex my-4 align-center">
      <div class="text-h6 my-4">Number of Holdings</div>
    </div>
    <v-row>
      <v-col cols="6">
        <v-select
            label="Number of Holdings"
            class="mb-4"
            v-model="holdings"
            :items="holdingItems"
            item-title="title"
            item-value="value"
        ></v-select>
        <div class="d-flex justify-end mb-4">
          <v-btn class="ml-2" color="primary" @click="saveHoldings">Save</v-btn>
        </div>
      </v-col>
    </v-row>


    <hr class="my-10"/>

    <!-- Section for asset allocation guidelines -->
    <div class="d-flex my-4">
      <div class="text-h6">Asset Allocation Guidelines</div>
      <v-spacer></v-spacer>

      <input
          type="file"
          accept="text/csv"
          v-if="canEdit"
          @change="onFileUpload($event)"
      />

    </div>

    <!-- Alert indicating default allocations, shown if isDefaultAllocation is true -->
    <v-alert type="info" v-if="isDefaultAllocation" class="mb-4">
      You are currently using the default allocations.
    </v-alert>

    <v-btn v-if="canEdit" @click="changeEditButton" color="primary">{{ buttonText }}</v-btn>
    <v-btn v-if="editing" @click="submitChanges" color="secondary>">Submit Changes</v-btn>

    <!-- Data table for displaying asset allocations -->
    <v-data-table v-if="!editing" :items="allocations" :items-per-page="-1" :headers="headers">
      <template #bottom></template>
    </v-data-table>


    <v-data-table
        v-else
        v-model:page="page"
        :items="backupAllocations"
        :items-per-page="itemsPerPage"
        :headers="editableHeaders"
        :footer-props="{
          itemsPerPageText: '',
          pageText: ''
        }"
    >
      <template v-slot:item.name="{ item }">
        <v-text-field v-model="item.name" min-width="400px" hide-details></v-text-field>
      </template>

      <template v-slot:item.ticker="{ item, index }">
        <v-autocomplete
            v-model="item.ticker"
            :items="allTickerValues"
            item-title="company_name"
            item-value="symbol"
            :label="isEmpty(item.ticker)"
            hide-details
            min-width="250px"
            clearable
            @update:model-value="onTickerSelect($event, item)"
            class="autocomplete"
        />
      </template>
      <template v-slot:item.min_risk="{ item }">
        <v-text-field v-model="item.min_risk" type="number" hide-details append-icon="%" min-width="150px"/>
      </template>
      <template v-slot:item.max_risk="{ item }">
        <v-text-field v-model="item.max_risk" type="number" hide-details append-icon="%" min-width="150px"/>
      </template>
      <template v-slot:item.actions="{ item, index }">
        <v-icon @click="removeRow(index)" color="red" class="mr-2">mdi-delete</v-icon>
      </template>


      <template v-slot:bottom>
        <div class="footer-prefs">
          <!-- Left side: Add New Row Button -->
          <v-btn color="success" @click="addNewRow" class="mt-4">Add New Row</v-btn>

          <!-- Right side: Pagination controls and Items Per Page -->
          <div class="d-flex align-center">
            <v-pagination
                v-model="page"
                :length="pageCount"
                class="mr-4 mt-4"
            ></v-pagination>

            <!-- Items per page input -->
            <v-text-field
                v-model="itemsPerPage"
                class="pa-2"
                label="Items per page"
                min-width="150px"
                max="15"
                min="-1"
                type="number"
                hide-details
                @update:model-value="itemsPerPage = parseInt($event, 10)"
            ></v-text-field>
          </div>
        </div>
      </template>
    </v-data-table>


  </div>


</template>


<script setup>
//injected dependencies
import {useUserStore} from '@/store/user';
import {computed} from 'vue';
import {onMounted} from 'vue';
import {ref} from 'vue';
import {inject} from 'vue';
import {useRoute, useRouter} from 'vue-router';

const router = useRouter();
const {show} = inject('toast');
const $axios = inject('$axios');

//User store... user for session control and isSuper for auth
const {
  user: {id: advisor_id},
  isAdvisorOrGreater,
  isSuper
} = useUserStore();

//state management
const factorLevers = ref({});
const allocations = ref([]);
const backupAllocations = ref([]);
const canEdit = computed(() => isAdvisorOrGreater);
const currentAdvisor = ref();
const editing = ref(false);
const buttonText = ref('Edit Allocations');
let isDefaultAllocation = false;
const advisorFee = ref();
const tickerSearchResults = ref([]);
const nameSearchResults = ref([]);
const singleFieldEdit = ref(null);
const gettingTickers = ref(false);
const page = ref(1);
const itemsPerPage = ref(15);
const holdings = ref();
const allTickerValues = ref([])


//Router parameter
const {
  params: {user_id},
} = useRoute();

//table headers
const headers = [
  {
    title: 'Name',
    key: 'name',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Ticker',
    key: 'ticker',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Very Low Risk',
    key: 'min_risk',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Low Risk',
    key: 'low',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Moderate Risk',
    key: 'medium',
    width: 0,
    nowrap: true,
  },
  {
    title: 'High Risk',
    key: 'high',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Very High Risk',
    key: 'max_risk',
    width: 0,
    nowrap: true,
  },
  {},
];

const editableHeaders = [
  {
    title: 'Name',
    key: 'name',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Ticker',
    key: 'ticker',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Very Low Risk',
    key: 'min_risk',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Very High Risk',
    key: 'max_risk',
    width: 0,
    nowrap: true,
  },
  {text: 'Actions', value: 'actions', align: 'center', sortable: false},
];

//Utility Functions and calls
const getFactorLevers = async () => {
  try {
    const {data} = await $axios.get(
        `/api/advisors/${user_id || advisor_id}/factor-levers/`
    );

    factorLevers.value = data;
  } catch (error) {
  }
};

const changeEditButton = () => {
  editing.value = !editing.value; // Toggle the editing state
  buttonText.value = editing.value ? 'Cancel Edit' : 'Edit Allocations'; // Update button text
};

const addNewRow = () => {
  backupAllocations.value.push({
    name: '',
    ticker: '',
    min_risk: 0,
    max_risk: 0,
  });
};

const isEmpty = (ticker) => {
  return ticker ? "" : "Search Here"
}

const removeRow = (index) => {
  backupAllocations.value.splice(index, 1); // Remove the item at the given index
};


const onTickerSelect = (selectedTicker, item) => {
  singleFieldEdit.value = null;

  // Extract ticker using regex to get the part inside parentheses
  const matchedTicker = selectedTicker.match(/\(([^)]+)\)/)?.[1];  // Extract the text inside parentheses

  // Extract the name by finding the space after the closing parenthesis
  const indexOfName = selectedTicker.indexOf(")") + 2;  // This will get the index right after the closing parenthesis and space
  const selectedName = selectedTicker.slice(indexOfName).trim();  // Extract the name and trim any extra spaces

  // Assign both the name and ticker to the item
  item.name = selectedName || '';  // Assign the extracted name
  item.ticker = matchedTicker || '';  // Assign the extracted ticker

  // Clear the search results after selection
  tickerSearchResults.value = [];
  nameSearchResults.value = [];
};


const getTickers = async () => {
  try {
    const {data} = await $axios.get(
        `/api/companies/get-stock-tickers/`
    );

    allTickerValues.value = data.map(s => (
        `(${s.symbol}) ${s.company_name}`
    ));

    allTickerValues.value.push(`(POMARIUM) Personalized US Stocks`);
    allTickerValues.value.push(`($CASH) Cash`);

  } catch (error) {
    console.error("Error fetching allocations", error);
  }
}

//DB management and access
const getAllocations = async () => {
  try {
    const {data} = await $axios.get(
        `/api/advisors/${user_id || advisor_id}/allocations/`
    );

    // Check if default allocation is present and remove it, set isDefaultAllocation to true
    isDefaultAllocation = data.some(
        (allocation) => allocation.is_default
    );

    // Add calculated low, medium, and high values for each allocation, rounded to 2 decimal places
    allocations.value = data.map(allocation => {
      const {min_risk, max_risk} = allocation;
      const range = max_risk - min_risk;
      const step = range / 4;  // Divide the range into equal parts for low, medium, high

      const roundToTwoDecimals = (value) => Number(value.toFixed(2)); // Helper function to round to 2 decimal places

      return {
        ...allocation,
        low: roundToTwoDecimals(min_risk + step),    // Add step to min_risk to get low value
        medium: roundToTwoDecimals(min_risk + step * 2),  // Add 2 steps to get medium value
        high: roundToTwoDecimals(min_risk + step * 3),    // Add 3 steps to get high value
      };
    });

    // Backup allocations
    backupAllocations.value = data.map(allocation => ({
      name: allocation.name,
      ticker: allocation.ticker,
      min_risk: allocation.min_risk,
      max_risk: allocation.max_risk,
    }));
  } catch (error) {
    console.error("Error fetching allocations", error);
  }
};

const getFirmAdvisorFee = async () => {
  try {
    const {data} = await $axios.get(`/api/users/advisor-fee/`);
    advisorFee.value = (data.advisor_fee * 100).toFixed(2);
  } catch (error) {

  }
};

getFirmAdvisorFee();

//DB management and access
const onFileUpload = ({target: {files}}) => {
  //takes the drag and drop csv and parses and conforms it
  const reader = new FileReader();

  reader.readAsText(files[0]);

  reader.onload = async ({target: {result}}) => {
    allocations.value = [];

    //breaks .csv into indices of text by linebreak
    const data = result.split('\r\n');
    for (const i in data) {
      if (!+i) {
        continue;
      }
      //commas further break down each line, for the next step to assign values
      const allocation = data[i].split(',').filter((a) => a.length);

      if (allocation.length) {
        const name = allocation[0];
        const ticker = allocation[1];
        const min_risk = +allocation[2].replace('%', '');
        const max_risk = +allocation[3].replace('%', '');

        allocations.value.push({name, ticker, min_risk, max_risk});
      }
    }

    if (data.length) {
      try {
        await $axios.post(
            `/api/advisors/${user_id || advisor_id}/allocations/`,
            {
              allocations: allocations.value,
            }
        );

        show({message: 'Advisor Allocations saved!'});

        getAllocations();

        return;
      } catch (error) {
      }
    }

    show({
      message: `Upload CSV failed. Please check format and try again.`,
      error: true,
    });
  };
};

const submitChanges = async () => {
  // Calculate the total min_risk and max_risk using parseFloat to handle decimals
  const totalMinRisk = backupAllocations.value.reduce((acc, allocation) => acc + parseFloat(allocation.min_risk), 0);
  const totalMaxRisk = backupAllocations.value.reduce((acc, allocation) => acc + parseFloat(allocation.max_risk), 0);

  // Check if both totals add up to 100
  if (totalMinRisk.toFixed(1) !== '100.0' || totalMaxRisk.toFixed(1) !== '100.0') {
    show({message: 'Total Min Risk and Max Risk must each add up to 100%', error: true});
    return;
  }

  // Save the changes and refresh allocations from the server
  try {
    await $axios.post(`/api/advisors/${user_id || advisor_id}/allocations/`, {
      allocations: backupAllocations.value  // Wrap the data in the 'allocations' key
    });

    // Update the view-only allocations after successful save
    allocations.value = JSON.parse(JSON.stringify(backupAllocations.value));
    editing.value = false;
    buttonText.value = 'Edit Allocations';
    show({message: 'Allocations saved successfully!'});
    await getAllocations()
  } catch (error) {
    show({message: 'Failed to save allocations', error: true});
  }
};


onMounted(async () => {
  await getTickers()
  await getAllocations();
  await getFactorLevers()
  if (isSuper) {
    const {data} = await $axios.get(`/api/users/${user_id || advisor_id}/`);
    currentAdvisor.value = data;
  } else {
    const {data} = await $axios.get("/api/users/me/");
    currentAdvisor.value = data;
  }
});

const saveFactorLevers = async () => {
  try {
    await $axios.patch(
        `/api/advisors/${user_id || advisor_id}/factor-levers/`,
        {
          ...factorLevers.value,
        }
    );

    show({message: 'Factor levers saved!'});
  } catch (error) {
    show({
      message: `Couldn't save Factor Levers`,
      error: true,
    });
  }
};

const rates = Array.from({length: 301}, (_, i) => ({
  value: (i / 100),
  title: ((i / 100)).toFixed(2) + "%",
}));

const holdingItems = [
  {title: '25 - 50 (small)', value: 0},
  {title: '50 - 75 (medium)', value: 1},
  {title: '75 - 100 (large)', value: 2},
  {title: '100+ (very large)', value: 3},
]

const getHoldings = async () => {
  try {
    const {data} = await $axios.get(`/api/users/holdings/`);
    holdings.value = data.holdings_num;
  } catch (error) {
    show({message: 'Error fetching holdings', error: true});
  }
};
getHoldings();

const saveHoldings = async () => {
  try {
    await $axios.put(`/api/users/holdings/`, {
      holdings_num: holdings.value,
    });
    await $axios.put(`/api/users/advisor-fee/`, {
      advisor_fee: (advisorFee.value / 100).toFixed(4),
    });
    show({message: 'Advisor Fee % and Number of Holdings saved!'});
  } catch (error) {
    show({message: 'Error saving Number of Holdings', error: true});
  }
};
</script>


<style>
.no-hover-shadow .v-input--selection-controls__ripple {
  display: none;
}

.footer-prefs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 10px 0 10px;
}

#file-upload-button {
  height: 90px;
  cursor: pointer;
}
</style>
