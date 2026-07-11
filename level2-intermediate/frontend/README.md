# CampusCart Frontend — Level 2, Task 1

A React rebuild of the Level 1 vanilla JS frontend, now with routing, auth-aware
UI, and a proper component structure.

## Objectives Covered

- ✅ Project set up with React (via Vite)
- ✅ Functional components + hooks for state management (`useState`, `useEffect`, `useContext`)
- ✅ API calls with loading and error states handled explicitly
- ✅ Reusable UI components (`ListingCard`, `Navbar`, `ProtectedRoute`)

## Structure

```
src/
├── api/client.js           # fetch wrapper, attaches JWT automatically
├── context/AuthContext.jsx # global auth state (login/register/logout, session restore)
├── components/
│   ├── Navbar.jsx           # auth-aware nav (shows login/signup or user + logout)
│   ├── ListingCard.jsx      # reusable listing display, with optional owner actions
│   └── ProtectedRoute.jsx   # redirects to /login if not authenticated
├── pages/
│   ├── Home.jsx              # public browse + category filter
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── PostListing.jsx       # protected
│   └── MyListings.jsx        # protected — delete / mark-as-sold
├── App.jsx                   # routes
└── main.jsx                  # entry point, wraps App in BrowserRouter
```

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` by default (Vite's dev server) and expects the
backend running on `http://localhost:5000` (see `src/api/client.js` for the
base URL).

## What Changed From Level 1's Vanilla JS Version

| Level 1 (vanilla JS) | Level 2 (React) |
|---|---|
| Single `index.html` + `script.js` | Component-based, multiple pages |
| Manual DOM manipulation (`innerHTML`) | Declarative rendering via JSX |
| No auth — anyone could post/delete anything | Auth required to post/edit/delete; ownership enforced |
| No routing | `react-router-dom` — real URLs for each page |
| Global mutable state via variables | `useState` + `AuthContext` for shared state |
