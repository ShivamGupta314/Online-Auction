import { z } from 'zod'

// Validation schema for sending a notification to a specific user
export const userNotificationSchema = z.object({
  userId: z.number({
    required_error: 'User ID is required',
    invalid_type_error: 'User ID must be a number'
  }),
  subject: z.string({
    required_error: 'Subject is required'
  }).min(3, 'Subject must be at least 3 characters long')
    .max(100, 'Subject cannot exceed 100 characters'),
  message: z.string({
    required_error: 'Message is required'
  }).min(10, 'Message must be at least 10 characters long')
    .max(2000, 'Message cannot exceed 2000 characters')
})

// Validation schema for broadcasting to users by role
export const roleBroadcastSchema = z.object({
  role: z.enum(['ADMIN', 'SELLER', 'BIDDER'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be one of: ADMIN, SELLER, BIDDER'
  }),
  subject: z.string({
    required_error: 'Subject is required'
  }).min(3, 'Subject must be at least 3 characters long')
    .max(100, 'Subject cannot exceed 100 characters'),
  message: z.string({
    required_error: 'Message is required'
  }).min(10, 'Message must be at least 10 characters long')
    .max(2000, 'Message cannot exceed 2000 characters')
})

// Validation schema for notifying bidders of a specific product
export const productBiddersNotificationSchema = z.object({
  productId: z.number({
    required_error: 'Product ID is required',
    invalid_type_error: 'Product ID must be a number'
  }),
  subject: z.string({
    required_error: 'Subject is required'
  }).min(3, 'Subject must be at least 3 characters long')
    .max(100, 'Subject cannot exceed 100 characters'),
  message: z.string({
    required_error: 'Message is required'
  }).min(10, 'Message must be at least 10 characters long')
    .max(2000, 'Message cannot exceed 2000 characters')
}) 