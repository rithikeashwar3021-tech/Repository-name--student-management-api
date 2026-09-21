/**
 * Centralized error-handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for developer inspection
  console.error('[Error]', err);

  // Handle malformed JSON request bodies
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload provided in request body.'
    });
  }

  // Handle Supabase/PostgreSQL unique constraint violation (code 23505)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A student with this roll number already exists.'
    });
  }

  // Default internal server error response
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

/**
 * 404 Not Found handler for undefined API routes.
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
