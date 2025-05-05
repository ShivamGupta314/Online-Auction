# Seller API Documentation

This document provides detailed information about the seller-specific endpoints available in the Online Auction Platform API.

## Table of Contents
- [Get Seller Dashboard](#get-seller-dashboard)
- [Get Seller Products](#get-seller-products)
- [Get Seller Statistics](#get-seller-statistics)
- [Get Product Bids](#get-product-bids)
- [Manage Products](#manage-products)

## Get Seller Dashboard

Retrieves an overview of the seller's dashboard with key metrics.

**URL**: `/api/seller/dashboard`

**Method**: `GET`

**Authentication required**: Yes (SELLER or ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "activeProducts": 5,
  "productsWithBids": 3,
  "totalBids": 12,
  "totalEarnings": 2500.00,
  "recentActivity": [
    {
      "type": "NEW_BID",
      "timestamp": "2023-01-18T14:30:22.000Z",
      "details": {
        "productId": 42,
        "productName": "Antique Vase",
        "bidAmount": 250.00,
        "bidderUsername": "collectorfan"
      }
    },
    {
      "type": "AUCTION_ENDED",
      "timestamp": "2023-01-15T23:00:00.000Z",
      "details": {
        "productId": 36,
        "productName": "Vintage Camera",
        "finalPrice": 180.00,
        "winnerUsername": "photolover"
      }
    }
    // More activity items...
  ]
}
```

**Error Responses**:

- **Code**: 401 UNAUTHORIZED
- **Content**: 
```json
{
  "error": "Unauthorized - Missing or invalid token"
}
```

- **Code**: 403 FORBIDDEN
- **Content**: 
```json
{
  "error": "Forbidden - Seller access required"
}
```

## Get Seller Products

Retrieves a paginated list of products created by the seller with detailed statistics.

**URL**: `/api/seller/products`

**Method**: `GET`

**Authentication required**: Yes (SELLER or ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of products per page (default: 10)         |
| status    | string  | No       | Filter by status (active, ended, all)             |
| sortBy    | string  | No       | Field to sort by (default: "createdAt")           |
| order     | string  | No       | Sort order ("asc" or "desc", default: "desc")     |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "products": [
    {
      "id": 42,
      "name": "Antique Vase",
      "description": "Beautiful ceramic vase from the 19th century",
      "photoUrl": "https://example.com/vase.jpg",
      "minBidPrice": 200.00,
      "startTime": "2023-01-15T00:00:00.000Z",
      "endTime": "2023-01-30T00:00:00.000Z",
      "categoryId": 4,
      "createdAt": "2023-01-10T14:22:35.000Z",
      "isExpired": false,
      "bidStats": {
        "highestBid": 250.00,
        "bidsCount": 3,
        "lastBidTime": "2023-01-18T14:30:22.000Z"
      }
    },
    // More products...
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

**Error Responses**:

- **Code**: 401 UNAUTHORIZED
- **Content**: 
```json
{
  "error": "Unauthorized - Missing or invalid token"
}
```

- **Code**: 403 FORBIDDEN
- **Content**: 
```json
{
  "error": "Forbidden - Seller access required"
}
```

## Get Seller Statistics

Retrieves detailed statistics for the seller's account.

**URL**: `/api/seller/statistics`

**Method**: `GET`

**Authentication required**: Yes (SELLER or ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "totalProducts": 10,
  "activeProducts": 5,
  "completedAuctions": 5,
  "successfulAuctions": 4,
  "totalEarnings": 2500.00,
  "averageBidsPerProduct": 4.5,
  "topCategories": [
    {
      "categoryId": 3,
      "categoryName": "Watches",
      "productsCount": 4
    },
    {
      "categoryId": 4,
      "categoryName": "Art",
      "productsCount": 3
    }
    // More categories...
  ],
  "monthlyStats": [
    {
      "month": "January 2023",
      "productsListed": 3,
      "auctionsCompleted": 2,
      "earnings": 1200.00
    },
    {
      "month": "December 2022",
      "productsListed": 5,
      "auctionsCompleted": 3,
      "earnings": 1300.00
    }
    // More months...
  ]
}
```

**Error Responses**:

- **Code**: 401 UNAUTHORIZED
- **Content**: 
```json
{
  "error": "Unauthorized - Missing or invalid token"
}
```

- **Code**: 403 FORBIDDEN
- **Content**: 
```json
{
  "error": "Forbidden - Seller access required"
}
```

## Get Product Bids

Retrieves detailed information about bids for a specific product owned by the seller.

**URL**: `/api/seller/products/:id/bids`

**Method**: `GET`

**Authentication required**: Yes (SELLER or ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Product ID      |

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of bids per page (default: 10)             |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "product": {
    "id": 42,
    "name": "Antique Vase",
    "minBidPrice": 200.00,
    "startTime": "2023-01-15T00:00:00.000Z",
    "endTime": "2023-01-30T00:00:00.000Z",
    "isExpired": false
  },
  "bids": [
    {
      "id": 123,
      "price": 250.00,
      "createdAt": "2023-01-18T14:30:22.000Z",
      "bidder": {
        "id": 15,
        "username": "collectorfan"
      }
    },
    {
      "id": 120,
      "price": 230.00,
      "createdAt": "2023-01-17T16:45:10.000Z",
      "bidder": {
        "id": 22,
        "username": "antiquelover"
      }
    },
    {
      "id": 117,
      "price": 210.00,
      "createdAt": "2023-01-16T09:20:15.000Z",
      "bidder": {
        "id": 15,
        "username": "collectorfan"
      }
    }
    // More bids...
  ],
  "bidStats": {
    "totalBids": 3,
    "uniqueBidders": 2,
    "highestBid": 250.00,
    "lowestBid": 210.00,
    "averageBid": 230.00
  },
  "total": 3,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

**Error Responses**:

- **Code**: 401 UNAUTHORIZED
- **Content**: 
```json
{
  "error": "Unauthorized - Missing or invalid token"
}
```

- **Code**: 403 FORBIDDEN
- **Content**: 
```json
{
  "error": "Forbidden - You can only view bids for your own products"
}
```

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Product not found"
}
```

## Manage Products

Sellers can create, update, and delete products using the standard Product API documented in [Product API](./product-api.md). The following endpoints are particularly relevant to sellers:

1. **Create Product**: `POST /api/products` 
2. **Update Product**: `PUT /api/products/:id`
3. **Delete Product**: `DELETE /api/products/:id`

Please refer to the Product API documentation for detailed information about these endpoints.

## Best Practices for Sellers

1. **Product Listings**
   - Include clear, high-quality images
   - Provide detailed descriptions
   - Set reasonable minimum bid prices
   - Choose appropriate auction durations

2. **Bid Monitoring**
   - Regularly check bids on active products
   - Respond to bidder questions promptly
   - Consider updating product descriptions if bidders seem confused

3. **Auction Completion**
   - Confirm shipping details with winning bidders
   - Process deliveries promptly
   - Maintain good communication with buyers

4. **Account Management**
   - Track performance statistics regularly
   - Identify popular product categories
   - Monitor seasonal trends in bidding behavior 