# Gramika - Server

Basic MERN backend for Gramika demo.

Setup

1. Copy `.env.example` to `.env` and provide values (MongoDB URI, JWT secret).

2. Install dependencies:

```bash
cd server
npm install
```

3. Seed sample products (optional):

```bash
npm run seed
```

4. Start dev server:

```bash
npm run dev
```

API endpoints

- `POST /api/auth/register` { name, email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/orders` (requires `Authorization: Bearer <token>`)

