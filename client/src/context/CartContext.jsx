import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const CartContext = createContext({});

const calculateTotals = (items, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + gst - discount).toFixed(2));
  return { subtotal, gst, total };
};

export const CartProvider = ({ children }) => {
  const [tableNumber, setTableNumber] = useState(() => sessionStorage.getItem('rm-table') || '1');
  const [cartItems, setCartItems] = useState(() => {
    const stored = sessionStorage.getItem('rm-cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('rm-favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [recentOrders, setRecentOrders] = useState(() => {
    const stored = localStorage.getItem('rm-recent-orders');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    sessionStorage.setItem('rm-table', tableNumber);
  }, [tableNumber]);

  useEffect(() => {
    sessionStorage.setItem('rm-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('rm-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('rm-recent-orders', JSON.stringify(recentOrders.slice(0, 5)));
  }, [recentOrders]);

  const addToCart = (item) => {
    setCartItems((current) => {
      const existing = current.find((entry) => entry.foodId === item.foodId);
      if (existing) {
        return current.map((entry) =>
          entry.foodId === item.foodId ? { ...entry, quantity: entry.quantity + item.quantity } : entry
        );
      }
      return [...current, item];
    });
    toast.success('Added to cart');
  };

  const updateQuantity = (foodId, quantity) => {
    if (quantity < 1) return;
    setCartItems((current) => current.map((item) => (item.foodId === foodId ? { ...item, quantity } : item)));
  };

  const updateInstructions = (foodId, instructions) => {
    setCartItems((current) => current.map((item) => (item.foodId === foodId ? { ...item, instructions } : item)));
  };

  const removeItem = (foodId) => {
    setCartItems((current) => current.filter((item) => item.foodId !== foodId));
  };

  const clearCart = () => setCartItems([]);

  const toggleFavorite = (foodId) => {
    setFavorites((current) =>
      current.includes(foodId) ? current.filter((id) => id !== foodId) : [...current, foodId]
    );
  };

  const recordRecentOrder = (order) => {
    setRecentOrders((current) => [{ orderId: order._id, items: order.items, createdAt: order.createdAt }, ...current]);
  };

  const totals = useMemo(() => calculateTotals(cartItems), [cartItems]);

  return (
    <CartContext.Provider
      value={{
        tableNumber,
        setTableNumber,
        cartItems,
        addToCart,
        updateQuantity,
        updateInstructions,
        removeItem,
        clearCart,
        favorites,
        toggleFavorite,
        recentOrders,
        recordRecentOrder,
        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
