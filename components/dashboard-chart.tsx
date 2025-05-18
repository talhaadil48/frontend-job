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
  // Generate labels for the last 6 months
  const generateMonthLabels = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const labels = []
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()

    // Get the last 6 months (including current month)
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12 // Handle wrapping around to previous year
      labels.push(months[monthIndex])
    }

    return labels
  }

  // Define chart data
  const chartData: ChartData<"line"> = {
    labels: generateMonthLabels(),
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
        text: "Monthly Growth",
      },
    },
  }

  return <Line options={options} data={chartData} />
}

export default DashboardChart
