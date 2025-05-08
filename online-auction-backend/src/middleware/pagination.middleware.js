/**
 * Middleware to handle pagination for API endpoints
 * Adds pagination parameters to the request object
 */
const paginationMiddleware = (req, res, next) => {
  // Get page and limit from query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Ensure minimum values and calculate offset
  const normalizedPage = page < 1 ? 1 : page;
  const normalizedLimit = limit < 1 ? 10 : (limit > 100 ? 100 : limit);
  const offset = (normalizedPage - 1) * normalizedLimit;
  
  // Add pagination parameters to the request object
  req.pagination = {
    page: normalizedPage,
    limit: normalizedLimit,
    offset
  };
  
  next();
};

export default paginationMiddleware; 