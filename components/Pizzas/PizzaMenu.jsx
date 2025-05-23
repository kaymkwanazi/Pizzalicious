import React, { useState, useEffect } from "react";
import {
  Grid,
  Pagination,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Avatar,
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
} from "@mui/material";
import { red } from "@mui/material/colors";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { FaRegEye } from "react-icons/fa";
import { useCart } from "@/components/CartContext";

const PizzaMenu = () => {
  const [pizzas, setPizzas] = useState([]);
  const [addons, setAddons] = useState({ bases: [], toppings: [] });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedToppings, setSelectedToppings] = useState([]);
  const itemsPerPage = 6;
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const response = await fetch("/api/Pizzas");
        const data = await response.json();
        setPizzas(data);
      } catch (error) {
        console.error("Error fetching pizzas:", error);
      }
    };

    const fetchAddons = async () => {
      try {
        const response = await fetch("/api/Pizzas/Addons/");
        const data = await response.json();
        setAddons(data);
      } catch (error) {
        console.error("Error fetching addons:", error);
      }
    };

    fetchPizzas();
    fetchAddons();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const handleDialogOpen = (pizza) => {
    setSelectedPizza(pizza);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPizza(null);
    setSelectedBase("");
    setSelectedToppings([]);
  };

  const handleAddToCart = () => {
    if (selectedPizza && selectedBase) {
      addToCart({
        ...selectedPizza,
        base: selectedBase,
        toppings: selectedToppings,
      });
      handleDialogClose();
    } else {
      alert("Please select a base for the pizza.");
    }
  };

  const handleToppingChange = (event) => {
    const topping = event.target.name;
    setSelectedToppings((prevToppings) =>
      prevToppings.includes(topping)
        ? prevToppings.filter((t) => t !== topping)
        : [...prevToppings, topping]
    );
  };

  const filteredPizzas = pizzas
    .filter((pizza) => pizza.name.toLowerCase().includes(searchTerm))
    .sort((a, b) => {
      if (!sortOrder) return 0;
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    });

  const totalPages = Math.ceil(filteredPizzas.length / itemsPerPage);
  const displayedPizzas = filteredPizzas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <TextField
          label="Search by name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flex: 1, marginRight: "16px" }}
        />
        <Button
          variant="contained"
          startIcon={
            sortOrder === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
          }
          onClick={handleSortToggle}
        >
          Sort by Price
        </Button>
      </Box>
      <Grid
        container
        spacing={2}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {displayedPizzas.map((pizza) => (
          <Grid item key={pizza.id} sx={{ width: "100%" }}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="pizza">
                    {pizza.name[0]}
                  </Avatar>
                }
                action={
                  <IconButton
                    aria-label="view details"
                    onClick={() => handleDialogOpen(pizza)}
                  >
                    <FaRegEye />
                  </IconButton>
                }
                title={pizza.name}
                subheader={`$${pizza.price.toFixed(2)}`}
              />
              <CardMedia
                component="img"
                height="150"
                image={pizza.imageUrl}
                alt={pizza.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ marginBottom: "8px" }}
                >
                  {pizza.description}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton
                  aria-label="Add To Cart"
                  onClick={() => handleDialogOpen(pizza)}
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
        sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
      />

      {/* Customization Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Customize Your Pizza</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Select Base</Typography>
          <RadioGroup
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
          >
            {addons.bases?.length > 0 ? (
              addons.bases.map((base) => (
                <FormControlLabel
                  key={base.baseid}
                  value={base.basename}
                  control={<Radio />}
                  label={base.basename}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No bases available.
              </Typography>
            )}
          </RadioGroup>

          <Typography variant="h6" sx={{ marginTop: "16px" }}>
            Select Toppings
          </Typography>
          <FormGroup>
            {addons.toppings?.length > 0 ? (
              addons.toppings.map((topping) => (
                <FormControlLabel
                  key={topping.ingredientid}
                  control={
                    <Checkbox
                      name={topping.ingredientname}
                      checked={selectedToppings.includes(
                        topping.ingredientname
                      )}
                      onChange={handleToppingChange}
                    />
                  }
                  label={topping.ingredientname}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No toppings available.
              </Typography>
            )}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddToCart} color="primary">
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PizzaMenu;
