export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode);

  res.json({
    success: false,
    message:
      isProduction && statusCode >= 500
        ? 'Internal server error'
        : err.message || 'Server Error',
    errors: err.errors || [],
    ...(isProduction ? {} : { stack: err.stack }),
  });
};