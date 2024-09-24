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

    <!-- Alert indicating user is a super admin, shown if canEdit is true -->
    <v-alert type="secondary" title="Super Admin Only" v-if="canEdit" class="mb-4">
      You are viewing this as a super admin.
    </v-alert>

    <!-- Alert indicating read-only access, shown if canEdit (not superuser) is false -->
    <v-alert type="secondary" title="Read Only" v-else class="mb-4">
      Your investment preferences are read only. Please contact
      support@pomarium.com if you need assistance.
    </v-alert>

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


    <hr class="my-10"/>

    <!-- Section for asset allocation guidelines -->
    <div class="d-flex my-4">
      <div class="text-h6">Asset Allocation Guidelines</div>
      <v-spacer></v-spacer>

      <!-- File input for uploading CSV, shown if canEdit (superadmin only) is true -->
      <input
          type="file"
          accept="text/csv"
          v-if="canEdit"
          @change="onFileUpload($event)"
      />
    </div>

    <!-- Alert indicating default allocations, shown if isDefaultAllocation is true -->
    <v-alert type="info" v-if="isDefaultAllocation" class="mb-4">
      You are currently using the default allocations. Reach out to support@getpomarium.com to set up your preferred
      allocations.
    </v-alert>

    <!-- Data table for displaying asset allocations -->
    <v-data-table :items="allocations" :items-per-page="-1" :headers="headers">
      <template #bottom></template>
    </v-data-table>
    
  </div>
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
          <div class="d-flex justify-end mb-4">
            <v-btn class="ml-2" color="primary" @click="saveAdvisorFee">Save</v-btn>
          </div>
        </v-col>
      </v-row>

</template>


<script setup>
import {useUserStore} from '@/store/user';
import {computed} from 'vue';
import {onMounted} from 'vue';
import {ref} from 'vue';
import {inject} from 'vue';
import {useRoute, useRouter} from 'vue-router';


//injected dependencies
const router = useRouter();
const {show} = inject('toast');
const $axios = inject('$axios');

//User store... user for session control and isSuper for auth
const {
  user: {id: advisor_id},
  isSuper,
} = useUserStore();

//state management
const factorLevers = ref({});
const allocations = ref([]);
const canEdit = computed(() => isSuper && user_id);
const currentAdvisor = ref();
const advisorFee = ref();

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
    title: 'Min Risk',
    key: 'min_risk',
    width: 0,
    nowrap: true,
  },
  {
    title: 'Max Risk',
    key: 'max_risk',
    width: 0,
    nowrap: true,
  },
  {},
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

getFactorLevers();

let isDefaultAllocation = false;

const getAllocations = async () => {
  try {
    const {data} = await $axios.get(
        `/api/advisors/${user_id || advisor_id}/allocations/`
    );
    //check if default allocation is present and remove it and set isDefaultAllocation to true
    isDefaultAllocation = data.some(
        (allocation) => allocation.is_default
    );

    allocations.value = data;
  } catch (error) {
  }
};

getAllocations();

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


onMounted(async () => {
  if (canEdit.value) {
    const {data} = await $axios.get(`/api/users/${user_id || advisor_id}/`);

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
  title: ((i / 100)).toFixed(2)+"%",
}));

//save advisor fee
const saveAdvisorFee = async () => {
  try {
    await $axios.put(`/api/users/advisor-fee/`, {
      advisor_fee: (advisorFee.value / 100).toFixed(4),
    });
    show({message: 'Advisor Fee saved!'});
  } catch (error) {
    show({message: 'Error saving Advisor Fee', error: true});
  }
};

</script>


<style>
.no-hover-shadow .v-input--selection-controls__ripple {
  display: none;
}
</style>
