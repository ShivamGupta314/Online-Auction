import jwt from 'jsonwebtoken'

/**
 * Generate a Bearer token for a test user
 * @param {Object} user - The user object (must include id, email, role)
 * @returns {string} Bearer <token>
 */
export function getToken(user) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1d' }
  )

  return `Bearer ${token}`
}
