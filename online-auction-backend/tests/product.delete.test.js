import request from 'supertest'
import app from '../src/app.js'
import { createUserWithRole, createCategory, createProduct } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'
import { cleanTestDb } from './utils/cleanUpDb.js'
import { prisma } from '../src/prismaClient.js'

let seller, otherSeller, category, product, token, otherToken

beforeAll(async () => {
  try {
    await cleanTestDb()

    // Create resources with unique names
    category = await createCategory('DeleteCat-' + Date.now())
    seller = await createUserWithRole('SELLER')
    otherSeller = await createUserWithRole('SELLER')

    // Create a test product
    product = await createProduct({ sellerId: seller.id, categoryId: category.id })

    // Generate tokens
    token = getToken(seller)
    otherToken = getToken(otherSeller)
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
})

// Clean up after all tests
afterAll(async () => {
  try {
    await cleanTestDb();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
})

describe('DELETE /api/products/:id', () => {
  it('should delete a product if owned by seller', async () => {
    // Create a product specifically for deletion
    const productToDelete = await createProduct({ 
      sellerId: seller.id, 
      categoryId: category.id 
    });

    const res = await request(app)
      .delete(`/api/products/${productToDelete.id}`)
      .set('Authorization', token)

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('message', 'Product deleted successfully')

    // Verify product is actually deleted
    const deletedProduct = await prisma.product.findUnique({
      where: { id: productToDelete.id }
    })
    expect(deletedProduct).toBeNull()
  })

  it('should return 403 if seller does not own the product', async () => {
    const res = await request(app)
      .delete(`/api/products/${product.id}`)
      .set('Authorization', otherToken)

    expect(res.statusCode).toBe(403)
    expect(res.body).toHaveProperty('error', 'You cannot delete this product')
  })

  it('should return 404 if product does not exist', async () => {
    const nonExistentId = 9999
    const res = await request(app)
      .delete(`/api/products/${nonExistentId}`)
      .set('Authorization', token)

    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('error', 'Product not found')
  })

  it('should return 400 if product has bids', async () => {
    // Create a new product
    const productWithBid = await createProduct({ 
      sellerId: seller.id, 
      categoryId: category.id 
    });

    // Add a bid to the product
    await prisma.bid.create({
      data: {
        productId: productWithBid.id,
        bidderId: otherSeller.id, // Using other seller as bidder
        price: 150
      }
    })

    const res = await request(app)
      .delete(`/api/products/${productWithBid.id}`)
      .set('Authorization', token)

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toContain('Cannot delete product with existing bids')
  })
}) 