import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { getProductById } from '../api/productApi';
import { Product } from '../types';

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating?: number;
  isNew?: boolean;
  product?: Product; // Full product object if available
}

const ProductCard = ({ id, name, brand, price, image, rating = 0, isNew = false, product }: ProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    // Prevent navigation to the product page
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    try {
      let productToAdd = product;
      
      // If full product is not provided, fetch it
      if (!productToAdd) {
        productToAdd = await getProductById(id);
      }
      
      if (productToAdd) {
        // Add product to cart with default options
        // For size-specific products, select a default size if available
        let defaultSize: string | undefined = undefined;
        if (productToAdd.sizeOptions && productToAdd.sizeOptions.length > 0) {
          const defaultSizeOption = productToAdd.sizeOptions.find(option => option.isDefault);
          defaultSize = defaultSizeOption ? defaultSizeOption.size : productToAdd.sizeOptions[0].size;
        }
        
        addItem(productToAdd, 1, defaultSize);
        
        // Show "Added" confirmation
        setAddedToCart(true);
        setTimeout(() => {
          setAddedToCart(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group relative">
      <Link to={`/product/${id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-300"
          />
          <button 
            className="absolute top-4 right-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-gray-50"
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-5 h-5" />
          </button>
          {isNew && (
            <span className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-medium rounded-full">
              New
            </span>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-gray-700">{brand}</h3>
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-lg font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-900">${price.toFixed(2)}</p>
        </div>
      </Link>
      <button 
        onClick={handleAddToCart}
        disabled={isAddingToCart || addedToCart}
        className={`w-full mt-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex justify-center items-center ${
          addedToCart 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
        aria-label="Add to cart"
      >
        {isAddingToCart ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </span>
        ) : addedToCart ? (
          <span className="flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Added
          </span>
        ) : (
          <span className="flex items-center">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </span>
        )}
      </button>
    </div>
  );
};

export default ProductCard;