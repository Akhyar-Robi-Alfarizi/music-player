const { authRequired } = require('./auth');

function optionalAuth(req, res, next) {
  if (!req.headers.authorization) {
    return next();
  }

  return authRequired(req, res, next);
}

module.exports = {
  optionalAuth,
};
