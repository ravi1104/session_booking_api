# Session Booking API

Simple backend built with Node.js, TypeScript, Express, and MongoDB.

## Tech Stack
Node.js, TypeScript, Express.js, MongoDB, Mongoose

## Setup & Run

1. Install dependencies:
```bash
npm install
```

2. Configure `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/session_booking
```

3. Start server:
```bash
npm run dev
```

## APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/users` | Create user |
| `POST` | `/sessions` | Create session |
| `GET` | `/sessions/available?dateTimestamp={ms}` | Get available sessions (MongoDB Aggregation) |
| `POST` | `/sessions/:id/book` | Book session |
| `PATCH` | `/sessions/:id/complete` | Complete session |
| `GET` | `/users/:id/sessions` | Get user sessions (MongoDB Aggregation) |

## Testing
Import `postman_collection.json` directly into Postman to test all endpoints.
