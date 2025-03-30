import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative h-[80vh] overflow-hidden bg-gray-900">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=2070"
          alt="Luxury Perfume Collection"
          className="w-full h-full object-cover opacity-70"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
        <div className="flex flex-col justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">
            Discover Your Signature Scent
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl">
            Explore our curated collection of luxury fragrances, crafted by world-renowned perfumers.
          </p>
          <button className="bg-white text-gray-900 px-8 py-3 rounded-md w-fit hover:bg-gray-100 transition duration-300">
            Shop Collection
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Hero;