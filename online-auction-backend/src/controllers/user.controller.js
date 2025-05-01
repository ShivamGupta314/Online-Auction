import { prisma } from '../prismaClient.js'

export const assignPackage = async (req, res) => {
    const userId = parseInt(req.params.id, 10)
    const { packageId } = req.body
  
    console.log('[assignPackage] userId:', userId, 'packageId:', packageId)
  
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }
  
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        console.log('👤 user:', user)
        
        const pkg = await prisma.package.findUnique({ where: { id: packageId } })
        console.log('📦 package:', pkg)
        
        if (!user || !pkg) {
          if (!user) console.warn('❌ User not found')
          if (!pkg) console.warn('❌ Package not found')
          return res.status(404).json({ message: 'User or Package not found' })
        }
        
  
      const result = await prisma.userPackage.create({
        data: { userId, packageId },
      })
  
      res.status(201).json(result)
    } catch (error) {
      console.error('[POST] /api/users/:id/packages', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        packages: {
          include: {
            package: true,
          },
        },
      },
    })

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json(user)
  } catch (err) {
    console.error('[GET] /api/auth/me', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
export const getUserPackages = async (req, res) => {
  const userId = parseInt(req.params.id)

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' })
  }

  try {
    const userWithPackages = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        packages: {
          include: {
            package: true,
          },
        },
      },
    })

    if (!userWithPackages) {
      return res.status(404).json({ message: 'User not found' })
    }

    const result = userWithPackages.packages.map((up) => up.package)

    res.json(result)
  } catch (error) {
    console.error('[GET] /api/users/:id/packages', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
