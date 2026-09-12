const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: messages.join('. '),
      details: messages,
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      error: `An account or record with that ${field} already exists.`,
    });
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(404).json({
      error: `Resource not found with the provided ID.`,
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred.',
  });
};

module.exports = errorHandler;
