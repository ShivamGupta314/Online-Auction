/**
 * Utility functions for handling image URLs
 */

// API base URL from your configuration
const API_BASE_URL = 'http://localhost:5001';

/**
 * Converts a relative image path from the backend to a full URL
 * 
 * @param photoUrl The relative path from the backend (e.g., "/images/products/electronics/laptop.jpg")
 * @returns The full URL to access the image
 */
export const getImageUrl = (photoUrl: string | undefined | null): string => {
  // If no photoUrl provided, return a default image
  if (!photoUrl) {
    return 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  }
  
  // If it's already a full URL (starts with http/https), return as is
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  
  // Otherwise, prepend the API base URL to the relative path
  return `${API_BASE_URL}/uploads${photoUrl}`;
}; 