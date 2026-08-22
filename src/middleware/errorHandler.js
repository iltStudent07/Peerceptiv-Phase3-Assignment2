import AppError from '../utils/AppError.js'

export function notFound(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'
  let details = err.details

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation failed'
    details = Object.values(err.errors).map((item) => item.message)
  }

  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path} format`
  }

  if (err.code === 11000) {
    statusCode = 409
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field'
    message = `${duplicatedField} already exists`
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Invalid or expired token'
  }

  const response = { error: message }
  if (details) response.details = details

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}