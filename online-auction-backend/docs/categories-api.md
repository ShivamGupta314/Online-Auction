# Categories API Documentation

This document provides detailed information about the category-related endpoints available in the Online Auction Platform API.

## Table of Contents
- [Get All Categories](#get-all-categories)
- [Get Category by ID](#get-category-by-id)
- [Create Category](#create-category)
- [Update Category](#update-category)
- [Delete Category](#delete-category)

## Get All Categories

Retrieves a list of all product categories.

**URL**: `/api/categories`

**Method**: `GET`

**Authentication required**: No

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "createdAt": "2022-12-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Collectibles",
    "description": "Rare and valuable collectible items",
    "createdAt": "2022-12-01T10:05:00.000Z"
  },
  {
    "id": 3,
    "name": "Watches",
    "description": "Luxury and vintage watches",
    "createdAt": "2022-12-01T10:10:00.000Z"
  },
  // More categories...
]
```

**Error Responses**:

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "error": "Failed to fetch categories"
}
```

## Get Category by ID

Retrieves a specific category by its ID.

**URL**: `/api/categories/:id`

**Method**: `GET`

**Authentication required**: No

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Category ID     |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 3,
  "name": "Watches",
  "description": "Luxury and vintage watches",
  "createdAt": "2022-12-01T10:10:00.000Z"
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

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**: 
```json
{
  "error": "Failed to fetch category"
}
```

## Create Category

Creates a new product category.

**URL**: `/api/categories`

**Method**: `POST`

**Authentication required**: Yes (ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**:
```json
{
  "name": "Art",
  "description": "Paintings, sculptures, and other art pieces"
}
```

| Field       | Type   | Required | Description                     |
|-------------|--------|----------|---------------------------------|
| name        | string | Yes      | Category name (3-50 characters) |
| description | string | No       | Category description            |

**Success Response**:

- **Code**: 201 CREATED
- **Content**: 
```json
{
  "id": 10,
  "name": "Art",
  "description": "Paintings, sculptures, and other art pieces",
  "createdAt": "2023-01-15T14:30:00.000Z"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Validation failed",
  "details": [
    "name must be between 3 and 50 characters"
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
  "error": "Forbidden - Admin access required"
}
```

- **Code**: 409 CONFLICT
- **Content**: 
```json
{
  "error": "Category with this name already exists"
}
```

## Update Category

Updates an existing category.

**URL**: `/api/categories/:id`

**Method**: `PUT`

**Authentication required**: Yes (ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Category ID     |

**Request Body**:
```json
{
  "name": "Fine Art",
  "description": "Updated description for fine art category"
}
```

| Field       | Type   | Required | Description                     |
|-------------|--------|----------|---------------------------------|
| name        | string | No       | Category name (3-50 characters) |
| description | string | No       | Category description            |

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "id": 10,
  "name": "Fine Art",
  "description": "Updated description for fine art category",
  "createdAt": "2023-01-15T14:30:00.000Z",
  "updatedAt": "2023-01-16T09:20:00.000Z"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Validation failed",
  "details": [
    "name must be between 3 and 50 characters"
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
  "error": "Forbidden - Admin access required"
}
```

- **Code**: 404 NOT FOUND
- **Content**: 
```json
{
  "error": "Category not found"
}
```

- **Code**: 409 CONFLICT
- **Content**: 
```json
{
  "error": "Category with this name already exists"
}
```

## Delete Category

Deletes an existing category.

**URL**: `/api/categories/:id`

**Method**: `DELETE`

**Authentication required**: Yes (ADMIN role required)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:

| Parameter | Type    | Required | Description     |
|-----------|---------|----------|-----------------|
| id        | integer | Yes      | Category ID     |

**Notes**:
- Cannot delete a category that has associated products
- Admin must check or move products before deletion

**Success Response**:

- **Code**: 200 OK
- **Content**: 
```json
{
  "message": "Category deleted successfully"
}
```

**Error Responses**:

- **Code**: 400 BAD REQUEST
- **Content**: 
```json
{
  "error": "Cannot delete category with associated products"
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
  "error": "Category not found"
}
```

## Category Management Best Practices

1. **Creating Categories**
   - Use concise, descriptive names that clearly identify the product type
   - Provide helpful descriptions to assist users in understanding the category scope
   - Avoid creating duplicate or overly similar categories

2. **Category Hierarchy**
   - Currently categories are flat (no parent-child relationships)
   - Consider the possibility of subcategories in future enhancements
   - Organize categories in the UI based on popularity or logical grouping

3. **Managing Products in Categories**
   - Before deleting a category, review all associated products
   - Products cannot exist without a category assignment
   - Consider merging similar categories rather than deleting 