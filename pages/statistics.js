import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const ordersResponse = await fetch('/api/Orders');
        if (!ordersResponse.ok) {
          throw new Error(`Orders fetch error! status: ${ordersResponse.status}`);
        }
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const salesAndOrdersData = orders.reduce((acc, order) => {
    const dateObj = new Date(order.orderDate);
    const date = `${dateObj.getDate()}-${dateObj.toLocaleString('default', { month: 'short' })}`; 
    if (!acc[date]) {
      acc[date] = { sales: 0, orders: 0 };
    }
    acc[date].sales += order.totalAmount;
    acc[date].orders += 1;
    return acc;
  }, {});

  const graphLabels = Object.keys(salesAndOrdersData);
  console.log("🚀 ~ Home ~ salesAndOrdersData:", salesAndOrdersData)
  const salesData = graphLabels.map((date) => salesAndOrdersData[date].sales);
  const ordersData = graphLabels.map((date) => salesAndOrdersData[date].orders);

  const salesChartData = {
    labels: Object.keys(salesAndOrdersData), 
    datasets: [
      {
        label: 'Sales per Day (R)',
        data: Object.values(salesAndOrdersData).map((data) => data.sales), 
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.4, 
        fill: true,
      },
    ],
  };
  
  const ordersChartData = {
    labels: Object.keys(salesAndOrdersData), 
    datasets: [
      {
        label: 'Orders per Day',
        data: Object.values(salesAndOrdersData).map((data) => data.orders), 
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div style={{ margin: '20px auto', width: '80%' }}>
        <Typography variant="h5" align="center" style={{ marginBottom: '20px' }}>
          Sales and Orders Overview
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {/* Line Graph for Sales */}
          <div style={{ width: '45%', marginBottom: '20px' }}>
            <Line data={salesChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
          {/* Bar Chart for Orders */}
          <div style={{ width: '45%', marginBottom: '20px' }}>
            <Bar data={ordersChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
        </div>
      </div>
    </>
  );
}