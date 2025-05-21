import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const Navbar = () => {
  const menuItems = [
    { name: 'Home', icon: <HomeIcon />, url: '/' },
    { name: 'Menu', icon: <RestaurantMenuIcon />, url: '/menu' },
    { name: 'Contact', icon: <ContactMailIcon />, url: '/contact' },
  ];

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
          {menuItems.map((item, index) => (
            <Button
              key={index}
              color="inherit"
              href={item.url} 
              startIcon={item.icon} 
              sx={{ textTransform: 'none' }}
            >
              {item.name}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;