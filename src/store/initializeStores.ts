import { useAuthStore, setCartStore } from './authStore';
import { useCartStore } from './cartStore';

/**
 * Initialize the connection between the auth store and cart store.
 * This should be called once when the app starts.
 */
export const initializeStores = () => {
  // Get the current auth state
  const authState = useAuthStore.getState();
  
  // Get the cart store's setUserId function
  const cartSetUserId = useCartStore.getState().setUserId;
  
  // Register the cart store's setUserId with the auth store
  setCartStore(cartSetUserId);
  
  // Set the initial user ID in the cart store based on the current auth state
  if (authState.isAuthenticated && authState.user) {
    cartSetUserId(authState.user._id);
  } else {
    cartSetUserId(null);
  }
}; 