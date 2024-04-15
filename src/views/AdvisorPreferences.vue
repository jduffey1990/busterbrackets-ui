<template>
  <v-layout class="justify-center pa-4">
    <v-card class="w-100">
      <v-toolbar>
        <!-- <v-toolbar-title
          >Advisor Preferences
          <v-btn color="primary" variant="elevated"> Save </v-btn>
        </v-toolbar-title> -->
        <v-toolbar-title> Advisor Preferences </v-toolbar-title>

        <v-toolbar-items>
          <v-btn color="primary" variant="elevated" @click="savePreferences()">
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text>
        <div class="text-h6 mb-3">Factor Levers</div>
        <v-checkbox v-model="preferences.momentum">
          <template v-slot:label> Momentum </template>
        </v-checkbox>

        <v-checkbox v-model="preferences.quality">
          <template v-slot:label> Quality </template>
        </v-checkbox>

        <v-checkbox v-model="preferences.value">
          <template v-slot:label> Value </template>
        </v-checkbox>

        <v-checkbox v-model="preferences.volatility">
          <template v-slot:label> Volatility </template>
        </v-checkbox>

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
import { ref } from 'vue';
import { inject } from 'vue';

const $axios = inject('$axios');

const preferences = ref({});

const ticks = {
  0: 'Ignore',
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Maximum',
};

const getPreferences = async () => {
  const { data } = await $axios.get(`/api/advisors/preferences/`);

  preferences.value = data;
};

getPreferences();

const savePreferences = async () => {
  try {
    await $axios.put('/api/advisors/preferences/', preferences.value);
  } catch (error) {}
};
</script>
