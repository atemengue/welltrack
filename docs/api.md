# WellTrack API Reference

Base URL: `http://localhost:3000/api`

All request bodies are JSON. All responses are JSON.
Endpoints marked **requires auth** expect an `Authorization: Bearer <accessToken>` header.

---

## Auth

### Register
`POST /api/auth/register`

Creates a new user account and returns an access token.

Request:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123",
  "displayName": "Jane Doe"
}
```

| Field | Type | Rules |
|---|---|---|
| `email` | string | Valid email format |
| `password` | string | Minimum 8 characters |
| `displayName` | string | 1–100 characters |

Response: `201 Created`
```json
{
  "user": {
    "id": "a1b2c3d4-...",
    "email": "jane@example.com",
    "displayName": "Jane Doe",
    "timezone": "UTC",
    "createdAt": "2026-03-05T20:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Errors:
- `400 Bad Request` — validation failed
```json
{ "error": "Validation failed", "details": { "email": ["Invalid email"] } }
```
- `409 Conflict` — email already registered
```json
{ "error": "Email already in use" }
```

---

### Login
`POST /api/auth/login`

Authenticates a user and returns a short-lived access token and a long-lived refresh token.

Request:
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

Response: `200 OK`
```json
{
  "user": {
    "id": "a1b2c3d4-...",
    "email": "jane@example.com",
    "displayName": "Jane Doe",
    "timezone": "UTC",
    "createdAt": "2026-03-05T20:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Token lifetimes:
- `accessToken` — 15 minutes, used in `Authorization` header for all protected requests
- `refreshToken` — 7 days, use with `POST /api/auth/refresh` to get a new access token

Errors:
- `400 Bad Request` — missing or invalid fields
- `401 Unauthorized` — wrong email or password (both return the same message to prevent user enumeration)
```json
{ "error": "Invalid credentials" }
```

---

### Refresh Token
`POST /api/auth/refresh`

> ⚠️ Not yet implemented

Issues a new access token using a valid refresh token.

---

### Logout
`POST /api/auth/logout`

> ⚠️ Not yet implemented

Invalidates the provided refresh token.

---

### Forgot Password
`POST /api/auth/forgot-password`

> ⚠️ Not yet implemented

---

### Reset Password
`POST /api/auth/reset-password`

> ⚠️ Not yet implemented
