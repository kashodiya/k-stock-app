module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    res.redirect('/')
}

module.exports.ensureAuthenticatedApi = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    res.json({status: 'fail', err: 'User is not authenticated'});
}