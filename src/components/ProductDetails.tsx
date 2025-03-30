import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Share2, Minus, Plus, Heart, Facebook, Twitter, Instagram, Mail, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Product, Review, ProductSize } from '../types';
import { getProductById } from '../api/productApi';
import { getReviewsByProductId, addReview } from '../api/reviewApi';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [imagesLoading, setImagesLoading] = useState(true);
  
  const addItem = useCartStore(state => state.addItem);
  const { user, isAuthenticated } = useAuthStore();

  // Get the price based on the selected size
  const getSelectedPrice = () => {
    if (!product) return 0;
    
    if (selectedSize && product.sizeOptions) {
      const sizeOption = product.sizeOptions.find(option => option.size === selectedSize);
      if (sizeOption && sizeOption.price !== undefined) {
        return sizeOption.price;
      }
    }
    
    return product.price;
  };

  // Get the inventory based on the selected size
  const getSelectedInventory = () => {
    if (!product) return 0;
    
    if (selectedSize && product.sizeOptions) {
      const sizeOption = product.sizeOptions.find(option => option.size === selectedSize);
      if (sizeOption && sizeOption.inventory !== undefined) {
        return sizeOption.inventory;
      }
    }
    
    return product.inventory;
  };

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          setError('Product ID missing');
          return;
        }
        
        // Fetch product details
        const productData = await getProductById(id);
        if (!productData) {
          setError('Product not found');
          return;
        }
        
        setProduct(productData);
        
        // Set default selected size
        if (productData.sizeOptions && productData.sizeOptions.length > 0) {
          const defaultSize = productData.sizeOptions.find(option => option.isDefault);
          setSelectedSize(defaultSize ? defaultSize.size : productData.sizeOptions[0].size);
        }
        
        // Fetch reviews for this product
        const reviewsData = await getReviewsByProductId(productData._id);
        setReviews(reviewsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      if (!selectedSize && product.sizeOptions && product.sizeOptions.length > 0) {
        setCartMessage({
          type: 'error',
          message: 'Please select a size before adding to cart'
        });
        return;
      }
      
      addItem(product, quantity, selectedSize || undefined);
      
      setCartMessage({
        type: 'success',
        message: `${product.name} added to your cart`
      });
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setCartMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage({
        type: 'error',
        message: 'Could not add item to cart'
      });
    }
  };

  const handleShareClick = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareProduct = (platform: string) => {
    if (!product) return;
    
    const url = window.location.href;
    const text = `Check out ${product.name} by ${product.brand}!`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      default:
        shareUrl = url;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    
    setShowShareOptions(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    
    if (!product || !isAuthenticated) {
      setReviewError('You must be logged in to submit a review');
      return;
    }
    
    if (!newReview.comment.trim()) {
      setReviewError('Please enter a review comment');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const newReviewData = {
        productId: product._id,
        userId: user?._id || 'anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        verifiedPurchase: true // In a real app, check purchase history
      };
      
      // Add review through API
      const addedReview = await addReview(newReviewData);
      
      if (addedReview) {
        // Add new review to state
        setReviews([addedReview, ...reviews]);
        // Reset form
        setNewReview({ rating: 5, comment: '' });
        // Show success message
        setReviewError('Review submitted successfully');
        setTimeout(() => setReviewError(null), 3000);
      } else {
        setReviewError('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      setReviewError('An error occurred while submitting your review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Simulates image loading
  useEffect(() => {
    if (product) {
      // Simulate image loading
      const timer = setTimeout(() => {
        setImagesLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
        <div className="text-xl text-gray-500">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-serif mb-4 text-gray-700">{error || 'Product not found'}</h2>
        <p className="text-gray-500 mb-6">Sorry, we couldn't find the product you're looking for.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {cartMessage && (
        <div 
          className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-md flex items-center ${
            cartMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {cartMessage.type === 'success' ? (
            <Check className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          <span>{cartMessage.message}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
            {imagesLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-lg overflow-hidden relative ${
                  selectedImage === index ? 'ring-2 ring-black' : ''
                }`}
              >
                {imagesLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.brand}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">({reviews.length} reviews)</span>
          </div>

          <p className="text-2xl font-medium">${getSelectedPrice().toFixed(2)}</p>

          <p className="text-gray-600">{product.description}</p>

          {product.sizeOptions && product.sizeOptions.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Size</h3>
                {selectedSize && (
                  <span className="text-sm text-gray-500">
                    ${getSelectedPrice().toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizeOptions.map((sizeOption) => (
                  <button
                    key={sizeOption.size}
                    onClick={() => setSelectedSize(sizeOption.size)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      selectedSize === sizeOption.size 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:border-gray-600'
                    } ${sizeOption.inventory === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={sizeOption.inventory === 0}
                  >
                    {sizeOption.size}
                    {sizeOption.inventory === 0 && ' - Sold Out'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(getSelectedInventory(), quantity + 1))}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {getSelectedInventory()} available
              {getSelectedInventory() < 5 && getSelectedInventory() > 0 && (
                <span className="text-red-500 ml-2">Low stock</span>
              )}
              {getSelectedInventory() === 0 && (
                <span className="text-red-500 ml-2">Out of stock</span>
              )}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={getSelectedInventory() === 0}
              className={`flex-1 py-3 rounded-md ${
                getSelectedInventory() === 0 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {getSelectedInventory() === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button 
              className="p-3 border rounded-md hover:bg-gray-50"
              aria-label="Add to wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={handleShareClick}
                className="p-3 border rounded-md hover:bg-gray-50"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {showShareOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 p-2">
                  <button
                    onClick={() => shareProduct('facebook')}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-md"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareProduct('twitter')}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-md"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareProduct('email')}
                    className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-md"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex space-x-8 text-sm">
              <span>Tags: </span>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t pt-10">
        <h2 className="text-2xl font-serif mb-8">Customer Reviews</h2>
        
        {/* Review Form */}
        {isAuthenticated ? (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-medium mb-4">Write a Review</h3>
            {reviewError && (
              <div className={`p-3 mb-4 rounded-md ${
                reviewError.includes('success') 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {reviewError}
              </div>
            )}
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview || !newReview.comment}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center">
            <p className="text-gray-600 mb-4">Sign in to leave a review</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Sign In
            </button>
          </div>
        )}
        
        {/* Reviews List */}
        <div className="space-y-8">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Star className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No reviews yet</p>
              <p className="text-gray-700 font-medium">Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b pb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.verifiedPurchase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-1">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <p className="mt-3">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;