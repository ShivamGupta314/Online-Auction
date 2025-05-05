# Authentication API Documentation

This document provides detailed information about the authentication endpoints available in the Online Auction Platform API.

## Table of Contents
- [Register](#register)
- [Login](#login)
- [User Profile](#user-profile)
- [Change Password](#change-password)

## Register

Creates a new user account.

**URL**: `/api/auth/register`

**Method**: `POST`

**Authentication required**: No

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "BIDDER"
}
```

| Field    | Type   | Required | Description                                    |
|----------|--------|----------|------------------------------------------------|
| username | string | Yes      | Unique username (3-20 characters)              |
| email    | string | Yes      | Valid email address                            |
| password | string | Yes      | Password (min 8 characters)                    |
| role     | string | No       | User role (ADMIN, SELLER, BIDDER). Default: BIDDER |

**Success Response**:

- **Code**: 201 CREATED
- **Content**: 
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "BIDDER"
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

- **Code**: 409 CONFLICT
- **Content**: 
```json
{
  "error": "Username or email already exists"
}
```

## Login

Authenticates a user and provides a JWT token.

**URL**: `/api/auth/login`

**Method**: `POST`

**Authentication required**: No

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field    | Type   | Required | Description       |
|----------|--------|----------|-------------------|
| email    | string | Yes      | Email address     |
| password | string | Yes      | User's password   |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "BIDDER"
  }
}
```

**Error Responses**:

- **Code**: 401 UNAUTHORIZED
- **Content**: 
```json
{
  "error": "Invalid credentials"
}
```

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "User not found"
}
```

## User Profile

Retrieves the authenticated user's profile information.

**URL**: `/api/users/profile`

**Method**: `GET`

**Authentication required**: Yes (JWT Token)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "BIDDER",
  "createdAt": "2023-01-01T12:00:00.000Z"
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

## Change Password

Allows an authenticated user to change their password.

**URL**: `/api/users/change-password`

**Method**: `POST`

**Authentication required**: Yes (JWT Token)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "currentPassword": "securePassword123",
  "newPassword": "evenMoreSecure456"
}
```

| Field           | Type   | Required | Description              |
|-----------------|--------|----------|--------------------------|
| currentPassword | string | Yes      | Current user password    |
| newPassword     | string | Yes      | New password (min 8 chars)|

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses**:

- **Code**: 401 UNAUTHORIZED
- **Content**: 
```json
{
  "error": "Current password is incorrect"
}
```

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "New password must be at least 8 characters long"
}
```

## Authentication Flow

1. User registers via `/api/auth/register`
2. User receives JWT token via `/api/auth/login`
3. Token is included in all subsequent requests that require authentication
4. Token must be sent in the Authorization header as a Bearer token

## Token Format

The JWT token contains the following payload:
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "BIDDER",
  "iat": 1633097578,
  "exp": 1633703978
}
```

- `iat`: Issued at timestamp
- `exp`: Expiry timestamp (default: 7 days after issuance)

## Security Considerations

- Passwords are hashed using bcrypt before storage
- JWT secrets are stored in environment variables
- Tokens expire after 7 days (configurable via JWT_EXPIRES_IN environment variable)
- Failed login attempts are logged 