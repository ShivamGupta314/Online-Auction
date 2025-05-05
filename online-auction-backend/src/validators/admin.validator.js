import { z } from 'zod'

export const userRoleUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'SELLER', 'BIDDER'], {
    errorMap: () => ({ message: 'Role must be one of: ADMIN, SELLER, BIDDER' })
  })
}) 