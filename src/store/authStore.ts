import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser } from '../api/auth';
import { useCartStore } from './cartStore';
import { fetchUserCart } from '../api/cartApi';
import axios from 'axios';
import { CartItem, Product } from '../types';

const API_URL = 'http://localhost:5000/api';

// Helper function to extract error message from axios error
const getErrorMessage = (error: any): string => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || 'An error occurred';
};

interface User {
  _id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

interface CartState {
  items: CartItem[];
  userId: string | null;
  isSyncing: boolean;
  lastSyncTime: number | null;
  addItem: (product: Product, quantity: number, selectedSize?: string) => void;
  removeItem: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  setUserId: (userId: string | null) => void;
  loadFromServer: (userId: string) => Promise<void>;
  syncToServer: () => Promise<void>;
  itemCount: () => number;
  total: () => number;
}

// Create a function to get the cartStore outside of components
let cartStoreSetUserId: ((userId: string | null) => void) | null = null;
let cartStoreLoadFromServer: ((userId: string) => void) | null = null;

// This function will be called once when cartStore is initialized
export const setCartStore = (
  setUserId: (userId: string | null) => void,
  loadFromServer: (userId: string) => void
) => {
  cartStoreSetUserId = setUserId;
  cartStoreLoadFromServer = loadFromServer;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, { email, password });
          const userData = response.data;
          
          // Store JWT token
          const token = userData.token;
          localStorage.setItem('token', token);
          
          // Set auth state
          set({ 
            user: userData.data, 
            token: token,
            isAuthenticated: true,
            isLoading: false 
          });
          
          // Set user ID in cart store
          const cartStore = useCartStore.getState();
          cartStore.setUserId(userData.data._id);
          
          // Load cart from server for this user
          await cartStore.loadFromServer(userData.data._id);
          
          return true;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ 
            isLoading: false, 
            error: errorMessage
          });
          return false;
        }
      },
      
      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem('token');
        
        // Reset cart store user ID (which clears cart)
        const cartStore = useCartStore.getState();
        cartStore.setUserId(null);
        
        // Reset auth state
        set({ 
          user: null,
          token: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage
    }
  )
); 