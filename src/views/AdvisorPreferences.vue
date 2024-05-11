<template>
  <v-layout class="justify-center pa-4">
    <v-card class="w-100">
      <v-toolbar>
        <v-toolbar-title> Advisor Preferences </v-toolbar-title>

        <v-toolbar-items>
          <v-btn color="primary" variant="elevated" @click="savePreferences()">
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <div class="text-h6 mb-3">Factor Levers</div>
        <v-checkbox
          v-model="preferences.momentum"
          label="Momentum"
        ></v-checkbox>

        <v-checkbox v-model="preferences.quality" label="Quality"> </v-checkbox>

        <v-checkbox v-model="preferences.value" label="Value"> </v-checkbox>

        <v-checkbox
          v-model="preferences.volatility"
          label="Volatility"
        ></v-checkbox>

        <br />

        <v-row>
          <v-col cols="6">
            <div class="mb-10">
              <div class="text-h6">US Large Cap</div>
              <v-slider
                v-model="preferences.large_cap"
                :ticks="ticks"
                :min="0"
                :max="4"
                :step="1.0"
                show-ticks="always"
                color="primary"
              ></v-slider>
            </div>

            <div class="mb-10">
              <div class="text-h6">International Large Cap</div>
              <v-slider
                v-model="preferences.intl_large_cap"
                :ticks="ticks"
                :min="0"
                :max="4"
                :step="1.0"
                show-ticks="always"
                color="primary"
              ></v-slider>
            </div>

            <div class="mb-10">
              <div class="text-h6">Small Cap</div>
              <v-slider
                v-model="preferences.small_cap"
                :ticks="ticks"
                :min="0"
                :max="4"
                :step="1.0"
                show-ticks="always"
                color="primary"
              ></v-slider>
            </div>

            <div class="mb-10">
              <div class="text-h6">Emerging Markets</div>
              <v-slider
                v-model="preferences.emerging_markets"
                :ticks="ticks"
                :min="0"
                :max="4"
                :step="1.0"
                show-ticks="always"
                color="primary"
              ></v-slider>
            </div>
          </v-col>

          <v-col cols="6">
            <div class="mb-10">
              <div class="text-h6">Fixed Income</div>
              <v-slider
                v-model="preferences.fixed_income"
                :ticks="ticks"
                :min="0"
                :max="4"
                :step="1.0"
                show-ticks="always"
                color="primary"
              ></v-slider>
            </div>

            <div class="mb-10">
              <div class="text-h6">Commodities</div>
              <v-slider
                v-model="preferences.commodities"
                :ticks="ticks"
                :min="0"
                :max="4"
                :step="1.0"
                show-ticks="always"
                color="primary"
              ></v-slider>
            </div>

            <div class="mb-10">
              <div class="text-h6">Bitcoin</div>
              <v-slider
                v-model="preferences.bitcoin"
                :ticks="ticks"
                :min="0"
                :max="4"
                :step="1.0"
                show-ticks="always"
                color="primary"
              ></v-slider>
            </div>

            <div class="mb-10">
              <div class="text-h6">Cash</div>
              <v-slider
                v-model="preferences.cash"
                :ticks="ticks"
                :min="0"
                :max="4"
                :step="1.0"
                show-ticks="always"
                color="primary"
              ></v-slider>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-layout>
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

const ticks = {
  0: 'Ignore',
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Maximum',
};

const getPreferences = async () => {
  const { data } = await $axios.get(`/api/advisors/${advisor_id}/preferences/`);

  preferences.value = data;
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
</script>
