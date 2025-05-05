# API Reference Guide

This document provides a consolidated quick reference of all available API endpoints in the Online Auction Platform.

## Authentication

| Method | Endpoint                    | Description                         | Auth Required |
|--------|----------------------------|-------------------------------------|--------------|
| POST   | `/api/auth/register`       | Register a new user                 | No           |
| POST   | `/api/auth/login`          | Authenticate and get token          | No           |
| GET    | `/api/users/profile`       | Get current user profile            | Yes          |
| POST   | `/api/users/change-password` | Change user password              | Yes          |

## Users

| Method | Endpoint                    | Description                         | Auth Required |
|--------|----------------------------|-------------------------------------|--------------|
| GET    | `/api/users/profile`       | Get authenticated user's profile    | Yes          |
| PUT    | `/api/users/profile`       | Update user profile                 | Yes          |
| GET    | `/api/users/products`      | Get user's products                 | Yes (SELLER) |
| GET    | `/api/users/bids`          | Get user's bids                     | Yes          |
| GET    | `/api/users/activity`      | Get user activity summary           | Yes          |

## Products

| Method | Endpoint                           | Description                       | Auth Required |
|--------|-----------------------------------|-----------------------------------|--------------|
| GET    | `/api/products`                   | Get all products                  | No           |
| GET    | `/api/products/:id`               | Get product by ID                 | No           |
| GET    | `/api/products/:id/detail`        | Get product with bids             | No           |
| POST   | `/api/products`                   | Create product                    | Yes (SELLER) |
| PUT    | `/api/products/:id`               | Update product                    | Yes (SELLER) |
| DELETE | `/api/products/:id`               | Delete product                    | Yes (SELLER) |
| GET    | `/api/products/category/:categoryId` | Get products by category       | No           |
| GET    | `/api/products/seller/:sellerId`  | Get products by seller            | No           |
| GET    | `/api/products/:id/highest-bid`   | Get highest bid for product       | No           |
| GET    | `/api/products/:id/highlight-bid` | Get public bid highlight          | No           |

## Bidding

| Method | Endpoint                           | Description                     | Auth Required |
|--------|-----------------------------------|---------------------------------|--------------|
| POST   | `/api/bids`                       | Place a bid                     | Yes (BIDDER) |
| GET    | `/api/bids/product/:id`           | Get bids for a product          | No           |
| GET    | `/api/bids/product/:id/summary`   | Get bid summary for seller      | Yes (SELLER) |
| GET    | `/api/bids/mine`                  | Get user's bids                 | Yes          |

## Categories

| Method | Endpoint                       | Description                     | Auth Required |
|--------|-----------------------------|-----------------------------------|--------------|
| GET    | `/api/categories`           | Get all categories                | No           |
| GET    | `/api/categories/:id`       | Get category by ID                | No           |
| POST   | `/api/categories`           | Create category                   | Yes (ADMIN)  |
| PUT    | `/api/categories/:id`       | Update category                   | Yes (ADMIN)  |
| DELETE | `/api/categories/:id`       | Delete category                   | Yes (ADMIN)  |

## Seller

| Method | Endpoint                           | Description                     | Auth Required |
|--------|-----------------------------------|---------------------------------|--------------|
| GET    | `/api/seller/dashboard`           | Get seller dashboard overview   | Yes (SELLER) |
| GET    | `/api/seller/products`            | Get seller's products with stats| Yes (SELLER) |
| GET    | `/api/seller/statistics`          | Get detailed seller statistics  | Yes (SELLER) |
| GET    | `/api/seller/products/:id/bids`   | Get bids for seller's product   | Yes (SELLER) |

## Packages

| Method | Endpoint                       | Description                     | Auth Required |
|--------|-----------------------------|-----------------------------------|--------------|
| GET    | `/api/packages`             | Get all seller packages           | No           |
| GET    | `/api/packages/:id`         | Get package by ID                 | No           |
| POST   | `/api/packages/:id/purchase`| Purchase a package                | Yes          |
| GET    | `/api/packages/my-packages` | Get user's purchased packages     | Yes          |
| GET    | `/api/packages/status`      | Check active package status       | Yes          |

## Admin

| Method | Endpoint                            | Description                     | Auth Required |
|--------|------------------------------------|---------------------------------|--------------|
| GET    | `/api/admin/dashboard`             | Get admin dashboard overview    | Yes (ADMIN)  |
| GET    | `/api/admin/users`                 | Get all users                   | Yes (ADMIN)  |
| PUT    | `/api/admin/users/:id/role`        | Update user role                | Yes (ADMIN)  |
| GET    | `/api/admin/products/problematic`  | Get problematic products        | Yes (ADMIN)  |

## Notifications

| Method | Endpoint                           | Description                     | Auth Required |
|--------|-----------------------------------|---------------------------------|--------------|
| POST   | `/api/notifications/user`         | Send notification to user       | Yes (ADMIN)  |
| POST   | `/api/notifications/broadcast`    | Broadcast to role               | Yes (ADMIN)  |
| POST   | `/api/notifications/product-bidders` | Notify product bidders       | Yes (SELLER) |

## Using This Reference

This reference guide provides a quick overview of all available endpoints. For detailed information about each endpoint, including request/response formats, error handling, and examples, please refer to the individual API documentation:

- [Authentication API](./auth-api.md)
- [Product API](./product-api.md)
- [Bidding API](./bidding-api.md)
- [Categories API](./categories-api.md)
- [Users API](./users-api.md)
- [Seller API](./seller-api.md)
- [Packages API](./packages-api.md)
- [Admin Dashboard](./admin-dashboard.md)
- [Notification System](./notification-system.md)

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate:

1. Obtain a token via `/api/auth/login`
2. Include the token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer <JWT_TOKEN>
   ```

## Common Query Parameters

Many list endpoints support the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default varies by endpoint)
- `sortBy`: Field to sort by
- `order`: Sort order ("asc" or "desc")

## Error Responses

The API uses standard HTTP status codes and returns error messages in a consistent format:

```json
{
  "error": "Error message",
  "details": ["Optional array of detailed error messages"]
}
``` 