# CampusCart Backend — Level 2

This backend satisfies **two** of the three Level 2 tasks at once, since in a real
project authentication and the database layer are built together rather than as
separate services. The sections below map each part of the code to the task
objectives it demonstrates.

## Task 2: Authentication and Authorization

- ✅ `bcryptjs` hashes passwords before they're ever saved (`controllers/authController.js`)
- ✅ JWTs issued on register/login, signed with `JWT_SECRET`, expiring after `JWT_EXPIRES_IN`
- ✅ `middleware/auth.js` (`requireAuth`) verifies the token on every protected route
- ✅ `requireRole` middleware supports role-based restriction (e.g. admin-only routes)
- ✅ Listing create/update/delete routes are protected — only the logged-in seller
  who owns a listing (or an admin) can edit/delete it, enforced server-side in
  `controllers/listingsController.js`, not just hidden in the UI

**Note on token storage:** this project stores the JWT in the browser's
`localStorage` (see `frontend/src/context/AuthContext.jsx`) for simplicity in a
local dev environment. The more production-secure approach is an HTTP-only
cookie, which prevents the token from being readable by JavaScript (mitigating
XSS token theft) — that would require the API and frontend to share a domain
or be configured with `credentials: 'include'` and matching CORS settings.
Documented here as the tradeoff made for this stage of the project.

## Task 3: Database Integration

- ✅ Sequelize ORM replaces the raw `mysql2` queries from Level 1
- ✅ `models/User.js` and `models/Listing.js` define schemas with field-level validation
- ✅ `models/index.js` defines the relationship: **one User has many Listings**,
  **one Listing belongs to one User** (`seller_id` foreign key, cascading delete)
- ✅ Validation is enforced at the model layer (e.g. price must be > 0, email must
  be valid, title length constraints) — invalid data never reaches the database
- ✅ `sequelize.sync({ alter: true })` keeps the schema in sync with the models
  during development

## Setup

```bash
npm install
cp .env.example .env
# edit .env: DB credentials + a real JWT_SECRET (any long random string)

npm run dev        # starts the API on http://localhost:5000
npm run seed        # (optional, separate terminal) populate sample users + listings
```

The database `campuscart_db_v2` is separate from Level 1's `campuscart_db` so the
two projects don't collide. Create it first:

```sql
CREATE DATABASE campuscart_db_v2;
GRANT ALL PRIVILEGES ON campuscart_db_v2.* TO 'campuscart_user'@'localhost';
FLUSH PRIVILEGES;
```

(Reuses the `campuscart_user` created in Level 1 — no need to make a new one.)

## Endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/auth/me` | Yes | Get the logged-in user's profile |
| GET | `/api/listings` | No | Browse all listings (`?category=`, `?status=`) |
| GET | `/api/listings/mine` | Yes | Get the logged-in user's own listings |
| GET | `/api/listings/:id` | No | Get a single listing |
| POST | `/api/listings` | Yes | Create a listing (owned by the logged-in user) |
| PUT | `/api/listings/:id` | Yes (owner/admin) | Update a listing |
| DELETE | `/api/listings/:id` | Yes (owner/admin) | Delete a listing |

## Example: Register + Create a Listing

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Kofi Boateng",
  "email": "kofi@kstu.edu.gh",
  "password": "securepass123",
  "phone": "0244123456"
}
```

Response includes a `token` — use it as a Bearer token for protected routes:

```http
POST /api/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Scientific Calculator",
  "description": "Casio fx-991ES",
  "price": 35,
  "category": "electronics",
  "item_condition": "used"
}
```

Note there's no `seller_id` in the request body — it's taken from the verified
JWT, so no one can post a listing pretending to be someone else.
