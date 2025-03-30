import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perfume_shop';

// Connect to MongoDB directly
let db;
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db();
    
    // Create collections if they don't exist
    if (!(await db.listCollections({ name: 'products' }).hasNext())) {
      await db.createCollection('products');
    }
    
    if (!(await db.listCollections({ name: 'reviews' }).hasNext())) {
      await db.createCollection('reviews');
    }

    if (!(await db.listCollections({ name: 'users' }).hasNext())) {
      await db.createCollection('users');
    }
    
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Connect to MongoDB
connectToDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('users').insertOne(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { _id: newUser._id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return user data (excluding password)
    const { password: _, ...userData } = newUser;
    
    res.status(201).json({
      success: true,
      data: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    
    res.json({
      success: true,
      data: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error during login' });
  }
});

// API Routes
// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.collection('products').find().sort({ createdAt: -1 }).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.get('/api/products/featured', async (req, res) => {
  try {
    const products = await db.collection('products').find({ featured: true }).limit(4).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Error fetching featured products' });
  }
});

app.get('/api/products/new', async (req, res) => {
  try {
    const products = await db.collection('products').find().sort({ createdAt: -1 }).limit(4).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ message: 'Error fetching new arrivals' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id) && id !== '1') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const product = id === '1' 
      ? await db.collection('products').findOne({ name: 'Midnight Rose' })
      : await db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(id) });
      
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

app.get('/api/products/search/:query', async (req, res) => {
  try {
    const searchRegex = new RegExp(req.params.query, 'i');
    const products = await db.collection('products').find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
      ],
    }).toArray();
    
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
});

// Create a new product (POST /api/products)
app.post('/api/products', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'brand', 'description', 'price', 'images', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Create new product object
    const newProduct = {
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
      inventory: req.body.inventory || 0,
      rating: req.body.rating || 0,
      tags: req.body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert into database
    await db.collection('products').insertOne(newProduct);
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Review Routes
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId) && productId !== '1') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const reviews = productId === '1'
      ? await db.collection('reviews').find({ productId: '1' }).sort({ createdAt: -1 }).toArray()
      : await db.collection('reviews').find({ productId: new mongoose.Types.ObjectId(productId) }).sort({ createdAt: -1 }).toArray();
      
    res.json(reviews);
  } catch (error) {
    console.error(`Error fetching reviews for product ${req.params.productId}:`, error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = {
      ...req.body,
      createdAt: new Date().toISOString(),
      _id: new mongoose.Types.ObjectId()
    };
    
    await db.collection('reviews').insertOne(review);
    
    // Update product rating
    const productId = req.body.productId;
    const reviews = await db.collection('reviews').find({ productId }).toArray();
    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    
    await db.collection('products').updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      { $set: { rating: avgRating } }
    );
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
});

