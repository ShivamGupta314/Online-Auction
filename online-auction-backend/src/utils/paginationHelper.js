/**
 * Helper function to build a standardized paginated response
 * @param {Object} params - Pagination parameters
 * @param {Array} data - The data to paginate
 * @param {number} totalCount - Total count of items without pagination
 * @param {string} baseUrl - Base URL for building next/prev links
 * @returns {Object} - Standardized paginated response
 */
export const buildPaginatedResponse = ({ page, limit }, data, totalCount, baseUrl) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);
  
  // Build response with pagination metadata
  const response = {
    data,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
  
  // Add links if baseUrl is provided
  if (baseUrl) {
    response.pagination.links = {};
    
    // Current page
    response.pagination.links.self = `${baseUrl}?page=${page}&limit=${limit}`;
    
    // Next page
    if (response.pagination.hasNext) {
      response.pagination.links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    }
    
    // Previous page
    if (response.pagination.hasPrevious) {
      response.pagination.links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
    }
    
    // First page
    if (page > 1) {
      response.pagination.links.first = `${baseUrl}?page=1&limit=${limit}`;
    }
    
    // Last page
    if (page < totalPages) {
      response.pagination.links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;
    }
  }
  
  return response;
}; 