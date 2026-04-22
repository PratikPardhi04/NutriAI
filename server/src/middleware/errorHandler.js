export function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Mongoose validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry' });
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Multer file size
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large (max 8MB)' });
  }

  // Anthropic API errors (AuthenticationError or status 401)
  if (err.status === 401 || err.constructor?.name === 'AuthenticationError') {
    return res.status(502).json({ message: 'Claude API Key is missing or invalid. Please check your server .env file.' });
  }

  // Cloudinary errors
  if (err.http_code === 401) {
    return res.status(502).json({ message: 'Cloudinary credentials missing or invalid. Please check your server .env file.' });
  }

  const statusCode = err.statusCode || err.status || err.http_code || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error'
  });
}
