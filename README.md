# Perfume Shop

A full-stack e-commerce website for a perfume shop built with React, TypeScript, MongoDB, and Express.

## Features

- Responsive UI with Tailwind CSS
- Product listings with filtering
- Detailed product pages with image gallery
- Customer reviews with star ratings
- Social sharing functionality
- Shopping cart functionality
- MongoDB database integration

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Zustand (state management)
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Tooling**: Vite, ESLint

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/perfume-shop.git
cd perfume-shop
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
MONGODB_URI=mongodb://localhost:27017/perfume_shop
PORT=5000
VITE_API_URL=http://localhost:5000/api
```

4. Start development server
```bash
# Run both frontend and backend in development mode
npm run dev:all

# Or run them separately
npm run dev  # Frontend only
npm run server  # Backend only
```

5. Seed the database with initial data
```bash
npm run seed
```

6. Access the application
Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
/
├── src/              # Frontend source code
│   ├── api/          # API service functions
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   ├── models/       # MongoDB models
│   ├── store/        # State management
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
├── server.js         # Express server
└── package.json      # Project configuration
```

## Backend API Routes

- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/new` - Get new arrivals
- `GET /api/products/:id` - Get a single product by ID
- `GET /api/products/search/:query` - Search products
- `GET /api/reviews/product/:productId` - Get reviews for a product
- `POST /api/reviews` - Add a new review
- `POST /api/seed` - Seed the database with initial data

## Screenshots
[screenshot1](./assets/ss1.png)
[screenshot2](./assets/ss2.png)
[screenshot3](./assets/ss3.png)
[screenshot4](./assets/ss4.png)
[screenshot5](./assets/ss5.png)


## License

[MIT License](LICENSE)

## Acknowledgements

- [Unsplash](https://unsplash.com) - Product images
- [Lucide Icons](https://lucide.dev) - UI icons 