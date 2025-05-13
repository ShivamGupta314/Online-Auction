# Online Auction Backend

This is the backend service for the Online Auction platform, providing robust API endpoints for managing auctions, bids, payments, and user management.

## Features

- User authentication and authorization
- Product listing and management
- Real-time bidding system
- Payment processing with Stripe
- Email notifications
- Admin dashboard
- Package subscriptions for sellers
- Comprehensive test suite
- Optimized database performance with strategic indexing

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Stripe Integration
- Nodemailer
- Jest for testing

## Setup and Installation

### Prerequisites

- Node.js v18 or higher
- PostgreSQL 14 or higher
- Stripe account (for payment processing)
- SMTP server access (for email notifications)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd online-auction-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file and fill in the appropriate values.

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Seed the database with initial data:
   ```
   npm run seed
   ```

6. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

The API provides the following main endpoint groups:

- `/api/auth` - Authentication and user management
- `/api/products` - Product listings and auction management
- `/api/bids` - Bidding functionality
- `/api/payments` - Payment processing and management
- `/api/packages` - Seller subscription packages
- `/api/categories` - Product categories
- `/api/notifications` - User notifications

## Database Performance

The application uses strategic database indexing to optimize query performance. This includes:

- Single-column indexes for frequent filtering operations
- Composite indexes for complex queries
- Specialized indexes for search operations
- Optimized indexes for time-based auction operations

For a comprehensive guide to our indexing strategy, see [DATABASE_INDEXES.md](DATABASE_INDEXES.md).

## Testing

### Running Tests

To run the test suite:

```
npm test
```

For sequential tests:

```
npm run test-sequential
```

### Test Environment

The test suite can run in two modes:

1. **With database access**: Tests will interact with a test database.
2. **With mocks**: Tests will use mock data without database access.

To enable mock mode:

```
NODE_ENV=test USE_TEST_MOCKS=true npm test
```

## Environment Variables

Key environment variables include:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token generation
- `STRIPE_SECRET_KEY` - Stripe API key for payments
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - SMTP configuration for emails
- `FRONTEND_URL` - URL to the frontend application

See `.env.example` for a complete list of environment variables.

## Deployment

### Production Build

```
npm run build
```

### Start Production Server

```
npm start
```

### Database Migrations

```
npx prisma migrate deploy
```

## Project Structure

- `src/` - Source code
  - `controllers/` - Request handlers
  - `middleware/` - Express middleware
  - `routes/` - API route definitions
  - `services/` - Business logic
  - `utils/` - Utility functions
  - `prismaClient.js` - Prisma client instance
- `prisma/` - Prisma schema and migrations
- `tests/` - Test suite
- `uploads/` - Storage for uploaded files
- `DATABASE_INDEXES.md` - Documentation of database indexing strategy

## Contributing

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

