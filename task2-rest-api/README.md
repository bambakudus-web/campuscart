# Task 2: CampusCart REST API

A simple Express + MySQL REST API with full CRUD operations on a `listings` resource — students post items they want to buy, sell, or trade.

## Objectives Covered
- ✅ Express server set up
- ✅ API routes for CRUD operations (Create, Read, Update, Delete)
- ✅ Tested with Postman / Thunder Client
- ✅ Error handling and proper HTTP status codes

## Setup

```bash
npm install
cp .env.example .env
# edit .env with your MySQL credentials

# create the database and table
mysql -u root -p < schema.sql

npm run dev   # or: npm start
```

Server runs at `http://localhost:5000`.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/listings` | Get all listings (optional `?category=` and `?status=` filters) |
| GET | `/api/listings/:id` | Get a single listing by ID |
| POST | `/api/listings` | Create a new listing |
| PUT | `/api/listings/:id` | Update an existing listing |
| DELETE | `/api/listings/:id` | Delete a listing |

## Example Requests

**Create a listing**
```http
POST /api/listings
Content-Type: application/json

{
  "title": "Scientific Calculator",
  "description": "Casio fx-991ES, works perfectly",
  "price": 35.00,
  "category": "electronics",
  "item_condition": "used",
  "seller_name": "Kofi Boateng",
  "seller_contact": "0244123456"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "title": "Scientific Calculator",
    "price": "35.00",
    "category": "electronics",
    "status": "available",
    "...": "..."
  }
}
```

**Filter listings**
```http
GET /api/listings?category=books&status=available
```

## HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Resource created (POST) |
| 400 | Validation error |
| 404 | Listing not found |
| 500 | Server error |

## Testing
All endpoints were manually tested with Postman, including:
- Valid creation → 201
- Missing required field → 400 with validation message
- Fetching a non-existent ID → 404
- Successful update and delete flows
