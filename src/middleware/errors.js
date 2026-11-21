function notFound(req, res) { res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }
function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.code === 11000) return res.status(409).json({ message: 'That value is already in use.' });
  if (error.name === 'MulterError') return res.status(400).json({ message: error.message });
  res.status(error.status || 500).json({ message: error.message || 'Unexpected server error.' });
}
module.exports = { notFound, errorHandler };
