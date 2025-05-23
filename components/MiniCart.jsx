import React, { useState } from 'react';
import { useCart } from '@/components/CartContext';
import { Box, Typography, Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const MiniCart = () => {
  const { cart, removeFromCart, totalAmount } = useCart();
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    instructions: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleCheckout = async () => {
    const orderData = {
      userId: "5aa00c56-41e7-4c40-b615-8ca0a83b83c8", 
      items: cart.map((item) => ({
        pizzaId: item.pizzaId || null,
        dessertId: item.dessertId || null,
        refreshmentId: item.refreshmentId || null,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      customerInfo: customerDetails,
      totalAmount: totalAmount,
    };
  
    try {
      const response = await fetch('/api/Orders/CRUD/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Order placed successfully:', result);
        alert('Order placed successfully!');
      } else {
        const error = await response.json();
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error.message);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <Box sx={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h6">Cart</Typography>
      {cart.length === 0 ? (
        <Typography>No items in the cart.</Typography>
      ) : (
        cart.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '16px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography>
                {item.name} x {item.quantity}
              </Typography>
              <Typography>R{(item.price * item.quantity).toFixed(2)}</Typography>
              <IconButton onClick={() => removeFromCart(item)}>
                <DeleteIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '16px' }}>
              Base: {item.base || 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginLeft: '16px' }}>
              Toppings: {item.toppings?.length > 0 ? item.toppings.join(', ') : 'None'}
            </Typography>
          </Box>
        ))
      )}
      <Typography variant="h6" sx={{ marginTop: '16px' }}>
        Total: R{totalAmount.toFixed(2)}
      </Typography>

      {/* Form Fields Container */}
      <Box sx={{ maxWidth: '400px', margin: '0 auto' }}>
        <TextField
          label="Name"
          name="name"
          variant="outlined"
          fullWidth
          value={customerDetails.name}
          onChange={handleInputChange}
          sx={{ marginTop: '16px' }}
        />
        <TextField
          label="Address"
          name="address"
          variant="outlined"
          fullWidth
          multiline
          rows={2}
          value={customerDetails.address}
          onChange={handleInputChange}
          sx={{ marginTop: '16px' }}
        />
        <TextField
          label="Phone"
          name="phone"
          variant="outlined"
          fullWidth
          value={customerDetails.phone}
          onChange={handleInputChange}
          sx={{ marginTop: '16px' }}
        />
        <TextField
          label="Email"
          name="email"
          variant="outlined"
          fullWidth
          value={customerDetails.email}
          onChange={handleInputChange}
          sx={{ marginTop: '16px' }}
        />
        <TextField
          label="Delivery Instructions"
          name="instructions"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={customerDetails.instructions}
          onChange={handleInputChange}
          sx={{ marginTop: '16px' }}
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ marginTop: '16px' }}
        onClick={handleCheckout}
      >
        Checkout
      </Button>
    </Box>
  );
};

export default MiniCart;