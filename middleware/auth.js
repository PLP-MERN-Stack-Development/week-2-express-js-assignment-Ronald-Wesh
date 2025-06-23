const { AuthenticationError } = require('../utils/errors');

// Authentication middleware to check for API key
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'your-secret-api-key';
  
  // Skip authentication for GET requests (optional)
  if (req.method === 'GET') {
    return next();
  }
  
  if (!apiKey) {
    return next(new AuthenticationError('API key is required'));
  }
  
  if (apiKey !== validApiKey) {
    return next(new AuthenticationError('Invalid API key'));
  }
  
  next();
};

module.exports = authenticateApiKey;