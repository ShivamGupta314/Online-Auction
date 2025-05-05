# Online Auction Platform Backend

A robust backend system for an online auction platform with bidding, notifications, user management, and admin features.

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Features

### User Management & Authentication
- 🔐 JWT-based authentication system
- 🔑 Role-based access control (ADMIN, SELLER, BIDDER)
- 👤 User registration and login
- 🧑‍💼 User profile management

### Product Management
- 📦 Create, read, update, and delete products
- 🖼️ Product details with images
- 📂 Category-based organization
- 🔍 Validation for all product operations
- ✅ Seller verification for product operations

### Bidding System
- 💸 Place bids on active auctions
- ⏱️ Time-based auction management
- 📈 Bid history and tracking
- 🔄 Automatic bid validation
- 🏆 Automatic winner determination
- 🔒 Prevention of self-bidding

### Notification System
- 📧 Email notifications for bidding activities
- 🔔 Outbid alerts to previous highest bidders
- 🎉 Auction win notifications
- 📢 Seller notifications for bids and auction completion
- 📱 Admin broadcast capabilities to user groups
- 🗣️ Seller-bidder communication

### Admin Dashboard
- 📊 System-wide statistics
- 👥 User management capabilities
- 🛠️ Role modification for users
- 📉 Monitoring of problematic products

### Auction Management
- ⏰ Scheduled processing of ended auctions
- 📅 Daily reminders for auctions ending soon
- 📌 Auction status tracking (active, ended, processed)

### Tech Stack
- 🛢️ PostgreSQL database with Prisma ORM
- 🚀 Node.js with Express framework
- 📦 ES modules for modern JavaScript
- 🔒 JWT for secure authentication
- ✅ Zod for validation
- 📧 Nodemailer for email notifications
- ⏱️ Node-cron for scheduled tasks

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/online-auction-backend.git
cd online-auction-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
# Create PostgreSQL database named 'auctiondb'
# Then run Prisma migrations
npx prisma migrate dev
```

4. Seed the database with initial data
```bash
npx prisma db seed
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auctiondb?schema=public"

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Frontend URL (for emails with links)
FRONTEND_URL=http://localhost:3000

# Email Configuration
# For development, leave these empty to use Ethereal test account
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Online Auction <noreply@example.com>"

# Admin User (created during seed)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpassword
```

### Starting the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

Detailed documentation for each API endpoint is available in separate documentation files:

- [API Reference Guide](./docs/api-reference.md) - Quick reference for all endpoints
- [Authentication API](./docs/auth-api.md)
- [Product API](./docs/product-api.md)
- [Bidding API](./docs/bidding-api.md)
- [Categories API](./docs/categories-api.md)
- [Users API](./docs/users-api.md)
- [Seller API](./docs/seller-api.md)
- [Packages API](./docs/packages-api.md)
- [Admin Dashboard](./docs/admin-dashboard.md)
- [Notification System](./docs/notification-system.md)

### API Testing Resources

- [Postman Collection](./docs/postman-collection.json) - Ready-to-use API requests for testing
- [Postman Guide](./docs/postman-guide.md) - Instructions for using the Postman collection

## Testing

Run all tests:
```bash
npm test
```

Run tests in sequential mode (to avoid concurrency issues):
```bash
npm run test-sequential
```

Run specific test files:
```bash
npm test -- auth.test.js
```

## Project Structure

```
src/
├── controllers/      # Route handlers
├── middleware/       # Express middleware
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── validators/       # Request validation
├── prismaClient.js   # Prisma client instance
├── app.js            # Express app setup
├── server.js         # Server entry point
└── scheduler.js      # Scheduled tasks

prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations

tests/
├── integration/      # API integration tests
├── unit/             # Unit tests
└── utils/            # Test utilities
```

## Future Enhancements

- Rate limiting for API endpoints
- Advanced product search and filtering
- Enhanced auction analytics
- Payment gateway integration
- User preference settings
- Mobile app push notifications

