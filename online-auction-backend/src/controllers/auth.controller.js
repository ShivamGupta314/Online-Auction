import { prisma } from '../prismaClient.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../utils/auth.js'

// ✅ Register new user (SELLER, BIDDER, ADMIN)
export const register = async (req, res) => {
    console.log('Register HIT with:', req.body) // 🔍 DEBUG
    const { username, email, password, role } = req.body
  
    const validRoles = ["ADMIN", "SELLER", "BIDDER"]
    if (!validRoles.includes(role)) {
      return res.status(403).json({ message: 'Invalid role provided' })
    }
  

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    })

    const token = generateToken({ id: user.id, role: user.role })
    res.status(201).json({ token, user })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ message: 'Registration failed' })
  }
}

// ✅ Login user
export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken({ id: user.id, role: user.role })
    res.status(200).json({ token, user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed' })
  }
}
