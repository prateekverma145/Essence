export interface Product {
  _id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  inventory: number;
  featured?: boolean;
  sizeOptions?: ProductSize[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProductSize {
  size: string;
  price?: number; // Additional price for the size (if different)
  inventory?: number; // Inventory specific to this size
  isDefault?: boolean;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}