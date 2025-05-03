import { z } from 'zod'

// Base schema without refine (can use .partial())
const baseProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  photoUrl: z.string().url('Invalid URL'),
  minBidPrice: z.coerce.number().positive('Min bid price must be a positive number'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  categoryId: z.coerce.number().int().positive('Category ID must be a positive integer')
})

// For POST: full schema with validation for endTime > startTime
export const productSchema = baseProductSchema.refine(
  data => data.endTime > data.startTime,
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
)

// For PUT: partial schema (no refine needed on partial updates)
export const productUpdateSchema = baseProductSchema.partial()
