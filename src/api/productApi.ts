import axios from 'axios';
import { Product } from '../types';

const API_URL = 'http://localhost:5000/api';

/**
 * Fetch all products from the database
 */
export async function getAllProducts() {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch featured products
 */
export async function getFeaturedProducts() {
  try {
    const response = await axios.get(`${API_URL}/products/featured`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

/**
 * Fetch new arrivals
 */
export async function getNewArrivals() {
  try {
    const response = await axios.get(`${API_URL}/products/new`);
    return response.data;
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string) {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Search products by query
 */
export async function searchProducts(query: string) {
  try {
    const response = await axios.get(`${API_URL}/products/search/${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Create a new product
 */
export async function createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
} 