# CampusCart — Level 2 (Intermediate)
### Codveda Technologies Full-Stack Development Internship
**Intern:** Harruna Abdul Kudus

Level 2 upgrades CampusCart with a proper database layer, authentication, and a
React frontend — all 3 intermediate tasks completed.

## Folder Structure

```
level2-intermediate/
├── backend/                # Task 2 (Auth) + Task 3 (Database Integration)
│   ├── config/database.js   # Sequelize connection
│   ├── models/               # User, Listing, and their relationship
│   ├── controllers/          # auth + listings logic, ownership checks
│   ├── middleware/auth.js    # JWT verification, role guard
│   ├── routes/
│   ├── seed.js                # sample users + listings
│   └── README.md               # detailed task-by-task breakdown
└── frontend/                 # Task 1: React rebuild
    ├── src/
    │   ├── api/, context/, components/, pages/
    └── README.md
```

## Why Auth and Database Share One Backend

Task 2 (Authentication) and Task 3 (Database Integration) are listed
separately in the internship task list, but in practice they're the same
codebase — you can't have secure, ownership-based authorization without a
proper database layer to check who owns what. Rather than building two
disconnected demo services, this backend does both together, the way it
would be built on a real project. Each task's specific objectives are
checked off individually in `backend/README.md`.

## How to Run Everything

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env   # set DB credentials + a JWT_SECRET
# create the database first (see backend/README.md)
npm run dev
npm run seed            # optional, in a separate terminal
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## What's New Since Level 1

| Level 1 | Level 2 |
|---|---|
| Raw SQL queries | Sequelize ORM with model validation |
| No relationships | Listings belong to Users (foreign key + cascade) |
| No accounts | Register/login with hashed passwords + JWT |
| Anyone can edit/delete anything | Only the listing's owner (or admin) can edit/delete |
| Plain HTML/CSS/JS | React with routing, context, and reusable components |

## Next: Level 3 Preview
- Deploy both frontend and backend
- Add real-time features (Socket.io) or a GraphQL API
- Performance optimization pass
