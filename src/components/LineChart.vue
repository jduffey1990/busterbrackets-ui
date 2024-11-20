<template>
  <div>
    <Line :data="chartData" :options="chartOptions"/>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import {Line} from 'vue-chartjs'
import {defineComponent, reactive} from "vue";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

export default defineComponent({
  name: "LineChart",
  components: {
    Line
  },
  props: {
    labels: {
      type: Array,
      required: true,
    },
    datasets: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const chartData = reactive({
      labels: props.labels,
      datasets: props.datasets,
    });

    const chartOptions = reactive({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
    });

    return {
      chartData,
      chartOptions,
    };
  },
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 400px;
}
</style>
