import React from 'react';
import { useCart } from '@/components/CartContext';
import { Box, Typography, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const MiniCart = () => {
  const { cart, removeFromCart, totalAmount } = useCart();

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
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <Typography>
              {item.name} x {item.quantity}
            </Typography>
            <Typography>R{(item.price * item.quantity).toFixed(2)}</Typography>
            <IconButton onClick={() => removeFromCart(item.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))
      )}
      <Typography variant="h6" sx={{ marginTop: '16px' }}>
        Total: R{totalAmount.toFixed(2)}
      </Typography>
      <Button variant="contained" color="primary" fullWidth>
        Checkout
      </Button>
    </Box>
  );
};

export default MiniCart;