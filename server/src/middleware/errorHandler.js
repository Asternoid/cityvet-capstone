const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);

  const statusCode = err.statusCode || 500;
  const message = statusCode >= 500
    ? 'The request could not be completed. Please try again later.'
    : 'The request could not be completed.';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorHandler;