# Product Image Handling

This document outlines how product images are managed in the Online Auction System.

## Overview

Product images are stored in the `uploads/images/products` directory, organized by category. The backend serves these images as static files, making them accessible via HTTP requests.

## Directory Structure

```
uploads/
  ├── images/
  │    └── products/
  │         ├── electronics/
  │         │    ├── laptop.jpg
  │         │    ├── smartphone.jpg
  │         │    ├── headphones.jpg
  │         │    ├── tablet.jpg
  │         │    └── camera.jpg
  │         ├── fashion/
  │         │    ├── jacket.jpg
  │         │    ├── shoes.jpg
  │         │    ├── watch.jpg
  │         │    ├── sunglasses.jpg
  │         │    └── bag.jpg
  │         ├── home/
  │         │    ├── sofa.jpg
  │         │    ├── table.jpg
  │         │    ├── lamp.jpg
  │         │    ├── chair.jpg
  │         │    └── rug.jpg
  │         ├── art/
  │         │    ├── painting.jpg
  │         │    ├── sculpture.jpg
  │         │    ├── print.jpg
  │         │    ├── photograph.jpg
  │         │    └── pottery.jpg
  │         └── default/
  │              ├── item1.jpg
  │              ├── item2.jpg
  │              ├── item3.jpg
  │              ├── item4.jpg
  │              └── item5.jpg
```

## Image URL Format

Images are stored in the database as relative paths and served through the `/uploads` endpoint. For example, a product with category "Electronics" might have the following image URL:

```
/images/products/electronics/laptop.jpg
```

To access this image from the frontend, prepend the API base URL:

```
http://localhost:5000/uploads/images/products/electronics/laptop.jpg
```

## Implementation

### Backend Configuration

The backend serves static files from the uploads directory using Express.js:

```javascript
// In src/app.js
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
```

### Database Storage

In the database, images are referenced by their path relative to the uploads directory. This is stored in the `photoUrl` field of the `Product` model.

### Management Tools

The following scripts are available for managing product images:

1. **Create placeholder images**:
   ```
   node scripts/create-placeholder-images.js
   ```
   This creates 1x1 pixel placeholder images for all categories.

2. **Fix product images**:
   ```
   node scripts/auction-manager.js fix-images
   ```
   This updates products in the database to use the correct image paths based on their category.

3. **List products with image information**:
   ```
   node scripts/auction-manager.js list
   ```
   This displays all products, including their image paths.

## Adding New Product Images

To add custom product images:

1. Create the appropriate category directory in `uploads/images/products/` if it doesn't exist
2. Add your image file(s) to the category directory
3. When creating a product, set the `photoUrl` to the relative path of the image

## Troubleshooting

If images are not displaying correctly:

1. Check that the image files exist in the correct location
2. Verify that the path stored in the database is correct
3. Ensure the Express static middleware is configured correctly
4. Check for any CORS issues if accessing from a different domain

## Frontend Integration

When displaying products in the frontend, construct the full image URL by combining:

```javascript
const imageUrl = `${API_BASE_URL}${product.photoUrl}`;
```

For example, if your API is running at `http://localhost:5000` and the product has a `photoUrl` of `/images/products/electronics/laptop.jpg`, the full URL would be:

```
http://localhost:5000/uploads/images/products/electronics/laptop.jpg
``` 