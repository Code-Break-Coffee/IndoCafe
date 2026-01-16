import { useState, useEffect } from 'react';
import { CartContext } from './CartContextValues';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to load cart', e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableInfo, setTableInfo] = useState(() => {
    try {
      const savedTable = localStorage.getItem('tableInfo');
      return savedTable ? JSON.parse(savedTable) : null;
    } catch {
      return null;
    }
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save table info to local storage whenever it changes
  useEffect(() => {
    if (tableInfo) {
      localStorage.setItem('tableInfo', JSON.stringify(tableInfo));
    } else {
      localStorage.removeItem('tableInfo');
    }
  }, [tableInfo]);

  const addToCart = (item, quantity = 1, modifiers = []) => {
    setCartItems((prevItems) => {
      // Check if item with same ID and modifiers exists
      // For simplicity, we'll just check ID for now.
      // Should ideally check modifiers too (deep equal).
      const existingItemIndex = prevItems.findIndex(
        (i) => i._id === item._id && JSON.stringify(i.modifiers) === JSON.stringify(modifiers)
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        return [...prevItems, { ...item, quantity, modifiers }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId, modifiers = []) => {
    setCartItems((prevItems) =>
      prevItems.filter((i) => !(i._id === itemId && JSON.stringify(i.modifiers) === JSON.stringify(modifiers)))
    );
  };

  const updateQuantity = (itemId, quantity, modifiers = []) => {
    if (quantity < 1) {
      removeFromCart(itemId, modifiers);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((i) =>
        i._id === itemId && JSON.stringify(i.modifiers) === JSON.stringify(modifiers) ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const clearTableInfo = () => {
    setTableInfo(null);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    tableInfo,
    setTableInfo,
    clearTableInfo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
