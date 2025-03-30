import axios from 'axios';
import { CartItem } from '../types';

const API_URL = 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch the user's cart from the server
 */
export const fetchUserCart = async (): Promise<{ items: CartItem[] }> => {
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching cart from server:', error);
    // Return empty cart on error
    return { items: [] };
  }
};

/**
 * Save the user's cart to the server
 */
export const saveUserCart = async (items: CartItem[]): Promise<void> => {
  try {
    await axios.post(`${API_URL}/cart`, { items }, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error('Error saving cart to server:', error);
    throw error;
  }
}; 