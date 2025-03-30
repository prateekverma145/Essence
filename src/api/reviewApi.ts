import axios from 'axios';
import { Review } from '../types';

const API_URL = 'http://localhost:5000/api';

/**
 * Fetch reviews for a specific product
 */
export async function getReviewsByProductId(productId: string) {
  try {
    const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }
}

/**
 * Add a new review
 */
export async function addReview(review: Omit<Review, '_id' | 'createdAt'>) {
  try {
    const response = await axios.post(`${API_URL}/reviews`, review);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    return null;
  }
}

/**
 * Update an existing review
 */
export async function updateReview(id: string, changes: Partial<Review>) {
  try {
    const response = await axios.patch(`${API_URL}/reviews/${id}`, changes);
    return response.data;
  } catch (error) {
    console.error(`Error updating review ${id}:`, error);
    return null;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(id: string) {
  try {
    await axios.delete(`${API_URL}/reviews/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting review ${id}:`, error);
    return false;
  }
} 