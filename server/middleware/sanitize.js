const sanitizeHtml = require('sanitize-html');

const sanitizeInput = (req, res, next) => {
  // Sanitize req.body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize req.query
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize req.params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Use sanitize-html for better security
  return sanitizeHtml(str, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
    disallowedTagsMode: 'discard'
  }).trim();
};

module.exports = { sanitizeInput };

