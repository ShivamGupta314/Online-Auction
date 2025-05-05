# Admin Dashboard Documentation

This document provides detailed information about the admin dashboard endpoints available in the Online Auction Platform API.

## Table of Contents
- [Dashboard Overview](#dashboard-overview)
- [Get All Users](#get-all-users)
- [Update User Role](#update-user-role)
- [Get Problematic Products](#get-problematic-products)

## Dashboard Overview

Retrieves system-wide statistics for the admin dashboard.

**URL**: `/api/admin/dashboard`

**Method**: `GET`

**Authentication required**: Yes (ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "counts": {
    "users": 150,
    "products": 75,
    "bids": 320,
    "categories": 10
  },
  "usersByRole": {
    "ADMIN": 3,
    "SELLER": 42,
    "BIDDER": 105
  },
  "products": {
    "withBids": 62,
    "withoutBids": 13,
    "recentlyAdded": 15
  },
  "bids": {
    "recentBids": 45,
    "averageBidAmount": 142.50,
    "highestBid": 1200.00
  },
  "auctions": {
    "active": 30,
    "ending24h": 8,
    "completed": 45
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

- **Code**: 403 FORBIDDEN
- **Content**: 
```json
{
  "error": "Forbidden - Admin access required"
}
```

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "error": "Failed to retrieve dashboard data"
}
```

## Get All Users

Retrieves a paginated list of all users in the system.

**URL**: `/api/admin/users`

**Method**: `GET`

**Authentication required**: Yes (ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of users per page (default: 20)            |
| sortBy    | string  | No       | Field to sort by (default: "createdAt")           |
| order     | string  | No       | Sort order ("asc" or "desc", default: "desc")     |
| role      | string  | No       | Filter by role (ADMIN, SELLER, BIDDER)            |
| search    | string  | No       | Search term for username or email                 |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2022-12-01T10:00:00.000Z",
      "stats": {
        "productsCount": 0,
        "bidsCount": 0
      }
    },
    {
      "id": 2,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "SELLER",
      "createdAt": "2022-12-15T14:30:00.000Z",
      "stats": {
        "productsCount": 5,
        "bidsCount": 12
      }
    },
    // More users...
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8
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
  "error": "Forbidden - Admin access required"
}
```

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "error": "Failed to retrieve users"
}
```

## Update User Role

Updates the role of a specific user.

**URL**: `/api/admin/users/:id/role`

**Method**: `PUT`

**Authentication required**: Yes (ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | User ID         |

**Request Body**:
```json
{
  "role": "SELLER"
}
```

| Field | Type   | Required | Description                                 |
|-------|--------|----------|---------------------------------------------|
| role  | string | Yes      | New role (ADMIN, SELLER, or BIDDER)         |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 10,
  "username": "janedoe",
  "email": "jane@example.com",
  "role": "SELLER",
  "message": "User role updated successfully"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Role must be one of: ADMIN, SELLER, BIDDER"
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
  "error": "Forbidden - Admin access required"
}
```

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "User not found"
}
```

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "error": "Failed to update user role"
}
```

## Get Problematic Products

Retrieves a list of products that may require attention, such as expired auctions with no bids.

**URL**: `/api/admin/products/problematic`

**Method**: `GET`

**Authentication required**: Yes (ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**:

| Parameter | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| page      | integer | No       | Page number (default: 1)                          |
| limit     | integer | No       | Number of products per page (default: 10)         |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "products": [
    {
      "id": 15,
      "name": "Antique Desk",
      "description": "Beautiful oak desk from the early 20th century",
      "photoUrl": "https://example.com/desk.jpg",
      "minBidPrice": 300.00,
      "startTime": "2023-01-01T00:00:00.000Z",
      "endTime": "2023-01-15T00:00:00.000Z",
      "sellerId": 8,
      "categoryId": 5,
      "createdAt": "2022-12-28T16:45:20.000Z",
      "issue": "EXPIRED_NO_BIDS",
      "seller": {
        "username": "furniturecollector",
        "email": "furniture@example.com"
      }
    },
    {
      "id": 22,
      "name": "Vintage Camera",
      "description": "Classic film camera from the 1970s",
      "photoUrl": "https://example.com/camera.jpg",
      "minBidPrice": 250.00,
      "startTime": "2023-01-05T00:00:00.000Z",
      "endTime": "2023-01-20T00:00:00.000Z",
      "sellerId": 12,
      "categoryId": 8,
      "createdAt": "2023-01-04T09:12:33.000Z",
      "issue": "HIGH_MIN_PRICE",
      "seller": {
        "username": "photogear",
        "email": "photo@example.com"
      }
    },
    // More products...
  ],
  "total": 12,
  "page": 1,
  "limit": 10,
  "pages": 2
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
  "error": "Forbidden - Admin access required"
}
```

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "error": "Failed to retrieve problematic products"
}
```

## Admin-Only Actions

The admin dashboard provides several exclusive actions that can only be performed by users with the ADMIN role:

### User Management

- View all users in the system
- Update user roles (promote to SELLER/ADMIN or demote)
- Access user statistics and activity patterns

### System Monitoring

- View overall system statistics
- Track auction activity and bidding patterns
- Identify potential issues with listings or user behavior

### Content Oversight

- Identify problematic products that require attention
- Track products with no bids
- Monitor high-value or high-activity auctions

## Security Considerations

- All admin dashboard endpoints require authentication with a valid JWT token
- The user making the request must have the ADMIN role
- Sensitive user data (like password hashes) is never exposed through the API
- All actions are logged for audit purposes

## Usage Scenarios

### Promotion of Regular Users to Sellers

1. Admin navigates to the users list and finds the user to promote
2. Admin updates the user's role from BIDDER to SELLER
3. The user immediately gains the ability to list products for auction

### Monitoring System Health

1. Admin accesses the dashboard statistics
2. Reviews key metrics like user growth, auction activity, and bid patterns
3. Takes action based on trends or anomalies observed

### Addressing Problematic Listings

1. Admin reviews the list of problematic products
2. Identifies products with issues (e.g., expired with no bids, high minimum price)
3. Takes appropriate action (contacting sellers, adjusting listings, etc.) 