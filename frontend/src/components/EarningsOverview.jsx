import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function EarningsOverview({ payments }) {
  const monthlyEarnings = {
    'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0,
    'May': 0, 'Jun': 0, 'Jul': 0, 'Aug': 0,
    'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
  };

  // Calculate total earnings and monthly breakdown
  const totalEarnings = payments.reduce((total, payment) => {
    if (payment.status === 'paid') {
      const month = new Date(payment.date).toLocaleString('default', { month: 'short' });
      monthlyEarnings[month] += payment.amount;
      return total + payment.amount;
    }
    return total;
  }, 0);

  const chartData = {
    labels: Object.keys(monthlyEarnings),
    datasets: [
      {
        label: 'Monthly Earnings',
        data: Object.values(monthlyEarnings),
        backgroundColor: 'rgba(13, 148, 136, 0.5)',
        borderColor: 'rgb(13, 148, 136)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Earnings Overview</h2>
        <div className="text-2xl font-bold text-teal-600">
          ${totalEarnings.toLocaleString()}
        </div>
      </div>
      <div className="h-64">
        <Bar 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Monthly Earnings'
              }
            }
          }}
        />
      </div>
    </div>
  );
} 