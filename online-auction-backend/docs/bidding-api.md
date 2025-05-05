# Bidding API Documentation

This document provides detailed information about the bidding-related endpoints available in the Online Auction Platform API.

## Table of Contents
- [Place Bid](#place-bid)
- [Get Bids for Product](#get-bids-for-product)
- [Get Highest Bid](#get-highest-bid)
- [Get Bid Summary](#get-bid-summary)
- [Get Public Bid Highlight](#get-public-bid-highlight)
- [Get My Bids](#get-my-bids)

## Place Bid

Places a new bid on a product.

**URL**: `/api/bids`

**Method**: `POST`

**Authentication required**: Yes (BIDDER or ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "productId": 1,
  "price": 150.00
}
```

| Field       | Type    | Required | Description                         |
|-------------|---------|----------|-------------------------------------|
| productId   | integer | Yes      | ID of the product to bid on         |
| price       | number  | Yes      | Bid amount                          |

**Validation Rules**:
- Price must be greater than the current highest bid amount + 1
- If no previous bids, price must be at least the minimum bid price of the product
- Product auction must be active (started but not expired)
- Users cannot bid on their own products

**Success Response**:

- **Code**: 201 CREATED
- **Content**: 
```json
{
  "id": 42,
  "price": 150.00,
  "productId": 1,
  "bidderId": 10,
  "createdAt": "2023-01-12T09:30:45.000Z"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Bid must be at least 151.00"
}
```

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Auction is not active"
}
```

- **Code**: 403 FORBIDDEN
- **Content**: 
```json
{
  "error": "You cannot bid on your own product"
}
```

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Product not found"
}
```

## Get Bids for Product

Retrieves a paginated list of bids for a specific product.

**URL**: `/api/bids/product/:id`

**Method**: `GET`

**Authentication required**: No

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Product ID      |

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of bids per page (default: 10)             |
| sortBy    | string  | No       | Field to sort by ("price" or "createdAt", default: "price") |
| order     | string  | No       | Sort order ("asc" or "desc", default: "desc")     |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "bids": [
    {
      "id": 42,
      "price": 180.00,
      "createdAt": "2023-01-14T10:45:30.000Z",
      "productId": 1,
      "bidderId": 11,
      "bidder": {
        "id": 11,
        "username": "artcollector",
        "email": "art@example.com"
      }
    },
    {
      "id": 39,
      "price": 175.00,
      "createdAt": "2023-01-13T16:20:12.000Z",
      "productId": 1,
      "bidderId": 10,
      "bidder": {
        "id": 10,
        "username": "watchfan42",
        "email": "watch@example.com"
      }
    },
    // More bids...
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "pages": 3,
  "sortBy": "price",
  "order": "desc"
}
```

**Error Responses**:

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "message": "Failed to fetch bids"
}
```

## Get Highest Bid

Retrieves the highest bid for a specific product.

**URL**: `/api/products/:id/highest-bid`

**Method**: `GET`

**Authentication required**: No

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Product ID      |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 42,
  "price": 180.00,
  "createdAt": "2023-01-14T10:45:30.000Z",
  "productId": 1,
  "bidderId": 11,
  "bidder": {
    "id": 11,
    "username": "artcollector",
    "email": "art@example.com"
  }
}
```

**Error Responses**:

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "message": "No bids found for this product"
}
```

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "message": "Failed to fetch highest bid"
}
```

## Get Bid Summary

Retrieves a summary of bids for a seller's product.

**URL**: `/api/bids/product/:id/summary`

**Method**: `GET`

**Authentication required**: Yes (Seller of the product only)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Product ID      |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "highestBid": 180.00,
  "totalBids": 25,
  "averageBid": 142.50,
  "latestBidder": "artcollector"
}
```

**Error Responses**:

- **Code**: 403 FORBIDDEN
- **Content**: 
```json
{
  "message": "Forbidden: Not your product"
}
```

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "message": "Product not found"
}
```

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "message": "Failed to fetch bid summary"
}
```

## Get Public Bid Highlight

Retrieves a public highlight of the highest bid for a product.

**URL**: `/api/products/:id/highlight-bid`

**Method**: `GET`

**Authentication required**: No

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Product ID      |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "highestBid": 180.00,
  "latestBidder": "artcollector"
}
```

**Error Responses**:

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "message": "Failed to fetch public bid highlight"
}
```

## Get My Bids

Retrieves a list of the authenticated user's bids, enriched with winning status.

**URL**: `/api/bids/mine`

**Method**: `GET`

**Authentication required**: Yes

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
[
  {
    "id": 39,
    "price": 175.00,
    "createdAt": "2023-01-13T16:20:12.000Z",
    "productId": 1,
    "bidderId": 10,
    "product": {
      "id": 1,
      "name": "Vintage Watch",
      "description": "Rare collectible watch from 1950s",
      "photoUrl": "https://example.com/watch.jpg",
      "minBidPrice": 100.00,
      "startTime": "2023-01-01T00:00:00.000Z",
      "endTime": "2023-01-15T00:00:00.000Z",
      "sellerId": 5,
      "categoryId": 3
    },
    "isWinning": false,
    "isExpired": false
  },
  {
    "id": 28,
    "price": 220.00,
    "createdAt": "2023-01-10T14:36:52.000Z",
    "productId": 2,
    "bidderId": 10,
    "product": {
      "id": 2,
      "name": "Antique Vase",
      "description": "Beautiful ceramic vase from the 19th century",
      "photoUrl": "https://example.com/vase.jpg",
      "minBidPrice": 200.00,
      "startTime": "2023-01-05T00:00:00.000Z",
      "endTime": "2023-01-20T00:00:00.000Z",
      "sellerId": 6,
      "categoryId": 4
    },
    "isWinning": true,
    "isExpired": false
  },
  // More bids...
]
```

**Error Responses**:

- **Code**: 401 UNAUTHORIZED
- **Content**: 
```json
{
  "error": "Unauthorized - Missing or invalid token"
}
```

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "message": "Failed to fetch your bids"
}
```

## Bidding Workflow

1. Client retrieves product details including current highest bid and time left via `/api/products/:id/detail` endpoint.
2. User places a bid via the `/api/bids` endpoint.
3. If successful, the system:
   - Notifies the seller via email about the new bid
   - Notifies any previous highest bidder that they've been outbid
4. When an auction ends:
   - The winner is notified
   - The seller is notified about the auction result

## Bid Validation Rules

The system enforces the following validation rules:

1. **Minimum Bid Amount**:
   - First bid must be at least the minimum bid price of the product
   - Subsequent bids must be at least $1 more than the current highest bid

2. **Time Restrictions**:
   - Bidding is only allowed during the active auction period (between startTime and endTime)
   - Bids cannot be placed before the auction starts
   - Bids cannot be placed after the auction ends

3. **User Restrictions**:
   - Users cannot bid on their own products
   - Users must have a BIDDER or ADMIN role to place bids

4. **Auction Status**:
   - The auction must be active (not expired)
   - The product must exist and be available for bidding 