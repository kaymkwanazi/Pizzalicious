import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.base === item.base &&
          JSON.stringify(cartItem.toppings) === JSON.stringify(item.toppings)
      );
  
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id &&
          cartItem.base === item.base &&
          JSON.stringify(cartItem.toppings) === JSON.stringify(item.toppings)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
  
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemToRemove) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === itemToRemove.id &&
          item.base === itemToRemove.base &&
          JSON.stringify(item.toppings) === JSON.stringify(itemToRemove.toppings)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateQuantity = (id, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );


  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);