const jwt = require('jsonwebtoken');

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

function isAuthenticated(req, res, next) {
  const { authorization } = req.headers;
  console.log(req.headers)
  if (!authorization) {
    res.status(401);
    console.log('auth')
    throw new Error('🚫 Un-Authorized 🚫');
  }

  try { 
    const token = authorization.split(' ')[1];
    console.log(token)
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.payload = payload;
    console.log(payload)
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') {
      console.log(err)
      throw new Error(err.name);
    }
    console.log('auth')
    throw new Error('🚫 Un-Authorized 🚫');
  }

  return next();
}

function isAuthenticatedByQuery(req, res, next) {
  const { authorization } = req.query;
  console.log(req.query)
  if (!authorization) {
    res.status(401);
    console.log('auth')
    throw new Error('🚫 Un-Authorized 🚫');
  }

  try { 
    const token = decodeURIComponent(authorization)
    console.log(token)
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.payload = payload;
    console.log(payload)
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') {
      console.log(err)
      throw new Error(err.name);
    }
    console.log('auth')
    throw new Error('🚫 Un-Authorized 🚫');
  }

  return next();
}
module.exports = {
  notFound,
  errorHandler,
  isAuthenticated,
  isAuthenticatedByQuery
};
