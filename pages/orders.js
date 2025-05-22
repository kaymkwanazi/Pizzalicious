import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('http://localhost:3000/api/Orders');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <Typography variant="h6">Loading...</Typography>;
  if (error) return <Typography variant="h6" color="error">Error: {error}</Typography>;

  return (
    <>
    <Typography variant="h4" align="center" style={{marginTop: '20px',marginTop: '20px' }} >
        Orders
    </Typography>
    <TableContainer component={Paper} style={{ margin: '20px auto', maxWidth: '1200px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Order ID</strong></TableCell>
            <TableCell><strong>Order Date</strong></TableCell>
            <TableCell><strong>Total Amount</strong></TableCell>
            <TableCell><strong>Username</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
              <TableCell>R{order.totalAmount.toFixed(2)}</TableCell>
              <TableCell>{order.username}</TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
}