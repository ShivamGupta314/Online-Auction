import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`Auth failed: No valid authorization header. Header: ${authHeader}`)
    return res.status(401).json({ message: 'Unauthorized: No token provided' })
  }

  const token = authHeader.split(' ')[1]
  logger.info(`Auth attempt with token: ${token.substring(0, 15)}...`)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    logger.info(`Auth success for user ID: ${decoded.id}, role: ${decoded.role}`)
    req.user = decoded
    next()
  } catch (err) {
    logger.error(`Token verification failed: ${err.message}`)
    return res.status(403).json({ message: 'Forbidden: Invalid token' })
  }
}

export default authMiddleware
