import type React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface DashboardChartProps {
  data: {
    name: string
    data: number[]
  }[]
  categories: string[]
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data, categories }) => {
  // Generate labels based on the length of the first dataset
  const labels = data[0]?.data ? Array.from({ length: data[0].data.length }, (_, i) => `Job ${i + 1}`) : []

  // Define chart data
  const chartData: ChartData<"line"> = {
    labels: labels,
    datasets: data.map((dataset, index) => ({
      label: dataset.name || categories[index] || `Dataset ${index + 1}`,
      data: dataset.data,
      borderColor: index === 0 ? "rgb(99, 102, 241)" : "rgb(14, 165, 233)",
      backgroundColor: index === 0 ? "rgba(99, 102, 241, 0.5)" : "rgba(14, 165, 233, 0.5)",
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
    })),
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Revenue",
      },
    },
  }

  return <Line options={options} data={chartData} />
}

export default DashboardChart
