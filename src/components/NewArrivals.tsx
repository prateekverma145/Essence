import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getNewArrivals } from '../api/productApi';
import { Product } from '../types';

const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const newArrivals = await getNewArrivals();
        setProducts(newArrivals);
      } catch (error) {
        console.error('Error loading new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-serif mb-8">New Arrivals</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500">Loading new arrivals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              image={product.images[0]}
              rating={product.rating}
              isNew={true}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default NewArrivals;