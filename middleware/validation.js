const { ValidationError } = require('../utils/errors');

// Validation middleware for product data
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];
  
  // Required fields validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }
  
  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }
  
  if (inStock === undefined || typeof inStock !== 'boolean') {
    errors.push('InStock is required and must be a boolean');
  }
  
  if (errors.length > 0) {
    return next(new ValidationError(`Validation failed: ${errors.join(', ')}`));
  }
  
  next();
};

// Validation middleware for partial updates (PUT requests)
const validatePartialProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];
  
  // Optional field validation (only validate if provided)
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    errors.push('Name must be a non-empty string');
  }
  
  if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
    errors.push('Description must be a non-empty string');
  }
  
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    errors.push('Price must be a non-negative number');
  }
  
  if (category !== undefined && (typeof category !== 'string' || category.trim().length === 0)) {
    errors.push('Category must be a non-empty string');
  }
  
  if (inStock !== undefined && typeof inStock !== 'boolean') {
    errors.push('InStock must be a boolean');
  }
  
  if (errors.length > 0) {
    return next(new ValidationError(`Validation failed: ${errors.join(', ')}`));
  }
  
  next();
};

module.exports = {
  validateProduct,
  validatePartialProduct
};