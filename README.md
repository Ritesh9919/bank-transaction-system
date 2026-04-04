# Banking Transaction System

A robust Node.js backend API for managing user accounts, transactions, and payment processing with JWT authentication, MongoDB integration, and email notifications.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Account Endpoints](#account-endpoints)
  - [Transaction Endpoints](#transaction-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Running the Project](#running-the-project)
- [Contributing](#contributing)

---

## Project Overview

This Banking Transaction System solution for managing user accounts and processing financial transactions. It provides secure user authentication, account management, and a robust transaction processing system with ledger logging for audit trails.

The API implements **idempotency** for transactions to prevent duplicate processing and uses **MongoDB sessions** for ACID transactions to ensure data consistency across multiple collections.

---

## Features

- ✅ **User Authentication**: Register, login, and logout with JWT tokens
- ✅ **Account Management**: Create and manage user accounts with balance tracking
- ✅ **Transaction Processing**: Secure transfer of funds between accounts with ledger entries
- ✅ **Idempotency**: Prevents duplicate transactions using idempotency keys
- ✅ **Email Notifications**: Automated registration and transaction confirmation emails
- ✅ **Token Blacklist**: Logout invalidates tokens immediately
- ✅ **Role-Based Access**: System user access for special operations
- ✅ **Error Handling**: Centralized error handling with custom API responses
- ✅ **Request Logging**: Morgan middleware for HTTP request logging
- ✅ **Cookie & JWT Support**: Authentication via both cookies and Bearer tokens

---

## Tech Stack

**Backend Framework:**
- Node.js 18+
- Express.js 5.2.1

**Database:**
- MongoDB 4.4+
- Mongoose 9.3.3

**Authentication & Security:**
- JSON Web Tokens (jsonwebtoken 9.0.3)
- bcryptjs 3.0.3 (Password hashing)
- cookie-parser 1.4.7

**Additional Tools:**
- Morgan 1.10.1 (HTTP request logger)
- Nodemailer 8.0.4 (Email service)

---

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd folder name
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables) section)

5. **Start the server**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

The server will start on the port specified in your `.env` file (default: 8000).

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/ecommerce-api
# Or use MongoDB Atlas
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce-api

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@ecommerce.com

# Optional: Node Environment
NODE_ENV=development
```

**Important Notes:**
- `JWT_SECRET`: Use a strong, random string for production
- For Gmail: Use [App Passwords](https://support.google.com/accounts/answer/185833) instead of your regular password
- Keep `.env` file secure and never commit it to version control

---

## Project Structure

```
Banking-ransaction-ystem
├── app.js                    # Express app setup and middleware configuration
├── server.js                 # Server initialization and database connection
├── package.json              # Project dependencies and scripts
├── .env                      # Environment variables (not in version control)
│
├── config/
│   └── database.js           # MongoDB connection configuration
│
├── controllers/
│   ├── auth.controller.js    # Authentication logic (register, login, logout)
│   ├── account.controller.js # Account management logic
│   └── transaction.controller.js # Transaction processing logic
│
├── models/
│   ├── user.model.js         # User schema and methods
│   ├── account.model.js      # Account schema with balance calculation
│   ├── transaction.model.js  # Transaction schema and status tracking
│   ├── ledger.model.js       # Ledger entries for debit/credit tracking
│   └── blacklist.model.js    # Token blacklist for logout
│
├── routes/
│   ├── auth.routes.js        # Authentication route definitions
│   ├── account.routes.js     # Account management routes
│   └── transaction.routes.js # Transaction routes
│
├── middleware/
│   ├── auth.middleware.js    # JWT verification and user validation
│   └── error-handler.middleware.js # Error handling middleware
│
├── services/
│   └── email.service.js      # Email notification service
│
└── utils/
    ├── api-error.js          # Custom API error class
    └── api-response.js       # Standard API response format
```

---

## API Documentation

### Base URL

```
http://localhost:8000/api
```

---

### Authentication Endpoints

#### 1. Register User

Create a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "systemUser": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Response (422 Conflict):**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "User already registered"
}
```

---

#### 2. Login User

Authenticate and receive a JWT token.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User Login successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid Credential"
}
```

---

#### 3. Logout User

Invalidate the current session by blacklisting the token.

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer <your_jwt_token>
```

or with Cookie:
```http
POST /api/auth/logout
Cookie: token=<your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {},
  "message": "Logout successfully"
}
```

---

### Account Endpoints

*All account endpoints require authentication (JWT token)*

