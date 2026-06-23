/**
 * Optional API-key authentication.
 *
 * If process.env.API_KEY is set, every request must carry a matching
 * `X-API-Key` header (or `?apiKey=` query param) or it is rejected with 401.
 * If API_KEY is NOT set, the middleware is a no-op — keeping local development
 * frictionless while allowing a deployment to lock the API down via one env var.
 */
function requireApiKey(req, res, next) {
  const expected = process.env.API_KEY;
  if (!expected) return next(); // auth disabled

  const provided = req.get('X-API-Key') || req.query.apiKey;
  if (provided && provided === expected) return next();

  return res.status(401).json({ success: false, error: 'Unauthorized' });
}

module.exports = { requireApiKey };
