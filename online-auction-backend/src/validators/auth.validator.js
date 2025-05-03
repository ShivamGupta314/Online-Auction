import { z } from 'zod'

export const registerSchema = z.object({
    username: z.string({
      required_error: 'Username is required'
    }).min(3, 'Username must be at least 3 characters'),
    email: z.string({
      required_error: 'Email is required'
    }).email('Invalid email'),
    password: z.string({
      required_error: 'Password is required'
    }).min(6, 'Password must be at least 6 characters'),
    role: z.enum(['SELLER', 'BIDDER'], {
      errorMap: () => ({ message: 'Role must be either SELLER or BIDDER' })
    })
  })
  

export const loginSchema = z.object({
    email: z.string({
        required_error: 'Email is required'
    }).email('Invalid email'),

    password: z.string({
        required_error: 'Password is required'
    }).min(1, 'Password is required')
})

