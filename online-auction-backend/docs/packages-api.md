# Packages API Documentation

This document provides detailed information about the package-related endpoints available in the Online Auction Platform API.

## Table of Contents
- [Get All Packages](#get-all-packages)
- [Get Package by ID](#get-package-by-id)
- [Purchase Package](#purchase-package)
- [Get User Packages](#get-user-packages)
- [Check Package Status](#check-package-status)

## Get All Packages

Retrieves a list of all available seller packages.

**URL**: `/api/packages`

**Method**: `GET`

**Authentication required**: No

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
[
  {
    "id": 1,
    "name": "Basic Seller",
    "description": "Start selling with basic features",
    "price": 9.99,
    "duration": 30,
    "listingLimit": 10,
    "features": [
      "List up to 10 products",
      "Standard product visibility",
      "Basic analytics"
    ],
    "isActive": true,
    "createdAt": "2022-12-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Professional Seller",
    "description": "Enhanced features for serious sellers",
    "price": 24.99,
    "duration": 30,
    "listingLimit": 30,
    "features": [
      "List up to 30 products",
      "Enhanced product visibility",
      "Detailed analytics",
      "Featured listings"
    ],
    "isActive": true,
    "createdAt": "2022-12-01T10:05:00.000Z"
  },
  {
    "id": 3,
    "name": "Premium Seller",
    "description": "Full access to all selling features",
    "price": 49.99,
    "duration": 30,
    "listingLimit": 100,
    "features": [
      "Unlimited product listings",
      "Maximum product visibility",
      "Advanced analytics dashboard",
      "Featured listings",
      "Priority customer support"
    ],
    "isActive": true,
    "createdAt": "2022-12-01T10:10:00.000Z"
  }
]
```

**Error Responses**:

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "error": "Failed to fetch packages"
}
```

## Get Package by ID

Retrieves a specific package by its ID.

**URL**: `/api/packages/:id`

**Method**: `GET`

**Authentication required**: No

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Package ID      |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 2,
  "name": "Professional Seller",
  "description": "Enhanced features for serious sellers",
  "price": 24.99,
  "duration": 30,
  "listingLimit": 30,
  "features": [
    "List up to 30 products",
    "Enhanced product visibility",
    "Detailed analytics",
    "Featured listings"
  ],
  "isActive": true,
  "createdAt": "2022-12-01T10:05:00.000Z"
}
```

**Error Responses**:

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Package not found"
}
```

## Purchase Package

Purchases a package for the authenticated user.

**URL**: `/api/packages/:id/purchase`

**Method**: `POST`

**Authentication required**: Yes

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Package ID      |

**Request Body**:
```json
{
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }
}
```

| Field          | Type   | Required | Description                                |
|----------------|--------|----------|--------------------------------------------|
| paymentMethod  | string | Yes      | Payment method (credit_card, paypal)       |
| paymentDetails | object | Yes      | Payment details specific to payment method |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 123,
  "userId": 10,
  "packageId": 2,
  "packageName": "Professional Seller",
  "startDate": "2023-01-20T10:15:30.000Z",
  "endDate": "2023-02-19T10:15:30.000Z",
  "isActive": true,
  "transactionId": "tr_123456789",
  "message": "Package purchased successfully"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Payment validation failed",
  "details": [
    "Invalid card number",
    "CVV is required"
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

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Package not found"
}
```

- **Code**: 409 CONFLICT
- **Content**: 
```json
{
  "error": "You already have an active package of this type"
}
```

- **Code**: 422 UNPROCESSABLE ENTITY
- **Content**: 
```json
{
  "error": "Payment processing failed",
  "message": "Your card was declined"
}
```

## Get User Packages

Retrieves the packages purchased by the authenticated user.

**URL**: `/api/packages/my-packages`

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
    "id": 123,
    "packageId": 2,
    "packageName": "Professional Seller",
    "description": "Enhanced features for serious sellers",
    "startDate": "2023-01-20T10:15:30.000Z",
    "endDate": "2023-02-19T10:15:30.000Z",
    "isActive": true,
    "listingLimit": 30,
    "listingsUsed": 12,
    "features": [
      "List up to 30 products",
      "Enhanced product visibility",
      "Detailed analytics",
      "Featured listings"
    ],
    "transactionId": "tr_123456789"
  },
  {
    "id": 95,
    "packageId": 1,
    "packageName": "Basic Seller",
    "description": "Start selling with basic features",
    "startDate": "2022-12-15T08:30:00.000Z",
    "endDate": "2023-01-14T08:30:00.000Z",
    "isActive": false,
    "listingLimit": 10,
    "listingsUsed": 8,
    "features": [
      "List up to 10 products",
      "Standard product visibility",
      "Basic analytics"
    ],
    "transactionId": "tr_987654321"
  }
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

## Check Package Status

Checks if the authenticated user has an active package and returns its status.

**URL**: `/api/packages/status`

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
  "hasActivePackage": true,
  "packageDetails": {
    "id": 123,
    "packageId": 2,
    "packageName": "Professional Seller",
    "startDate": "2023-01-20T10:15:30.000Z",
    "endDate": "2023-02-19T10:15:30.000Z",
    "daysLeft": 25,
    "listingLimit": 30,
    "listingsUsed": 12,
    "listingsRemaining": 18
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

## Package Types

The platform offers several package types for sellers:

1. **Basic Seller**
   - Affordable entry-level package
   - Limited number of product listings
   - Basic analytics and features
   - Ideal for occasional sellers

2. **Professional Seller**
   - Moderate pricing for regular sellers
   - Increased listing capacity
   - Enhanced visibility and analytics
   - Suitable for regular sellers with moderate inventory

3. **Premium Seller**
   - Full-featured package for serious sellers
   - Maximum or unlimited listings
   - Advanced analytics and visibility options
   - Priority support and exclusive features
   - Designed for high-volume sellers

## Package Limitations

1. **Listing Limits**
   - Each package type has a maximum number of concurrent product listings
   - Attempting to exceed this limit will result in an error
   - Listing limits reset when purchasing a new package

2. **Duration**
   - Packages are active for a fixed period (typically 30 days)
   - Package benefits expire after the end date
   - Users can renew or upgrade before expiration

3. **Features**
   - Feature availability varies by package type
   - Some advanced features are only available in higher-tier packages

## Payment Processing

The platform integrates with payment processors to handle package purchases:

1. Payment information is securely processed and not stored on the server
2. Transaction IDs are generated for each successful purchase
3. Receipt emails are sent to users after successful transactions

## Best Practices

1. **For Users**
   - Choose a package that matches your selling volume
   - Renew packages before they expire to maintain seller privileges
   - Monitor listing usage to avoid hitting limits

2. **For Developers**
   - Always validate payment information before processing
   - Handle payment failures gracefully with clear error messages
   - Implement secure retry mechanisms for failed transactions 