<template>
  <div v-if="hasLoaded">
    <v-layout
      class="justify-center pa-4"
      v-if="Object.keys(preferences).length"
    >
      <v-card class="w-100">
        <v-toolbar>
          <v-toolbar-title> Advisor Preferences </v-toolbar-title>

          <v-toolbar-items>
            <v-btn
              color="primary"
              variant="elevated"
              @click="savePreferences()"
            >
              Save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="pa-8">
          <div class="text-h5 mb-3">Factor Levers</div>
          <v-checkbox
            v-model="preferences.momentum"
            label="Momentum"
          ></v-checkbox>

          <v-checkbox v-model="preferences.quality" label="Quality">
          </v-checkbox>

          <v-checkbox v-model="preferences.value" label="Value"> </v-checkbox>

          <v-checkbox
            v-model="preferences.low_volatility"
            label="Low Volatility"
          ></v-checkbox>

          <hr class="my-10" />

          <div class="text-h5 mb-3">Asset Allocation Guidelines</div>

          <v-data-table :items="allocationGuidelines" :items-per-page="-1">
            <template #bottom> </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-layout>

    <v-alert title="No Advisor Preferences" type="warning" v-else
      >You need to be an advisor to view your preferences.
    </v-alert>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { ref } from 'vue';
import { inject } from 'vue';

const {
  user: { id: advisor_id },
} = useUserStore();

const $axios = inject('$axios');
const { show } = inject('toast');

const preferences = ref({});

const hasLoaded = ref(false);

const getPreferences = async () => {
  try {
    const { data } = await $axios.get(
      `/api/advisors/${advisor_id}/preferences/`
    );

    preferences.value = data;
  } catch (error) {}

  hasLoaded.value = true;
};

getPreferences();

const savePreferences = async () => {
  try {
    await $axios.put(
      `/api/advisors/${advisor_id}/preferences/`,
      preferences.value
    );

    show({ message: 'Preferences saved!' });
  } catch (error) {
    show({ message: `Couldn't save preferences`, error: true });
  }
};

const allocationGuidelines = ref([]);

const getaAllocationGuidelines = async () => {
  const { data } = await $axios.get(`/api/advisors/allocation-guidelines/`);

  allocationGuidelines.value = data.map((item) => ({
    ...item,
    min_risk: (item.min_risk * 100).toFixed(0) + '%', // Multiplying by 100 and appending '%'
    max_risk: (item.max_risk * 100).toFixed(0) + '%',
  }));
};

getaAllocationGuidelines();
</script>
