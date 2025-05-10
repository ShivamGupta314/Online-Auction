# Online Auction System - Project Index

## Project Overview
This is a backend system for an online auction platform built with Node.js, Express, and Prisma ORM.

## Directory Structure

### Root Directory
- `server.js` - Main application entry point
- `package.json` - Project dependencies and scripts
- `docker-compose.yml` - Docker configuration for services
- `Dockerfile` - Container configuration
- `prisma/` - Database schema and migrations
- `docs/` - Project documentation
- `tests/` - Test files and configurations
- `scripts/` - Utility scripts
- `logs/` - Application logs

### Source Code (`src/`)
- `app.js` - Express application setup and middleware configuration
- `controllers/` - Request handlers and business logic
- `services/` - Business logic and external service integrations
- `routes/` - API route definitions
- `middleware/` - Custom middleware functions
- `utils/` - Utility functions and helpers
- `validators/` - Request validation schemas
- `scheduler.js` - Background job scheduler
- `prismaClient.js` - Database client configuration

### Configuration Files
- `env.example` - Environment variables template
- `env.test` - Test environment configuration
- `.envv` - Environment variables
- `jest.config.js` - Jest testing configuration
- `babel.config.js` - Babel transpilation configuration

### Documentation
- `README.md` - Project setup and usage instructions
- `IMPROVEMENTS.md` - Planned improvements
- `PRODUCTION_IMPROVEMENTS.md` - Production-specific improvements

## Key Features
1. User Authentication and Authorization
2. Auction Management
3. Bidding System
4. Email Notifications
5. Background Job Processing
6. API Documentation
7. Testing Infrastructure

## Development Tools
- Node.js/Express for the backend
- Prisma ORM for database operations
- Jest for testing
- Docker for containerization
- Email service integration

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy from `env.example`)
4. Run database migrations: `npx prisma migrate dev`
5. Start the server: `npm start`

## Testing
- Run tests: `npm test`
- Test configuration in `jest.config.js`
- Test utilities in `tests/` directory

## Deployment
- Docker support with `Dockerfile` and `docker-compose.yml`
- Production improvements documented in `PRODUCTION_IMPROVEMENTS.md`

## Contributing
Please refer to the documentation in the `docs/` directory for contribution guidelines and coding standards. 