#### 1. Create Account

Create a new account for the authenticated user.

**Request:**
```http
POST /api/account
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "account": {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:35:00Z"
    }
  },
  "message": "Account created successfully"
}
```

---

#### 2. Get User Accounts

Retrieve all accounts for the authenticated user.

**Request:**
```http
GET /api/account
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "user": "507f1f77bcf86cd799439011",
        "status": "ACTIVE",
        "createdAt": "2024-01-15T10:35:00Z"
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "user": "507f1f77bcf86cd799439011",
        "status": "ACTIVE",
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ]
  },
  "message": "User accounts fetched successfully"
}
```

---

#### 3. Get Account Balance

Retrieve the balance of a specific account.

**Request:**
```http
GET /api/account/balance/:accountId
Authorization: Bearer <your_jwt_token>
```

**Example:**
```http
GET /api/account/balance/507f1f77bcf86cd799439012
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "507f1f77bcf86cd799439012",
    "balance": 5000.50
  },
  "message": "Account balance fetched successfully"
}
```

---

### Transaction Endpoints

*All transaction endpoints require authentication (JWT token)*

#### 1. Create Transaction

Transfer funds from one account to another. Uses idempotency keys to prevent duplicate transactions.

**Request:**
```http
POST /api/transaction
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "fromAccount": "507f1f77bcf86cd799439012",
  "toAccount": "507f1f77bcf86cd799439013",
  "amount": 100.50,
  "idempotencyKey": "unique-transaction-key-12345"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "507f1f77bcf86cd799439014",
      "fromAccount": "507f1f77bcf86cd799439012",
      "toAccount": "507f1f77bcf86cd799439013",
      "amount": 100.50,
      "status": "COMPLETED",
      "idempotencyKey": "unique-transaction-key-12345",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  },
  "message": "Transaction completed successfully"
}
```

**Transaction Processing Steps:**
1. Validate request parameters
2. Verify idempotency key (check if transaction already processed)
3. Verify both accounts are ACTIVE
4. Check sender has sufficient balance
5. Create transaction with PENDING status
6. Create DEBIT ledger entry (sender account)
7. Create CREDIT ledger entry (receiver account)
8. Update transaction status to COMPLETED
9. Commit MongoDB transaction
10. Send email notification to sender

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Insufficient balance. Current balance is 50. Requested amount is 100"
}
```

**Idempotency Behavior:**
- If the same `idempotencyKey` is used again within the same request:
  - If COMPLETED: Returns the original transaction
  - If PENDING: Returns processing status
  - If FAILED/REVERSED: Returns error

---

#### 2. Create Initial Funds Transaction (System User Only)

Add initial funds to an account (admin/system user only).

**Request:**
```http
POST /api/transaction/system/initial-fund
Authorization: Bearer <system_user_jwt_token>
Content-Type: application/json

{
  "toAccount": "507f1f77bcf86cd799439013",
  "amount": 1000.00,
  "idempotencyKey": "initial-fund-key-001"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "507f1f77bcf86cd799439015",
      "toAccount": "507f1f77bcf86cd799439013",
      "amount": 1000.00,
      "status": "COMPLETED",
      "idempotencyKey": "initial-fund-key-001",
      "createdAt": "2024-01-15T12:15:00Z"
    }
  },
  "message": "Initial funds transaction completed successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidded access, not system user"
}
```

---

## Authentication

### JWT Token

The API uses JSON Web Tokens (JWT) for authentication. 

**Token Header:**
- Issued when user registers or logs in
- Expires after 1 day
- Encoded with a secret key

**How to Use:**

Option 1: Authorization Header
```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:8000/api/account
```

Option 2: Cookie
```bash
curl -H "Cookie: token=<your_jwt_token>" \
  http://localhost:8000/api/account
```

### Token Blacklist

When users logout:
- The token is added to a blacklist in MongoDB
- Subsequent requests using that token will be rejected
- Ensures immediate logout without waiting for token expiration

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description"
}
```

### Common Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

---

## Running the Project

### Development Mode

Run with automatic restart on file changes:

```bash
npm run dev
```

This uses Node's `--watch` flag and loads environment variables from `.env`.

### Production Mode

```bash
npm start
```

### Testing Routes

Use Postman, Insomnia, or cURL to test API endpoints:

```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create Account (replace <token> with actual JWT)
curl -X POST http://localhost:8000/api/account \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

---

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## License

This project is licensed under the ISC License - see package.json for details.

---

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Last Updated:** January 2024
