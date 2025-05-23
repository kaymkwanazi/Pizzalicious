import React, { useState, useEffect } from 'react';
import { Grid, Pagination, Card, CardHeader, CardMedia, CardContent, CardActions, IconButton, Typography, Avatar, TextField, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FaRegEye } from "react-icons/fa";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {useCart} from "@/components/CartContext";

const DessertMenu = () => {
  const [desserts, setDesserts] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState(null);
  const [selectedDessert, setSelectedDessert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const itemsPerPage = 6;
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchDesserts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/Desserts');
        const data = await response.json();
        setDesserts(data);
      } catch (error) {
        console.error('Error fetching desserts:', error);
      }
    };

    fetchDesserts();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const handleDialogOpen = (dessert) => {
    setSelectedDessert(dessert);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedDessert(null);
  };

  const filteredDesserts = desserts
    .filter((dessert) => dessert.name.toLowerCase().includes(searchTerm))
    .sort((a, b) => {
      if (!sortOrder) return 0;
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

  const totalPages = Math.ceil(filteredDesserts.length / itemsPerPage);
  const displayedDesserts = filteredDesserts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <TextField
          label="Search by name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flex: 1, marginRight: '16px' }}
        />
        <Button
          variant="contained"
          startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          onClick={handleSortToggle}
        >
          Sort by Price
        </Button>
      </Box>
      <Grid
        container
        spacing={2}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {displayedDesserts.map((dessert) => (
          <Grid item key={dessert.id} sx={{ width: '100%' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="dessert">
                    {dessert.name[0]}
                  </Avatar>
                }
                action={
                  <IconButton aria-label="view details" onClick={() => handleDialogOpen(dessert)}>
                    <FaRegEye />
                  </IconButton>
                }
                title={dessert.name}
                subheader={`R${dessert.price.toFixed(2)}`}
              />
              <CardMedia
                component="img"
                height="150"
                image={dessert.imageUrl}
                alt={dessert.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '8px' }}>
                  {dessert.description}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="Add To Cart"
                onClick={() => addToCart(dessert)}
                >
                  <ShoppingCartIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}
      />

      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>{selectedDessert?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src={selectedDessert?.imageUrl} 
              alt={selectedDessert?.name} 
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', marginBottom: '16px' }} 
            />
            <Typography variant="body1" sx={{ marginBottom: '8px' }}>
              <strong>Description:</strong> {selectedDessert?.description}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: '8px' }}>
              <strong>Price:</strong> R{selectedDessert?.price.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DessertMenu;