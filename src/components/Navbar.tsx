import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold">ESSENCE</Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-gray-900">All Products</Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="text-gray-700 hover:text-gray-900 relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative group">
                <button className="text-gray-700 hover:text-gray-900 flex items-center space-x-1">
                  <User className="w-5 h-5" />
                  <span className="text-sm hidden lg:inline">{user?.name}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-gray-900 flex items-center space-x-1">
                <User className="w-5 h-5" />
                <span className="text-sm hidden lg:inline">Sign in</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="text-gray-700 hover:text-gray-900 relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-gray-900">Home</Link>
              <Link to="/products" className="block px-3 py-2 text-gray-700 hover:text-gray-900">All Products</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:text-gray-900">Profile</Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link to="/login" className="block px-3 py-2 text-gray-700 hover:text-gray-900">Sign in</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;