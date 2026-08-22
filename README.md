# Peerceptiv Phase 3 Assignment 2

Express + MongoDB API for managing game consoles with JWT authentication, Mongoose validation, and query features (filtering, sorting, pagination).

## Features

- User registration/login with bcrypt password hashing and JWT tokens
- Protected CRUD routes for consoles
- Mongoose schema validation and model relationships (`Console.owner -> User`)
- Query params for filtering, sorting, and pagination
- Centralized error handling middleware

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JSON Web Token (`jsonwebtoken`)
- `bcryptjs`
- `express-validator`

## Prerequisites

- Node.js 18+ (recommended)
- npm
- A MongoDB database (local MongoDB or MongoDB Atlas)

## 1) Clone and Install

```bash
git clone <your-repo-url>
cd Peerceptiv-Phase3-Assignment2
npm install
```

## 2) Environment Variables

Create a `.env` file in the project root:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/peerceptiv_phase3
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

Notes:

- `MONGODB_URI` can be your Atlas URI if using cloud MongoDB.
- `JWT_SECRET` should be long/random and never committed.

## 3) Seed the Database (optional but recommended)

```bash
npm run seed
```

This creates an admin user and sample console data.

## 4) Start the API

```bash
npm run server
```

Server starts at:

```text
http://localhost:4000
```

Health check:

```bash
curl http://localhost:4000/health
```

## API Overview

Base URL: `http://localhost:4000`

### Auth Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires Bearer token)

### Console Endpoints

- `GET /api/consoles`
- `GET /api/consoles/:id`
- `POST /api/consoles` (requires Bearer token)
- `PUT /api/consoles/:id` (requires Bearer token + owner/admin)
- `DELETE /api/consoles/:id` (requires Bearer token + owner/admin)

---

## Request Examples

## A) Register + Login

Register:

```bash
curl -X POST http://localhost:4000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{
		"name": "Alice",
		"email": "alice@example.com",
		"password": "Secret123"
	}'
```

Login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{
		"email": "alice@example.com",
		"password": "Secret123"
	}'
```

Copy the `token` from the response and use it as:

```text
Authorization: Bearer <token>
```

## B) Filtering

Filter by brand:

```bash
curl "http://localhost:4000/api/consoles?brand=Sony"
```

Filter by price range:

```bash
curl "http://localhost:4000/api/consoles?minPrice=300&maxPrice=700"
```

Search by name (case-insensitive):

```bash
curl "http://localhost:4000/api/consoles?search=switch"
```

Combine filters:

```bash
curl "http://localhost:4000/api/consoles?brand=Microsoft&minPrice=200&maxPrice=600&search=xbox"
```

## C) Sorting

Sort by price ascending:

```bash
curl "http://localhost:4000/api/consoles?sort=price:asc"
```

Sort by created date descending:

```bash
curl "http://localhost:4000/api/consoles?sort=createdAt:desc"
```

## D) Pagination

Page 1, 2 items per page:

```bash
curl "http://localhost:4000/api/consoles?page=1&limit=2"
```

Page 2, 2 items per page:

```bash
curl "http://localhost:4000/api/consoles?page=2&limit=2"
```

The response includes:

- `data`: current page results
- `pagination.total`
- `pagination.page`
- `pagination.limit`
- `pagination.pages`

## E) Protected Create Example

```bash
curl -X POST http://localhost:4000/api/consoles \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <token>" \
	-d '{
		"name": "Steam Deck OLED",
		"brand": "Valve",
		"price": 549.99,
		"stock": 8
	}'
```

## Validation Error Response Examples

### 1) Auth validation error (short password)

Request:

```bash
curl -X POST http://localhost:4000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{
		"name": "Bob",
		"email": "bob@example.com",
		"password": "123"
	}'
```

Example response (`400`):

```json
{
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "value": "123",
      "msg": "Password must be at least 6 characters",
      "path": "password",
      "location": "body"
    }
  ]
}
```

### 2) Console validation error (invalid brand)

Request:

```bash
curl -X POST http://localhost:4000/api/consoles \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <token>" \
	-d '{
		"name": "My Console",
		"brand": "Sega",
		"price": 299,
		"stock": 4
	}'
```

Example response (`400`):

```json
{
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "value": "Sega",
      "msg": "Brand must be one of: Nintendo, Sony, Microsoft, Valve",
      "path": "brand",
      "location": "body"
    }
  ]
}
```

### 3) Query validation error (`minPrice > maxPrice`)

Request:

```bash
curl "http://localhost:4000/api/consoles?minPrice=700&maxPrice=300"
```

Example response (`400`):

```json
{
  "error": "minPrice cannot be greater than maxPrice"
}
```

## Project Scripts

- `npm run server` — start API server
- `npm run seed` — seed database with sample data

## Repo Author

- iltStudent07