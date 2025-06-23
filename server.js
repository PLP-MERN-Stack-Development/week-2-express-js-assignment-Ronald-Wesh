// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import custom modules
const logger = require('./middleware/logger');
const authenticateApiKey = require('./middleware/auth');
const { validateProduct, validatePartialProduct } = require('./middleware/validation');
const { NotFoundError, ValidationError, AuthenticationError, CustomError } = require('./utils/errors');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup-Global Middleware
app.use(bodyParser.json());
app.use(logger); // Log all requests


// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];


// Helper function to find product by ID
const findProductById = (id) => {
  return products.find(product => product.id === id);
};

// Helper function to find product index by ID
const findProductIndex = (id) => {
  return products.findIndex(product => product.id === id);
};

//Hello World Route
app.get('/', (req, res) => {
  res.send('Hello world');
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product API!',
    endpoints: {
      'GET /api/products': 'Get all products',
      'GET /api/products/:id': 'Get a specific product',
      'POST /api/products': 'Create a new product',
      'PUT /api/products/:id': 'Update a product',
      'DELETE /api/products/:id': 'Delete a product',
      'GET /api/products/search': 'Search products by name',
      'GET /api/products/stats': 'Get product statistics'
    }
  });
});

// TODO: Implement the following routes:
// GET /api/products - Get all products
// GET /api/products/:id - Get a specific product
// POST /api/products - Create a new product
// PUT /api/products/:id - Update a product
// DELETE /api/products/:id - Delete a product

// Example route implementation for GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// CRUD Routes

// GET /api/products - Get all products with filtering and pagination
app.get('/api/products', (req, res, next) => {
  try {
    let result = [...products];
    
    // Filter by category
    if (req.query.category) {
      result = result.filter(product => 
        product.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    // Filter by stock status
    if (req.query.inStock !== undefined) {
      const inStock = req.query.inStock === 'true';
      result = result.filter(product => product.inStock === inStock);
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedResults = result.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total: result.length,
        pages: Math.ceil(result.length / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res, next) => {
  try {
    const product = findProductById(req.params.id);
    
    if (!product) {
      return next(new NotFoundError(`Product with ID ${req.params.id} not found`));
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product
app.post('/api/products', authenticateApiKey, validateProduct, (req, res, next) => {
  try {
    const newProduct = {
      id: uuidv4(),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price: req.body.price,
      category: req.body.category.trim().toLowerCase(),
      inStock: req.body.inStock
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', authenticateApiKey, validatePartialProduct, (req, res, next) => {
  try {
    const productIndex = findProductIndex(req.params.id);
    
    if (productIndex === -1) {
      return next(new NotFoundError(`Product with ID ${req.params.id} not found`));
    }
    
    // Update only provided fields
    const updatedProduct = { ...products[productIndex] };
    
    if (req.body.name !== undefined) updatedProduct.name = req.body.name.trim();
    if (req.body.description !== undefined) updatedProduct.description = req.body.description.trim();
    if (req.body.price !== undefined) updatedProduct.price = req.body.price;
    if (req.body.category !== undefined) updatedProduct.category = req.body.category.trim().toLowerCase();
    if (req.body.inStock !== undefined) updatedProduct.inStock = req.body.inStock;
    
    products[productIndex] = updatedProduct;
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', authenticateApiKey, (req, res, next) => {
  try {
    const productIndex = findProductIndex(req.params.id);
    
    if (productIndex === -1) {
      return next(new NotFoundError(`Product with ID ${req.params.id} not found`));
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct
    });
  } catch (error) {
    next(error);
  }
});

// Advanced Features

// GET /api/products/search - Search products by name
app.get('/api/products/search', (req, res, next) => {
  try {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
      return next(new ValidationError('Search query parameter "q" is required'));
    }
    
    const searchResults = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    res.json({
      success: true,
      data: searchResults,
      searchTerm,
      count: searchResults.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/stats - Get product statistics
app.get('/api/products/stats', (req, res, next) => {
  try {
    const stats = {
      total: products.length,
      inStock: products.filter(p => p.inStock).length,
      outOfStock: products.filter(p => !p.inStock).length,
      categories: {},
      averagePrice: 0
    };
    
    // Calculate category counts
    products.forEach(product => {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    });
    
    // Calculate average price
    if (products.length > 0) {
      const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
      stats.averagePrice = Math.round((totalPrice / products.length) * 100) / 100;
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Global Error Handling Middleware
app.use((error, req, res, next) => {
  // Log error for debugging
  console.error(`Error occurred: ${error.message}`);
  console.error(`Stack trace: ${error.stack}`);
  
  // Handle different types of errors
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode
      }
    });
  }
  
  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid JSON format',
        statusCode: 400
      }
    });
  }
  
  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      statusCode: 500
    }
  });
});

// Handle 404 for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      statusCode: 404
    }
  });
});



// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation available at http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app; 