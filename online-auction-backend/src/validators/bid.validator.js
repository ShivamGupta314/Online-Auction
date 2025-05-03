import { z } from 'zod'

export const bidSchema = z.object({
  productId: z.coerce.number({
    required_error: 'Product ID is required',
    invalid_type_error: 'Product ID must be a number'
  }).int().positive({ message: 'Product ID must be a positive integer' }),

  price: z.coerce.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number'
  }).positive({ message: 'Price must be a positive number' })
})
