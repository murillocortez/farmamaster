import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, User } from '../types';
import { db } from '../services/dbService';

interface StoreContextType {
  user: User | null;
  login: (name: string, phone: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('farma_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('farma_cart');
    return stored ? JSON.parse(stored) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('farma_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('farma_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('farma_user');
    }
  }, [user]);

  const login = async (name: string, phone: string) => {
    try {
      const customer = await db.loginOrRegister(name, phone);
      setUser(customer);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Login error:', error);
      alert('Erro ao entrar. Tente novamente.');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user?.id) return;
    try {
      await db.updateProfile(user.id, data);
      setUser({ ...user, ...data });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => {
    const price = item.promotionalPrice || item.price;
    return acc + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};