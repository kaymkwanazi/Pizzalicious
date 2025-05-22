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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add anchorEl state for managing the menu
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch orders
        const ordersResponse = await fetch('http://localhost:3000/api/Orders');
        if (!ordersResponse.ok) {
          throw new Error(`Orders fetch error! status: ${ordersResponse.status}`);
        }
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);

        // Fetch order statuses
        const statusesResponse = await fetch('http://localhost:3000/api/Orders/OrderStatuses/');
        if (!statusesResponse.ok) {
          throw new Error(`Order statuses fetch error! status: ${statusesResponse.status}`);
        }
        const statusesData = await statusesResponse.json();
        setOrderStatuses(statusesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(``, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status! status: ${response.status}`);
      }

      // Update the local state after successful update
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating status:', err.message);
    }
  };

  if (loading) return <Typography variant="h6">Loading...</Typography>;
  if (error) return <Typography variant="h6" color="error">Error: {error}</Typography>;

  return (
    <>
      <Typography variant="h4" align="center" style={{ marginTop: '20px' }}>
        Orders
      </Typography>
      <TableContainer component={Paper} style={{ margin: '20px auto', maxWidth: '1200px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Order Reference Number</strong></TableCell>
              <TableCell><strong>Order Date</strong></TableCell>
              <TableCell><strong>Total Amount</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Update</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderRef}</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
                <TableCell>R{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>{order.username}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    style={{
                      border: `2px solid ${
                        order.status === 'Pending'
                          ? 'orange'
                          : order.status === 'Collected'
                          ? 'blue'
                          : order.status === 'Delivered'
                          ? 'green'
                          : 'gray'
                      }`,
                      borderRadius: '8px',
                      padding: '5px 10px',
                      textAlign: 'center',
                      color: `${
                        order.status === 'Pending'
                          ? 'orange'
                          : order.status === 'Collected'
                          ? 'blue'
                          : order.status === 'Delivered'
                          ? 'green'
                          : 'gray'
                      }`,
                      fontWeight: 'bold',
                    }}
                  >
                    {order.status}
                  </Typography>
                </TableCell>
                <TableCell>
                  {order.status === 'Pending' ? (
                    <>
                      <IconButton
                        onClick={(event) => setAnchorEl(event.currentTarget)} 
                        style={{
                          margin: '0 auto', 
                          display: 'block',
                        }}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)} 
                      >
                        {orderStatuses
                          .filter((status) => status.name !== 'Pending') 
                          .map((status) => (
                            <MenuItem
                              key={status.id}
                              onClick={() => {
                                handleStatusChange(order.id, status.name); 
                                setAnchorEl(null);
                              }}
                            >
                              <strong>{status.name}</strong> - {status.description}
                            </MenuItem>
                          ))}
                      </Menu>
                    </>
                  ) : (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <DoneIcon />
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}