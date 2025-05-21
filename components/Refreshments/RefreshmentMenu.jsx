import React, { useState } from 'react';
import { Grid, Pagination, Card, CardHeader, CardMedia, CardContent, CardActions, IconButton, Typography, Avatar, TextField, Box, Button } from '@mui/material';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Sample pizza data
const pizzas = [
  { id: 1, name: 'Margherita', description: 'Classic pizza with tomato and mozzarella', image: 'https://via.placeholder.com/150', price: 12.99 },
  { id: 2, name: 'Pepperoni', description: 'Spicy pepperoni with cheese and sauce', image: 'https://via.placeholder.com/150', price: 14.99 },
  { id: 3, name: 'Veggie', description: 'Loaded with fresh vegetables', image: 'https://via.placeholder.com/150', price: 13.99 },
  { id: 4, name: 'BBQ Chicken', description: 'Grilled chicken with BBQ sauce', image: 'https://via.placeholder.com/150', price: 15.99 },
  { id: 5, name: 'Hawaiian', description: 'Ham and pineapple', image: 'https://via.placeholder.com/150', price: 14.49 },
  { id: 6, name: 'Meat Lovers', description: 'Loaded with all kinds of meat', image: 'https://via.placeholder.com/150', price: 16.99 },
  { id: 7, name: 'Cheese', description: 'Extra cheesy goodness', image: 'https://via.placeholder.com/150', price: 11.99 },
  { id: 8, name: 'Buffalo Chicken', description: 'Spicy buffalo chicken', image: 'https://via.placeholder.com/150', price: 15.49 },
];

const RefreshmentMenu = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', or 'desc'
  const itemsPerPage = 6; // 3 columns x 2 rows

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setPage(1); // Reset to the first page when searching
  };

  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  // Filter and sort pizzas
  const filteredPizzas = pizzas
    .filter((pizza) => pizza.name.toLowerCase().includes(searchTerm))
    .sort((a, b) => {
      if (!sortOrder) return 0;
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

  const totalPages = Math.ceil(filteredPizzas.length / itemsPerPage);
  const displayedPizzas = filteredPizzas.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div sx={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
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
          gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
          gap: '16px',
        }}
      >
        {displayedPizzas.map((pizza) => (
          <Grid item key={pizza.id} sx={{ width: '100%' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="pizza">
                    {pizza.name[0]}
                  </Avatar>
                }
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
                title={pizza.name}
                subheader={`$${pizza.price.toFixed(2)}`}
              />
              <CardMedia
                component="img"
                height="150"
                image={pizza.image}
                alt={pizza.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {pizza.description}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                  <FavoriteIcon />
                </IconButton>
                <IconButton aria-label="share">
                  <ShareIcon />
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
    </div>
  );
};

export default RefreshmentMenu;