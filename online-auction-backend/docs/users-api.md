# Users API Documentation

This document provides detailed information about the user-related endpoints available in the Online Auction Platform API.

## Table of Contents
- [Get User Profile](#get-user-profile)
- [Update User Profile](#update-user-profile)
- [Change Password](#change-password)
- [Get User's Products](#get-users-products)
- [Get User's Bids](#get-users-bids)
- [Get User Activity](#get-user-activity)

## Get User Profile

Retrieves the profile information for the authenticated user.

**URL**: `/api/users/profile`

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
{
  "id": 10,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "BIDDER",
  "createdAt": "2023-01-05T14:30:22.000Z",
  "updatedAt": "2023-01-20T09:15:44.000Z",
  "stats": {
    "productsListed": 0,
    "activeBids": 5,
    "wonAuctions": 2
  }
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

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "User not found"
}
```

## Update User Profile

Updates the profile information for the authenticated user.

**URL**: `/api/users/profile`

**Method**: `PUT`

**Authentication required**: Yes

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "username": "johndoe_updated",
  "email": "john_new@example.com"
}
```

| Field      | Type   | Required | Description                                |
|------------|--------|----------|--------------------------------------------|
| username   | string | No       | New username (3-20 characters)             |
| email      | string | No       | New email address                          |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 10,
  "username": "johndoe_updated",
  "email": "john_new@example.com",
  "role": "BIDDER",
  "message": "Profile updated successfully"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Validation failed",
  "details": [
    "Username must be between 3 and 20 characters",
    "Email must be valid"
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

- **Code**: 409 CONFLICT
- **Content**: 
```json
{
  "error": "Username or email already exists"
}
```

## Change Password

Allows an authenticated user to change their password.

**URL**: `/api/users/change-password`

**Method**: `POST`

**Authentication required**: Yes

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

| Field           | Type   | Required | Description                         |
|-----------------|--------|----------|-------------------------------------|
| currentPassword | string | Yes      | User's current password             |
| newPassword     | string | Yes      | New password (minimum 8 characters) |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Validation failed",
  "details": [
    "New password must be at least 8 characters long"
  ]
}
```

- **Code**: 401 UNAUTHORIZED
- **Content**: 
```json
{
  "error": "Current password is incorrect"
}
```

## Get User's Products

Retrieves a list of products created by the authenticated user.

**URL**: `/api/users/products`

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
| status    | string  | No       | Filter by status (active, expired, all)           |
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
      "hasAnyBids": true,
      "highestBid": 250.00,
      "bidsCount": 3
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

## Get User's Bids

Retrieves a list of bids placed by the authenticated user.

**URL**: `/api/users/bids`

**Method**: `GET`

**Authentication required**: Yes

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of bids per page (default: 10)             |
| status    | string  | No       | Filter by status (winning, outbid, all)           |
| sortBy    | string  | No       | Field to sort by (default: "createdAt")           |
| order     | string  | No       | Sort order ("asc" or "desc", default: "desc")     |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "bids": [
    {
      "id": 56,
      "price": 150.00,
      "createdAt": "2023-01-12T09:30:45.000Z",
      "productId": 23,
      "product": {
        "id": 23,
        "name": "Vintage Camera",
        "photoUrl": "https://example.com/camera.jpg",
        "endTime": "2023-01-25T00:00:00.000Z",
        "sellerId": 5
      },
      "isWinning": true,
      "isExpired": false
    },
    // More bids...
  ],
  "total": 8,
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

## Get User Activity

Retrieves a summary of the authenticated user's activity on the platform.

**URL**: `/api/users/activity`

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
{
  "productsListed": 5,
  "productsActive": 2,
  "productsSold": 3,
  "totalBidsPlaced": 12,
  "activeBids": 4,
  "wonAuctions": 2,
  "recentActivity": [
    {
      "type": "BID_PLACED",
      "timestamp": "2023-01-18T14:30:22.000Z",
      "details": {
        "productId": 34,
        "productName": "Vintage Record Player",
        "price": 120.00
      }
    },
    {
      "type": "PRODUCT_LISTED",
      "timestamp": "2023-01-15T10:45:30.000Z",
      "details": {
        "productId": 42,
        "productName": "Antique Vase"
      }
    },
    {
      "type": "AUCTION_WON",
      "timestamp": "2023-01-10T23:00:00.000Z",
      "details": {
        "productId": 28,
        "productName": "Art Deco Lamp",
        "price": 180.00
      }
    }
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

## User Roles and Permissions

The platform includes three user roles with different permissions:

1. **BIDDER**
   - Can place bids on products
   - Can view their own bids and activity
   - Cannot list products

2. **SELLER**
   - Has all BIDDER permissions
   - Can list, update, and delete their own products
   - Can view bid summaries for their products

3. **ADMIN**
   - Has all SELLER permissions
   - Can manage categories
   - Can manage all users and their roles
   - Can view and manage all products

## Security Considerations

- All user profile modifications require authentication
- Passwords are securely hashed and never returned in responses
- Email address changes may require verification in future versions
- Role-based access control ensures users can only perform authorized actions 