// Add PATCH route for updating a review
app.patch('/api/reviews/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    // Check if reviewId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID format' });
    }
    
    const updatedReview = await db.collection('reviews').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(reviewId) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    
    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update product rating after review update
    const productId = updatedReview.productId;
    const reviews = await db.collection('reviews').find({ productId }).toArray();
    const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    
    await db.collection('products').updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      { $set: { rating: avgRating } }
    );
    
    res.json(updatedReview);
  } catch (error) {
    console.error(`Error updating review ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Add DELETE route for deleting a review
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    // Check if reviewId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID format' });
    }
    
    const deletedReview = await db.collection('reviews').findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(reviewId) 
    });
    
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update product rating after review deletion
    const productId = deletedReview.productId;
    const reviews = await db.collection('reviews').find({ productId }).toArray();
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
      await db.collection('products').updateOne(
        { _id: new mongoose.Types.ObjectId(productId) },
        { $set: { rating: avgRating } }
      );
    }
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(`Error deleting review ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// Seed data route for development
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await db.collection('products').deleteMany({});
    await db.collection('reviews').deleteMany({});
    await db.collection('users').deleteMany({});
    
    // Seed users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);
    
    const demoUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Demo User',
      email: 'user@example.com',
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('users').insertOne(demoUser);
    
    // Seed products
    const products = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Midnight Rose',
        brand: 'Lumière',
        description: 'A captivating blend of Bulgarian rose, midnight jasmine, and warm amber. This enchanting fragrance opens with fresh bergamot and pink pepper, leading to a heart of rich florals and a base of vanilla and musk.',
        price: 299,
        images: [
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=1000'
        ],
        category: 'Floral',
        tags: ['Rose', 'Jasmine', 'Amber'],
        rating: 4.8,
        inventory: 15,
        featured: true,
        sizeOptions: [
          { size: '30ml', price: 129, inventory: 10, isDefault: false },
          { size: '50ml', price: 199, inventory: 15, isDefault: true },
          { size: '100ml', price: 299, inventory: 8, isDefault: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Ocean Breeze',
        brand: 'Aqua',
        description: 'Fresh and invigorating scent with notes of sea salt, citrus, and driftwood. This vibrant fragrance evokes the feeling of a coastal walk on a sunny day, with refreshing top notes of bergamot and lemon, a heart of lavender and marine accord, and a base of driftwood and musk.',
        price: 249,
        images: [
          'https://images.unsplash.com/photo-1595425964072-458589267fe1?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1551392603-2977e7a14e5c?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1584075796324-61273f228898?auto=format&fit=crop&q=80&w=1000'
        ],
        category: 'Fresh',
        tags: ['Marine', 'Citrus', 'Wood'],
        rating: 4.5,
        inventory: 20,
        featured: true,
        sizeOptions: [
          { size: '30ml', price: 99, inventory: 12, isDefault: false },
          { size: '50ml', price: 169, inventory: 20, isDefault: true },
          { size: '100ml', price: 249, inventory: 15, isDefault: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Velvet Oud',
        brand: 'Mystique',
        description: 'Rich and opulent fragrance featuring rare oud wood, vanilla, and spices. This luxurious oriental scent opens with saffron and cinnamon, develops into a heart of Bulgarian rose and oud, and settles into a rich base of sandalwood, vanilla, and amber.',
        price: 399,
        images: [
          'https://images.unsplash.com/photo-1557053506-91e1290aa02d?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1559416523-84200b75e841?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1553737487-dd941183f5f3?auto=format&fit=crop&q=80&w=1000'
        ],
        category: 'Oriental',
        tags: ['Oud', 'Spicy', 'Vanilla'],
        rating: 4.9,
        inventory: 8,
        featured: true,
        sizeOptions: [
          { size: '50ml', price: 259, inventory: 8, isDefault: false },
          { size: '100ml', price: 399, inventory: 5, isDefault: true }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Citrus Fusion',
        brand: 'Zest',
        description: 'Vibrant blend of bergamot, lemon, and grapefruit with hints of mint. This refreshing citrus fragrance combines zesty top notes of Italian lemon and bergamot, a heart of mint and green tea, and a base of cedarwood and white musk.',
        price: 199,
        images: [
          'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1608528577891-eb055944b1d7?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1558697698-9300a84a0fda?auto=format&fit=crop&q=80&w=1000'
        ],
        category: 'Citrus',
        tags: ['Bergamot', 'Lemon', 'Fresh'],
        rating: 4.6,
        inventory: 25,
        featured: true,
        sizeOptions: [
          { size: '30ml', price: 89, inventory: 15, isDefault: false },
          { size: '50ml', price: 149, inventory: 25, isDefault: true },
          { size: '100ml', price: 199, inventory: 10, isDefault: false }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Amber Twilight',
        brand: 'Golden Hour',
        description: 'Warm amber combined with vanilla and sandalwood for an evening scent.',
        price: 279,
        images: ['https://images.unsplash.com/photo-1615384424397-fe21e9388eed?auto=format&fit=crop&q=80&w=1000'],
        category: 'Oriental',
        tags: ['Amber', 'Vanilla', 'Sandalwood'],
        rating: 4.7,
        inventory: 12,
        createdAt: new Date().toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Wild Lavender',
        brand: 'Provence',
        description: 'Soothing lavender blended with bergamot and cedar.',
        price: 229,
        images: ['https://images.unsplash.com/photo-1565185748897-7fe4e5a6d6cd?auto=format&fit=crop&q=80&w=1000'],
        category: 'Aromatic',
        tags: ['Lavender', 'Bergamot', 'Cedar'],
        rating: 4.4,
        inventory: 18,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Dark Cherry',
        brand: 'Berry Essence',
        description: 'Rich cherry notes with touches of almond and vanilla.',
        price: 259,
        images: ['https://images.unsplash.com/photo-1575351881847-b3bf188d9d0a?auto=format&fit=crop&q=80&w=1000'],
        category: 'Fruity',
        tags: ['Cherry', 'Almond', 'Vanilla'],
        rating: 4.5,
        inventory: 15,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Misty Forest',
        brand: 'Woodland',
        description: 'Fresh pine, cedar, and earthy moss create this woodland scent.',
        price: 239,
        images: ['https://images.unsplash.com/photo-1612179298507-cbf35b808dcd?auto=format&fit=crop&q=80&w=1000'],
        category: 'Woody',
        tags: ['Pine', 'Cedar', 'Moss'],
        rating: 4.6,
        inventory: 22,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      }
    ];
    
    await db.collection('products').insertMany(products);
    
    // Seed reviews for the first product
    const firstProductId = products[0]._id;
    
    const reviews = [
      {
        _id: new mongoose.Types.ObjectId(),
        productId: firstProductId,
        userId: demoUser._id.toString(),
        rating: 5,
        comment: 'This perfume is absolutely stunning! The rose notes last all day and I receive compliments everywhere I go.',
        verifiedPurchase: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        productId: firstProductId,
        userId: 'user2',
        rating: 4,
        comment: 'Beautiful scent but a bit pricey. Still, worth the investment for special occasions.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        productId: firstProductId,
        userId: 'user3',
        rating: 5,
        comment: 'The bottle is gorgeous and the scent is even better. Lasts for hours without fading.',
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];
    
    await db.collection('reviews').insertMany(reviews);
    
    res.status(200).json({ 
      success: true,
      message: 'Database seeded successfully',
      data: {
        productsCount: products.length,
        reviewsCount: reviews.length,
        usersCount: 1
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error seeding database',
      error: error.message
    });
  }
});

// Cart Routes
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find the user's cart
    const cart = await db.collection('carts').findOne({ userId });
    
    if (!cart) {
      // Return empty cart if not found
      return res.json({ items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    console.error(`Error fetching cart:`, error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid cart data. Items must be an array.' });
    }
    
    // Check if cart exists
    const existingCart = await db.collection('carts').findOne({ userId });
    
    if (existingCart) {
      // Update existing cart
      await db.collection('carts').updateOne(
        { userId },
        { 
          $set: { 
            items,
            updatedAt: new Date().toISOString()
          } 
        }
      );
    } else {
      // Create new cart
      await db.collection('carts').insertOne({
        userId,
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    res.status(200).json({ message: 'Cart updated successfully', items });
  } catch (error) {
    console.error(`Error updating cart:`, error);
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 