# CampusCart
### Codveda Technologies — Full-Stack Development Internship
**Intern:** Harruna Abdul Kudus &middot; Kumasi Technical University

CampusCart is a buy/sell/trade marketplace built for KsTU students, developed
across all three levels of the internship as one continuously evolving
product rather than three disconnected demos.

🔗 **Live site:** [brilliant-tenderness-production-b963.up.railway.app](https://brilliant-tenderness-production-b963.up.railway.app)

## Project Structure

| Folder | Level | What it covers |
|---|---|---|
| [`level1-basic/`](./level1-basic) | Level 1 (Basic) | Express + MySQL REST API, vanilla HTML/CSS/JS frontend |
| [`level2-intermediate/`](./level2-intermediate) | Level 2 (Intermediate) | React frontend, JWT authentication, Sequelize ORM |
| [`level3-advanced/`](./level3-advanced) | Level 3 (Advanced) | Real-time chat (Socket.io), GraphQL API, full deployment |

Each folder has its own README with setup instructions and a breakdown of
which objectives it satisfies.

## What CampusCart Does

Students can browse, post, and manage listings for items they want to buy,
sell, or trade — textbooks, electronics, furniture, and more. By Level 3,
the app includes:

- **Authentication** — register/login with bcrypt-hashed passwords, JWT
  sessions, and a 5-minute inactivity auto-logout
- **Listings** — full CRUD, multi-photo uploads with cover photo selection
  (Cloudinary-backed so images persist across redeploys), category
  filtering, and text search
- **Real-time chat** — a floating messenger-style widget (Socket.io) so
  buyers and sellers can message instantly without leaving the page
- **Two API styles** — REST (used by the frontend) and a fully working
  GraphQL API running alongside it, both enforcing the same authentication
  and ownership rules
- **Security hardening** — rate limiting on auth endpoints, CORS locked to
  the deployed frontend's origin, password strength requirements, and a
  fix for a proxy-related rate-limiter bug found during a security audit
- **Fully deployed** — backend, frontend, and MySQL all live on Railway

## Tech Stack

**Backend:** Node.js, Express, Sequelize, MySQL, Socket.io, Apollo Server (GraphQL), JWT, bcrypt, Multer, Cloudinary
**Frontend:** React, Vite, React Router, Socket.io Client, Lucide icons
**Deployment:** Railway (backend, frontend, and database)

## Author

Harruna Abdul Kudus ([@bambakudus-web](https://github.com/bambakudus-web)) — 2nd-year Computer Science student at Kumasi Technical University, Ghana.
