import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

const Cart = () => {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCartStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Get the price based on the selected size (if applicable)
  const getItemPrice = (item: typeof items[0]) => {
    if (item.selectedSize && item.product.sizeOptions) {
      const sizeOption = item.product.sizeOptions.find(
        option => option.size === item.selectedSize
      );
      
      if (sizeOption && sizeOption.price !== undefined) {
        return sizeOption.price;
      }
    }
    
    return item.product.price;
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);
    
    // Simulate a checkout process
    setTimeout(() => {
      // Clear the cart
      clearCart();
      
      setCheckoutLoading(false);
      setNotification({
        type: 'success',
        message: 'Order placed successfully! This is a demo checkout.'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif mb-8">Your Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-6">Your cart is empty</p>
          <Link to="/" className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif mb-8">Your Cart</h1>
      
      {notification && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm divide-y">
            {items.map((item) => (
              <div key={`${item.product._id}-${item.selectedSize || 'default'}`} className="p-6 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <Link to={`/product/${item.product._id}`} className="text-lg font-medium hover:underline">
                      {item.product.name}
                    </Link>
                    <button 
                      onClick={() => removeItem(item.product._id, item.selectedSize)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p className="text-gray-500">{item.product.brand}</p>
                  
                  {item.selectedSize && (
                    <p className="text-sm text-gray-500 mt-1">
                      Size: <span className="font-medium">{item.selectedSize}</span>
                    </p>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center border rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1), item.selectedSize)}
                        className="p-2 text-gray-600 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          // Get inventory based on size if available
                          let maxInventory = item.product.inventory;
                          if (item.selectedSize && item.product.sizeOptions) {
                            const sizeOption = item.product.sizeOptions.find(
                              option => option.size === item.selectedSize
                            );
                            if (sizeOption && sizeOption.inventory !== undefined) {
                              maxInventory = sizeOption.inventory;
                            }
                          }
                          
                          updateQuantity(
                            item.product._id, 
                            Math.min(maxInventory, item.quantity + 1),
                            item.selectedSize
                          );
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-medium">${(getItemPrice(item) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal ({itemCount()} items)</p>
                <p className="font-medium">${total().toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Shipping</p>
                <p className="font-medium">$0.00</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Tax</p>
                <p className="font-medium">${(total() * 0.1).toFixed(2)}</p>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between">
                <p className="font-medium">Total</p>
                <p className="font-bold">${(total() + total() * 0.1).toFixed(2)}</p>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:opacity-70 flex justify-center items-center"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 