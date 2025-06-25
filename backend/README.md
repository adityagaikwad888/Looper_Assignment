# Backend Authentication System

A Node.js/Express.js backend authentication system using JWT tokens and cookies.

## Features

- User registration and login
- JWT token-based authentication
- Secure HTTP-only cookies
- Password hashing with bcrypt
- Input validation
- CORS enabled for frontend integration
- Environment-based configuration

## API Endpoints

### Authentication Routes

- **POST** `/api/auth/signup` - Register a new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/logout` - Logout user
- **GET** `/api/auth/me` - Get current user profile (protected)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file and configure your environment variables:

```
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
NODE_ENV=development
PORT=3000
```

3. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Usage Examples

### Register a new user

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get current user (requires authentication)

```bash
GET /api/auth/me
Cookie: token=your_jwt_token
```

### Logout

```bash
POST /api/auth/logout
```

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens are stored in HTTP-only cookies
- CORS configured for frontend integration
- Input validation and sanitization
- Environment-based configuration

## Notes

- This implementation uses in-memory storage for simplicity
- In production, replace the User model with a proper database (MongoDB, PostgreSQL, etc.)
- Make sure to change the JWT_SECRET in production
- The server runs on port 3000 by default
