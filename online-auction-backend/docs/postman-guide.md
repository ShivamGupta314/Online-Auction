# Using the Postman Collection

This guide explains how to use the included Postman collection to test the Online Auction Platform API.

## Getting Started

1. **Import the Collection**
   - In Postman, click "Import" at the top left
   - Select the file `postman-collection.json` from the `docs` folder
   - The collection "Online Auction API" will be imported

2. **Set Up Environment Variables**
   - Create a new environment in Postman (click the gear icon in the top right)
   - Add the following variables:
     - `baseUrl`: Set to your API server URL (default: `http://localhost:5001`)
     - `token`: Leave this empty initially; it will be filled automatically

3. **Select Your Environment**
   - Make sure to select your newly created environment from the dropdown in the top right

## Authentication Flow

1. **Register a User**
   - Run the "Register" request to create a new user
   - You can modify the user details in the request body

2. **Login**
   - Run the "Login" request with the credentials you created
   - The response will contain a JWT token

3. **Save the Token**
   - In the login response, find the `token` value
   - Copy this token to your environment variable:
     - Click the "Eye" icon near the environment dropdown
     - Set the value of `token` to your JWT token
     - Or, use the "Tests" tab in the Login request to auto-extract the token:
     ```javascript
     var jsonData = pm.response.json();
     pm.environment.set("token", jsonData.token);
     ```

4. **Make Authenticated Requests**
   - All protected endpoints now use your token via the `{{token}}` variable
   - You're ready to make authenticated requests!

## Testing Different User Roles

To test endpoints with different user role permissions:

1. **Create multiple user accounts** with different roles (ADMIN, SELLER, BIDDER)
2. **Login with the desired account** to get the appropriate token
3. **Save the token** in your environment variable
4. **Make the API calls** to test role-specific functionality

## Example Test Workflow

Here's a typical workflow for testing the API:

1. Register a SELLER user
2. Login as the SELLER and save the token
3. Create a new product listing
4. Register a BIDDER user
5. Login as the BIDDER and save the token
6. Browse products and place bids
7. Test other features like user profiles, categories, etc.

## Common Issues

- **401 Unauthorized**: Your token is missing, expired, or invalid
- **403 Forbidden**: Your user doesn't have the required role for this action
- **404 Not Found**: The requested resource doesn't exist (check IDs)
- **400 Bad Request**: Invalid input data (check request body format)

## Extending the Collection

This Postman collection includes only the core endpoints. To add additional endpoints:

1. **Duplicate an existing request** similar to what you need
2. **Modify the URL, method, and body** as required
3. **Organize requests into folders** for better structure
4. **Save the collection** for future use

## Importing from API Reference

If you prefer to create requests based on the API reference:

1. Study the API Reference Guide (`api-reference.md`)
2. Create new requests in Postman for each endpoint you need
3. Set appropriate headers, especially for authenticated requests
4. Use the example request/response bodies from the detailed API docs

The Postman collection should help you get started quickly with testing the API endpoints without writing code. 