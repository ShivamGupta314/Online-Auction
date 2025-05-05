import request from 'supertest'
import app from '../src/app.js'
import { createUserWithRole } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'

describe('Protected Routes Role Guard', () => {
  it('should deny access to seller dashboard for BIDDER', async () => {
    const bidder = await createUserWithRole('BIDDER')
    const token = getToken(bidder)

    const res = await request(app)
      .get('/api/seller/summary')
      .set('Authorization', token)

    expect(res.statusCode).toBe(403)
  })
})
