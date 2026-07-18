# CampusCart — Level 1 (Basic)
### Codveda Technologies Full-Stack Development Internship
**Intern:** Harruna Abdul Kudus

CampusCart is a buy/sell/trade marketplace for KsTU students. This Level 1 submission covers all three basic tasks, built as one coherent project that will continue to grow through Level 2 (React + Auth + DB) and Level 3 (full deployed app + real-time/GraphQL).

## Folder Structure

```
level1-basic/
├── task1-setup/
│   └── SETUP.md          # Environment setup: Node, npm, Git, MySQL, terminal basics
├── task2-rest-api/
│   ├── server.js          # Express app entry point
│   ├── config/db.js       # MySQL connection pool
│   ├── controllers/       # CRUD logic + validation
│   ├── routes/            # /api/listings routes
│   ├── schema.sql         # Database schema + seed data
│   └── README.md          # API documentation
└── task3-frontend/
    ├── index.html          # Marketplace UI
    ├── style.css           # Styling
    └── script.js           # Fetches/posts/deletes listings via the API
```

## How to Run Everything

1. Follow `task1-setup/SETUP.md` to install Node, Git, and MySQL.
2. Set up and start the API:
   ```bash
   cd task2-rest-api
   npm install
   cp .env.example .env   # fill in your MySQL credentials
   mysql -u root -p < schema.sql
   npm run dev
   ```
3. Open `task3-frontend/index.html` in your browser (or serve it with the VS Code "Live Server" extension). It talks to the API at `http://localhost:5000`.

## What Each Task Demonstrates

| Task | Skill Demonstrated |
|---|---|
| Task 1 | Dev environment setup, Git basics, database provisioning |
| Task 2 | RESTful API design, CRUD, input validation, error handling |
| Task 3 | DOM manipulation, Fetch API, dynamic rendering, responsive CSS |

## Next Steps (Level 2 & 3 preview)
- Rebuild the frontend in React
- Add JWT-based authentication for sellers
- Move to a proper ORM (Sequelize/Prisma) with relationships
- Deploy the full stack and add real-time features
