<template>
  <Bar :options="mergedOptions" :data="data"/>
</template>

<script>
import {Bar} from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    PointElement,
    LineElement,
    CategoryScale,
    LinearScale,
);

export default {
  components: {Bar},
  props: {
    data: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    mergedOptions() {
      return {
        responsive: true,
        animation: false,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: false,
            title: {
              display: true,
              text: 'Values Score',
            },
            beginAtZero: true,
          },
        },
        ...this.options, // This allows overriding default options via props
      };
    },
  },
};
</script>
