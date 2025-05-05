# Product API Documentation

This document provides detailed information about the product-related endpoints available in the Online Auction Platform API.

## Table of Contents
- [Get All Products](#get-all-products)
- [Get Product by ID](#get-product-by-id)
- [Get Product Detail with Bids](#get-product-detail-with-bids)
- [Create Product](#create-product)
- [Update Product](#update-product)
- [Delete Product](#delete-product)
- [Get Products by Category](#get-products-by-category)
- [Get Products by Seller](#get-products-by-seller)

## Get All Products

Retrieves a paginated list of all products.

**URL**: `/api/products`

**Method**: `GET`

**Authentication required**: No

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of products per page (default: 10)         |
| sortBy    | string  | No       | Field to sort by (default: "createdAt")           |
| order     | string  | No       | Sort order ("asc" or "desc", default: "desc")     |
| active    | boolean | No       | Filter by active auctions only (default: false)   |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "products": [
    {
      "id": 1,
      "name": "Vintage Watch",
      "description": "Rare collectible watch from 1950s",
      "photoUrl": "https://example.com/watch.jpg",
      "minBidPrice": 100.00,
      "startTime": "2023-01-01T00:00:00.000Z",
      "endTime": "2023-01-15T00:00:00.000Z",
      "sellerId": 5,
      "categoryId": 3,
      "createdAt": "2022-12-25T10:30:00.000Z",
      "isExpired": false,
      "timeLeft": 1209600000,
      "timeLeftFormatted": "14 days",
      "seller": {
        "username": "vintagecollector"
      },
      "category": {
        "name": "Watches"
      }
    },
    // More products...
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "pages": 15
}
```

**Error Responses**:

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "error": "Failed to fetch products"
}
```

## Get Product by ID

Retrieves a specific product by its ID.

**URL**: `/api/products/:id`

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
  "id": 1,
  "name": "Vintage Watch",
  "description": "Rare collectible watch from 1950s",
  "photoUrl": "https://example.com/watch.jpg",
  "minBidPrice": 100.00,
  "startTime": "2023-01-01T00:00:00.000Z",
  "endTime": "2023-01-15T00:00:00.000Z",
  "sellerId": 5,
  "categoryId": 3,
  "createdAt": "2022-12-25T10:30:00.000Z",
  "seller": {
    "username": "vintagecollector"
  },
  "category": {
    "name": "Watches"
  }
}
```

**Error Responses**:

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Product not found"
}
```

## Get Product Detail with Bids

Retrieves detailed information about a product, including its bids and auction status.

**URL**: `/api/products/:id/detail`

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
  "product": {
    "id": 1,
    "name": "Vintage Watch",
    "description": "Rare collectible watch from 1950s",
    "photoUrl": "https://example.com/watch.jpg",
    "minBidPrice": 100.00,
    "startTime": "2023-01-01T00:00:00.000Z",
    "endTime": "2023-01-15T00:00:00.000Z",
    "sellerId": 5,
    "categoryId": 3,
    "createdAt": "2022-12-25T10:30:00.000Z",
    "seller": {
      "username": "vintagecollector"
    },
    "category": {
      "name": "Watches"
    }
  },
  "highestBid": 150.00,
  "latestBidder": "watchfan42",
  "isExpired": false,
  "timeLeft": 1209600000,
  "timeLeftFormatted": "14 days"
}
```

**Error Responses**:

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Product not found"
}
```

## Create Product

Creates a new product listing.

**URL**: `/api/products`

**Method**: `POST`

**Authentication required**: Yes (SELLER or ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "name": "Antique Vase",
  "description": "Beautiful ceramic vase from the 19th century",
  "photoUrl": "https://example.com/vase.jpg",
  "minBidPrice": 200.00,
  "startTime": "2023-01-15T00:00:00.000Z",
  "endTime": "2023-01-30T00:00:00.000Z",
  "categoryId": 4
}
```

| Field        | Type      | Required | Description                                  |
|--------------|-----------|----------|----------------------------------------------|
| name         | string    | Yes      | Product name (3-100 characters)              |
| description  | string    | Yes      | Product description                          |
| photoUrl     | string    | Yes      | URL to product image                         |
| minBidPrice  | number    | Yes      | Minimum starting bid price                   |
| startTime    | string    | Yes      | ISO date string for auction start            |
| endTime      | string    | Yes      | ISO date string for auction end              |
| categoryId   | integer   | Yes      | ID of the product category                   |

**Success Response**:

- **Code**: 201 CREATED
- **Content**: 
```json
{
  "id": 42,
  "name": "Antique Vase",
  "description": "Beautiful ceramic vase from the 19th century",
  "photoUrl": "https://example.com/vase.jpg",
  "minBidPrice": 200.00,
  "startTime": "2023-01-15T00:00:00.000Z",
  "endTime": "2023-01-30T00:00:00.000Z",
  "sellerId": 5,
  "categoryId": 4,
  "createdAt": "2023-01-10T14:22:35.000Z"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Validation failed",
  "details": [
    "name must be between 3 and 100 characters",
    "minBidPrice must be a positive number",
    "endTime must be after startTime"
  ]
}
```

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
  "error": "Forbidden - Seller role required"
}
```

## Update Product

Updates an existing product listing.

**URL**: `/api/products/:id`

**Method**: `PUT`

**Authentication required**: Yes (Product seller or ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Product ID      |

**Request Body**:
```json
{
  "name": "Updated Antique Vase",
  "description": "Updated description with more details",
  "photoUrl": "https://example.com/updated-vase.jpg",
  "minBidPrice": 250.00,
  "endTime": "2023-02-05T00:00:00.000Z"
}
```

| Field        | Type      | Required | Description                                  |
|--------------|-----------|----------|----------------------------------------------|
| name         | string    | No       | Product name (3-100 characters)              |
| description  | string    | No       | Product description                          |
| photoUrl     | string    | No       | URL to product image                         |
| minBidPrice  | number    | No       | Minimum starting bid price                   |
| endTime      | string    | No       | ISO date string for auction end              |
| categoryId   | integer   | No       | ID of the product category                   |

**Notes**:
- Only provided fields will be updated
- Cannot update if auction has started and has bids
- Cannot update `startTime` after auction has started

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 42,
  "name": "Updated Antique Vase",
  "description": "Updated description with more details",
  "photoUrl": "https://example.com/updated-vase.jpg",
  "minBidPrice": 250.00,
  "startTime": "2023-01-15T00:00:00.000Z",
  "endTime": "2023-02-05T00:00:00.000Z",
  "sellerId": 5,
  "categoryId": 4,
  "createdAt": "2023-01-10T14:22:35.000Z",
  "updatedAt": "2023-01-11T09:15:22.000Z"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Cannot update product with active bids"
}
```

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
  "error": "Forbidden - You can only update your own products"
}
```

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Product not found"
}
```

## Delete Product

Deletes an existing product listing.

**URL**: `/api/products/:id`

**Method**: `DELETE`

**Authentication required**: Yes (Product seller or ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Product ID      |

**Notes**:
- Cannot delete a product with active bids
- Admins can delete any product
- Sellers can only delete their own products

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "message": "Product deleted successfully"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Cannot delete product with active bids"
}
```

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
  "error": "Forbidden - You can only delete your own products"
}
```

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Product not found"
}
```

## Get Products by Category

Retrieves a paginated list of products in a specific category.

**URL**: `/api/products/category/:categoryId`

**Method**: `GET`

**Authentication required**: No

**URL Parameters**:

| Parameter   | Type    | Required | Description      |
|-------------|---------|----------|------------------|
| categoryId  | integer | Yes      | Category ID      |

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of products per page (default: 10)         |
| sortBy    | string  | No       | Field to sort by (default: "createdAt")           |
| order     | string  | No       | Sort order ("asc" or "desc", default: "desc")     |
| active    | boolean | No       | Filter by active auctions only (default: false)   |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "products": [
    {
      "id": 1,
      "name": "Vintage Watch",
      "description": "Rare collectible watch from 1950s",
      "photoUrl": "https://example.com/watch.jpg",
      "minBidPrice": 100.00,
      "startTime": "2023-01-01T00:00:00.000Z",
      "endTime": "2023-01-15T00:00:00.000Z",
      "sellerId": 5,
      "categoryId": 3,
      "createdAt": "2022-12-25T10:30:00.000Z",
      "isExpired": false,
      "timeLeft": 1209600000,
      "timeLeftFormatted": "14 days",
      "seller": {
        "username": "vintagecollector"
      }
    },
    // More products...
  ],
  "category": {
    "id": 3,
    "name": "Watches"
  },
  "total": 45,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

**Error Responses**:

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Category not found"
}
```

## Get Products by Seller

Retrieves a paginated list of products from a specific seller.

**URL**: `/api/products/seller/:sellerId`

**Method**: `GET`

**Authentication required**: No

**URL Parameters**:

| Parameter | Type    | Required | Description      |
|-----------|---------|----------|------------------|
| sellerId  | integer | Yes      | Seller user ID   |

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of products per page (default: 10)         |
| sortBy    | string  | No       | Field to sort by (default: "createdAt")           |
| order     | string  | No       | Sort order ("asc" or "desc", default: "desc")     |
| active    | boolean | No       | Filter by active auctions only (default: false)   |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "products": [
    {
      "id": 1,
      "name": "Vintage Watch",
      "description": "Rare collectible watch from 1950s",
      "photoUrl": "https://example.com/watch.jpg",
      "minBidPrice": 100.00,
      "startTime": "2023-01-01T00:00:00.000Z",
      "endTime": "2023-01-15T00:00:00.000Z",
      "sellerId": 5,
      "categoryId": 3,
      "createdAt": "2022-12-25T10:30:00.000Z",
      "isExpired": false,
      "timeLeft": 1209600000,
      "timeLeftFormatted": "14 days",
      "category": {
        "name": "Watches"
      }
    },
    // More products...
  ],
  "seller": {
    "id": 5,
    "username": "vintagecollector"
  },
  "total": 32,
  "page": 1,
  "limit": 10,
  "pages": 4
}
```

**Error Responses**:

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Seller not found"
}
``` 