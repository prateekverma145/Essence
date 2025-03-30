import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String],
    required: true,
    validate: [(val: string[]) => val.length > 0, 'Product must have at least one image']
  },
  category: {
    type: String,
    required: true,
    enum: ['Floral', 'Woody', 'Oriental', 'Fresh', 'Citrus', 'Aromatic', 'Fruity']
  },
  tags: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  inventory: {
    type: Number,
    required: true,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Use mongoose.models to prevent model recompilation error in development
export default mongoose.models.Product || mongoose.model('Product', ProductSchema); 