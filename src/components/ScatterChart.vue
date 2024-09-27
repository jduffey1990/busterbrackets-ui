<template>
  <Scatter :options="options" :data="data"/>
</template>

<script>
import {Chart as ChartJS, ScatterController, PointElement, LineElement, Tooltip, Legend} from 'chart.js';
import {Scatter} from 'vue-chartjs';

ChartJS.register(ScatterController, PointElement, LineElement, Tooltip, Legend);

export default {
  components: {Scatter},
  props: {
    data: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
            }
          },
          title: {
            display: true,
            text: 'Scatter Chart',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'X-Axis',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Y-Axis',
            },
          },
        },
      }),
    },
  },
};
</script>


