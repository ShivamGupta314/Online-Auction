import { createClient } from 'redis';
import logger from './logger.js';

// Default TTL in seconds
const DEFAULT_TTL = 3600; // 1 hour

let redisClient;
let isConnected = false;

/**
 * Initialize the Redis client
 */
export const initRedisClient = async () => {
  try {
    // Create Redis client
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    // Handle Redis errors
    redisClient.on('error', (error) => {
      logger.error(`Redis Error: ${error.message}`);
      isConnected = false;
    });

    // Handle Redis connection
    redisClient.on('connect', () => {
      logger.info('Redis connected');
      isConnected = true;
    });

    // Connect to Redis
    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    logger.error(`Redis initialization error: ${error.message}`);
    // Continue without Redis
    return null;
  }
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached data or null if not found
 */
export const getCache = async (key) => {
  try {
    if (!isConnected || !redisClient) return null;
    
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    logger.error(`Redis getCache error: ${error.message}`);
    return null;
  }
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - True if successfully cached
 */
export const setCache = async (key, data, ttl = DEFAULT_TTL) => {
  try {
    if (!isConnected || !redisClient) return false;
    
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
    return true;
  } catch (error) {
    logger.error(`Redis setCache error: ${error.message}`);
    return false;
  }
};

/**
 * Delete data from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - True if successfully deleted
 */
export const deleteCache = async (key) => {
  try {
    if (!isConnected || !redisClient) return false;
    
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error(`Redis deleteCache error: ${error.message}`);
    return false;
  }
};

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Cache key pattern (e.g., "products:*")
 * @returns {Promise<boolean>} - True if successfully deleted
 */
export const deleteCacheByPattern = async (pattern) => {
  try {
    if (!isConnected || !redisClient) return false;
    
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    logger.error(`Redis deleteCacheByPattern error: ${error.message}`);
    return false;
  }
};

export default {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  initRedisClient,
}; 