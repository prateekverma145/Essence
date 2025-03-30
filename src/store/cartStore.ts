import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '../types';
import { fetchUserCart, saveUserCart } from '../api/cartApi';

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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      isSyncing: false,
      lastSyncTime: null,
      
      setUserId: (userId) => {
        set({ userId });
        // Clear cart if userId is null (user logged out)
        if (userId === null) {
          set({ items: [], lastSyncTime: null });
        }
      },
      
      loadFromServer: async (userId) => {
        try {
          set({ isSyncing: true });
          const cartData = await fetchUserCart();
          
          if (cartData && cartData.items) {
            set({ 
              items: cartData.items,
              lastSyncTime: Date.now()
            });
          }
        } catch (error) {
          console.error('Error loading cart from server:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
      
      syncToServer: async () => {
        const { userId, items } = get();
        
        if (!userId) return; // Only sync if user is logged in
        
        try {
          set({ isSyncing: true });
          await saveUserCart(items);
          set({ lastSyncTime: Date.now() });
        } catch (error) {
          console.error('Error syncing cart to server:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
      
      addItem: (product, quantity, selectedSize) => {
        set((state) => {
          // Check if the product with the same ID and size (if applicable) already exists
          const existingItem = state.items.find(
            item => item.product._id === product._id && 
            (!selectedSize || item.selectedSize === selectedSize)
          );
          
          let newState;
          
          if (existingItem) {
            // If the item exists, update its quantity
            newState = {
              items: state.items.map(item => 
                (item.product._id === product._id && 
                 (!selectedSize || item.selectedSize === selectedSize))
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          } else {
            // If it's a new item, add it to the cart
            newState = {
              items: [...state.items, { product, quantity, selectedSize }]
            };
          }
          
          // Schedule server sync
          setTimeout(() => {
            get().syncToServer();
          }, 500);
          
          return newState;
        });
      },
      
      removeItem: (productId, selectedSize) => {
        set((state) => {
          const newState = {
            items: state.items.filter(item => 
              !(item.product._id === productId && 
                (!selectedSize || item.selectedSize === selectedSize))
            )
          };
          
          // Schedule server sync
          setTimeout(() => {
            get().syncToServer();
          }, 500);
          
          return newState;
        });
      },
      
      updateQuantity: (productId, quantity, selectedSize) => {
        set((state) => {
          const newState = {
            items: state.items.map(item => 
              (item.product._id === productId && 
               (!selectedSize || item.selectedSize === selectedSize))
                ? { ...item, quantity }
                : item
            )
          };
          
          // Schedule server sync
          setTimeout(() => {
            get().syncToServer();
          }, 500);
          
          return newState;
        });
      },
      
      clearCart: () => {
        set({ items: [] });
        
        // Schedule server sync
        setTimeout(() => {
          get().syncToServer();
        }, 500);
      },
      
      itemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      total: () => {
        return get().items.reduce((total, item) => {
          // Check if there's a different price for the selected size
          if (item.selectedSize && item.product.sizeOptions) {
            const sizeOption = item.product.sizeOptions.find(
              option => option.size === item.selectedSize
            );
            
            if (sizeOption && sizeOption.price) {
              return total + (sizeOption.price * item.quantity);
            }
          }
          
          // Default to the product's base price
          return total + (item.product.price * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'cart-storage', // unique name for localStorage
      
      // Add a custom merge function to handle user-specific carts
      merge: (persistedState: any, currentState: CartState) => {
        // If userId doesn't match, use empty cart or persisted state
        if (persistedState.userId !== currentState.userId) {
          return {
            ...currentState,
            items: [] // Start with an empty cart for new user
          };
        }
        return persistedState as CartState;
      },
    }
  )
);