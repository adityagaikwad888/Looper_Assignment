# Backend API Documentation

Base URL: `http://localhost:3000`

## Authentication APIs

### 1. User Signup

- **Method**: `POST`
- **URL**: `/api/auth/signup`
- **Authentication**: Not required
- **Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

- **Response**:

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. User Login

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Authentication**: Not required
- **Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

- **Response**:

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. User Logout

- **Method**: `POST`
- **URL**: `/api/auth/logout`
- **Authentication**: Not required
- **Body**: None
- **Response**:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. Get Current User

- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**: None
- **Response**:

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Dashboard APIs

### 5. Dashboard Summary (Metrics Cards)

- **Method**: `GET`
- **URL**: `/api/dashboard/summary`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**: None
- **Response**:

```json
{
  "balance": 25000.5,
  "revenue": 75000.0,
  "expenses": 49999.5,
  "savings": 25000.5
}
```

### 6. Dashboard Monthly Trends

- **Method**: `GET`
- **URL**: `/api/dashboard/trends/monthly`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**: None
- **Response**:

```json
[
  { "month": "Jan", "revenue": 5000, "expenses": 3000 },
  { "month": "Feb", "revenue": 6000, "expenses": 3500 },
  { "month": "Mar", "revenue": 7000, "expenses": 4000 }
]
```

### 7. Dashboard Yearly Trends

- **Method**: `GET`
- **URL**: `/api/dashboard/trends/yearly`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**: None
- **Response**:

```json
[
  { "year": "2023", "revenue": 60000, "expenses": 40000 },
  { "year": "2024", "revenue": 75000, "expenses": 50000 }
]
```

## Transaction APIs

### 8. Recent Transactions

- **Method**: `GET`
- **URL**: `/api/transactions/recent`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**: None
- **Response**:

```json
[
  {
    "id": 1,
    "user_id": "user123",
    "date": "2024-01-15T00:00:00.000Z",
    "amount": 1500.0,
    "status": "Paid",
    "category": "Revenue"
  }
]
```

### 9. Get All Transactions (with pagination)

- **Method**: `GET`
- **URL**: `/api/transactions`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Sort field (default: "date")
  - `order` (optional): "asc" or "desc" (default: "desc")
  - `status` (optional): Filter by status
  - `category` (optional): Filter by category
  - `search` (optional): Search term
- **Example**: `/api/transactions?page=1&limit=10&status=Paid&sortBy=amount&order=desc`
- **Body**: None

### 10. Get Transactions Table

- **Method**: `GET`
- **URL**: `/api/transactions/table`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Query Parameters**: Same as above
- **Body**: None
- **Response**: Grouped transaction data for table view

### 11. Query Transactions (Advanced Search)

- **Method**: `POST`
- **URL**: `/api/transactions/query`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**:

```json
{
  "search": "revenue",
  "status": "Paid",
  "category": "Revenue",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31",
  "amountMin": 100,
  "amountMax": 5000,
  "sortBy": "date",
  "order": "desc",
  "page": 1,
  "limit": 10
}
```

- **Response**:

```json
{
  "data": [
    /* transaction objects */
  ],
  "page": 1,
  "totalPages": 5,
  "total": 50,
  "hasNext": true,
  "hasPrev": false
}
```

### 12. Export Transactions

- **Method**: `POST`
- **URL**: `/api/transactions/export`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**:

```json
{
  "filters": {
    "search": "revenue",
    "status": "Paid",
    "category": "Revenue",
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "amountMin": 100,
    "amountMax": 5000
  },
  "fields": ["name", "date", "amount", "status", "category"],
  "format": "csv"
}
```

- **Response**: CSV/JSON formatted transaction data

## Test/Utility APIs

### 13. Health Check

- **Method**: `GET`
- **URL**: `/healthCheck`
- **Authentication**: Not required
- **Body**: None
- **Response**:

```json
{
  "message": "Backend Authentication API is running!"
}
```

### 14. Test Database Connection

- **Method**: `GET`
- **URL**: `/api/test-transactions`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**: None
- **Response**: Database connection and transaction count info

### 15. Test Route

- **Method**: `POST`
- **URL**: `/test`
- **Authentication**: Not required
- **Body**: Any JSON object
- **Response**: Echo of sent data

### 16. Logs Status

- **Method**: `GET`
- **URL**: `/logs/status`
- **Authentication**: Required (Bearer token)
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**: None
- **Response**:

```json
{
  "loggingEnabled": true,
  "logLevel": "debug",
  "logFilePath": "./logs/app.log",
  "message": "Logging system status"
}
```

## Authentication Notes

For all protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

The token is returned from the login/signup endpoints and should be stored and sent with subsequent requests.

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    /* validation errors if any */
  ]
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created (signup)
- `400`: Bad Request / Validation Error
- `401`: Unauthorized / Invalid Token
- `404`: Not Found
- `500`: Internal Server Error
