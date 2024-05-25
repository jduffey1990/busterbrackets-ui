<template>
  <div>
    <div class="d-flex my-4">
      <div class="text-h4">
        <span v-if="currentAdvisor">{{ currentAdvisor.full_name }}</span>
        Advisor Preferences
      </div>
      <v-spacer></v-spacer>

      <v-btn
        v-if="canEdit"
        @click="saveFactorLevers()"
        color="primary"
        text="Save"
        class="ml-2"
      ></v-btn>
    </div>

    <v-alert type="info" title="Super Admin Only" v-if="canEdit" class="mb-4">
      You are viewing this as a super admin.
    </v-alert>

    <div class="text-h6 mb-3">Factor Levers</div>
    <v-checkbox
      :readonly="!canEdit"
      v-model="factorLevers.momentum"
      label="Momentum"
    ></v-checkbox>

    <v-checkbox
      :readonly="!canEdit"
      v-model="factorLevers.quality"
      label="Quality"
    >
    </v-checkbox>

    <v-checkbox :readonly="!canEdit" v-model="factorLevers.value" label="Value">
    </v-checkbox>

    <v-checkbox
      :readonly="!canEdit"
      v-model="factorLevers.low_volatility"
      label="Low Volatility"
    ></v-checkbox>

    <hr class="my-10" />

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

    <v-data-table :items="allocations" :items-per-page="-1" :headers="headers">
      <template #bottom> </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { inject } from 'vue';
import { useRoute } from 'vue-router';
const { show } = inject('toast');

const {
  user: { id: advisor_id },
  isSuper,
} = useUserStore();

const $axios = inject('$axios');

const factorLevers = ref({});

const {
  params: { user_id },
} = useRoute();

const canEdit = computed(() => isSuper && user_id);

const getFactorLevers = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${user_id || advisor_id}/factor-levers/`
    );

    factorLevers.value = data;
  } catch (error) {}
};

getFactorLevers();

const allocations = ref([]);
const getAllocations = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${user_id || advisor_id}/allocations/`
    );

    allocations.value = data;
  } catch (error) {}
};

getAllocations();

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

const onFileUpload = ({ target: { files } }) => {
  const reader = new FileReader();

  reader.readAsText(files[0]);

  reader.onload = async ({ target: { result } }) => {
    allocations.value = [];

    const data = result.split('\r\n');
    for (const i in data) {
      if (!+i) {
        continue;
      }

      const allocation = data[i].split(',').filter((a) => a.length);

      if (allocation.length) {
        const name = allocation[0];
        const ticker = allocation[1];
        const min_risk = +allocation[2].replace('%', '');
        const max_risk = +allocation[3].replace('%', '');

        allocations.value.push({ name, ticker, min_risk, max_risk });
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

        show({ message: 'Advisor Allocations saved!' });

        getAllocations();

        return;
      } catch (error) {}
    }

    show({
      message: `Upload CSV failed. Please check format and try again.`,
      error: true,
    });
  };
};

const currentAdvisor = ref();
onMounted(async () => {
  if (canEdit.value) {
    const { data } = await $axios.get(`/api/users/${user_id || advisor_id}/`);

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

    show({ message: 'Factor levers saved!' });
  } catch (error) {
    show({
      message: `Couldn't save Factor Levers`,
      error: true,
    });
  }
};
</script>
