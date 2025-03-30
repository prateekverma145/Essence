# Perfume Shop API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API now provides authentication endpoints for user registration and login. Most endpoints don't require authentication, but some user-specific actions may require it in the future.

### Register a New User
Creates a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Headers**:
  - Content-Type: application/json
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Required Fields**: name, email, password
- **Success Response**: 
  - Status: 201 Created
  - Content:
    ```json
    {
      "success": true,
      "data": {
        "_id": "user-id",
        "name": "User Name",
        "email": "user@example.com",
        "createdAt": "2023-07-15T12:00:00.000Z"
      },
      "token": "jwt-token"
    }
    ```
- **Error Response**: 
  - Status: 400 Bad Request
  - Content: `{ "success": false, "message": "User already exists" }`

### Login
Authenticates a user and returns a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Headers**:
  - Content-Type: application/json
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Required Fields**: email, password
- **Success Response**: 
  - Status: 200 OK
  - Content:
    ```json
    {
      "success": true,
      "data": {
        "_id": "user-id",
        "name": "User Name",
        "email": "user@example.com",
        "createdAt": "2023-07-15T12:00:00.000Z"
      },
      "token": "jwt-token"
    }
    ```
- **Error Response**: 
  - Status: 400 Bad Request
  - Content: `{ "success": false, "message": "Invalid credentials" }`

## Protected Endpoints
For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## Products API

### Get All Products
Retrieves a list of all products.

- **URL**: `/products`
- **Method**: `GET`
- **Success Response**: 
  - Status: 200 OK
  - Content: Array of product objects

### Get Featured Products
Retrieves a list of featured products.

- **URL**: `/products/featured`
- **Method**: `GET`
- **Success Response**: 
  - Status: 200 OK
  - Content: Array of featured product objects

### Get New Arrivals
Retrieves a list of the newest products.

- **URL**: `/products/new`
- **Method**: `GET`
- **Success Response**: 
  - Status: 200 OK
  - Content: Array of newest product objects

### Get Product by ID
Retrieves a specific product by its ID.

- **URL**: `/products/:id`
- **Method**: `GET`
- **URL Params**: 
  - `id`: The ID of the product
- **Success Response**: 
  - Status: 200 OK
  - Content: Product object
- **Error Response**: 
  - Status: 404 Not Found
  - Content: `{ "message": "Product not found" }`

### Search Products
Searches for products by name, description, or brand.

- **URL**: `/products/search/:query`
- **Method**: `GET`
- **URL Params**: 
  - `query`: The search query
- **Success Response**: 
  - Status: 200 OK
  - Content: Array of matching product objects

### Create a Product
Creates a new product.

- **URL**: `/products`
- **Method**: `POST`
- **Headers**:
  - Content-Type: application/json
- **Body**:
  ```json
  {
    "name": "Product Name",
    "brand": "Brand Name",
    "description": "Detailed product description",
    "price": 299,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "category": "Floral",
    "tags": ["Rose", "Jasmine"],
    "inventory": 15,
    "featured": true
  }
  ```
- **Required Fields**: name, brand, description, price, images, category
- **Optional Fields**: tags, inventory, featured
- **Success Response**: 
  - Status: 201 Created
  - Content: Created product object
- **Error Response**: 
  - Status: 400 Bad Request
  - Content: `{ "message": "Missing required fields: field1, field2, ..." }`

## Postman Usage Guide

### Setting Up a Collection
1. Open Postman
2. Create a new Collection named "Perfume Shop API"
3. Add a variable to the collection:
   - Name: `baseUrl`
   - Initial value: `http://localhost:5000/api`
   - Current value: `http://localhost:5000/api`

### Creating a Product
1. Create a new request in your collection
2. Set the method to `POST`
3. Set the URL to `{{baseUrl}}/products`
4. Go to the "Headers" tab and add:
   - Key: `Content-Type`
   - Value: `application/json`
5. Go to the "Body" tab:
   - Select "raw"
   - Select "JSON" from the dropdown
   - Enter the product data (example):
     ```json
     {
       "name": "Midnight Symphony",
       "brand": "Nocturne",
       "description": "An intoxicating blend of bergamot, black orchid, and sandalwood that unfolds through the evening.",
       "price": 349,
       "images": [
         "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=1000",
         "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000"
       ],
       "category": "Oriental",
       "tags": ["Sandalwood", "Bergamot", "Night"],
       "inventory": 10,
       "featured": true
     }
     ```
6. Click "Send" to create the product

### Getting Products
1. Create a new request in your collection
2. Set the method to `GET`
3. Set the URL to one of the following:
   - `{{baseUrl}}/products` - Get all products
   - `{{baseUrl}}/products/featured` - Get featured products
   - `{{baseUrl}}/products/new` - Get new arrivals
   - `{{baseUrl}}/products/{productId}` - Get a specific product by ID
4. Click "Send" to execute the request

## Reviews API

### Get Reviews for a Product
Retrieves all reviews for a specific product.

- **URL**: `/reviews/product/:productId`
- **Method**: `GET`
- **URL Params**: 
  - `productId`: The ID of the product
- **Success Response**: 
  - Status: 200 OK
  - Content: Array of review objects

### Create a Review
Adds a new review for a product.

- **URL**: `/reviews`
- **Method**: `POST`
- **Headers**:
  - Content-Type: application/json
- **Body**:
  ```json
  {
    "productId": "product-id-here",
    "userId": "user-id-here",
    "rating": 5,
    "comment": "This perfume is amazing!",
    "verifiedPurchase": true
  }
  ```
- **Required Fields**: productId, userId, rating, comment
- **Success Response**: 
  - Status: 201 Created
  - Content: Created review object 