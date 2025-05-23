import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { Drawer, Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MiniCart from './MiniCart';
import { useUser } from '@/components/UserContext';
import { useCart } from '@/components/CartContext';

const Navbar = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useUser();
  const { cart } = useCart();

  const menuItems = [
    { name: 'Home', icon: <HomeIcon />, url: '/' },
    { name: 'Menu', icon: <RestaurantMenuIcon />, url: '/menu' },
    { name: 'Orders', icon: <ShoppingBasketIcon />, url: '/orders', restricted: true },
    { name: 'Statistics', icon: <AutoGraphIcon />, url: '/statistics', restricted: true },
    {
      name: 'My Cart',
      icon: (
        <Badge badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} color="secondary">
          <ShoppingCartIcon />
        </Badge>
      ),
      action: () => setCartOpen(true),
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !(item.restricted && user?.role === 'Customer')
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Pizzalicious
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          {filteredMenuItems.map((item, index) => (
            <Button
              key={index}
              color="inherit"
              href={item.url || undefined}
              onClick={item.action || undefined}
              startIcon={item.icon}
              sx={{ textTransform: 'none' }}
            >
              {item.name}
            </Button>
          ))}
        </Box>
      </Toolbar>

      {/* Drawer for MiniCart */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <MiniCart />
      </Drawer>
    </AppBar>
  );
};

export default Navbar;