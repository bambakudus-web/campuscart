# CampusCart — Level 3 (Advanced)
### Codveda Technologies Full-Stack Development Internship
**Intern:** Harruna Abdul Kudus

Level 3 builds on Level 2's React + JWT + Sequelize foundation, adding real-time
communication, an alternative API style, and full deployment.

## Task 2: WebSockets for Real-Time Communication — ✅ Complete

Real-time buyer-seller chat, replacing the WhatsApp deep-link workaround from
Level 2 with actual in-app messaging.

### Objectives Covered
- ✅ WebSockets set up with Express and React (`socket.io` + `socket.io-client`)
- ✅ Bidirectional real-time communication (both sides see messages instantly, no refresh)
- ✅ User-specific conversations, not a single global chatroom
- ✅ Efficient updates: messages only reach sockets actually in that conversation's room

### How It Works

**Conversation identity:** a thread is uniquely identified by `(listing_id, buyer_id)`.
The buyer is always the same person whether they're actively typing or the
seller is replying — this keeps one continuous thread instead of splitting
into "messages I sent" vs "messages I received."

**Authentication:** the Socket.io connection is authenticated with the same
JWT the REST API uses, sent via `socket.handshake.auth.token`. See
`backend/socket.js` — `io.use(...)` verifies the token before allowing any
connection, and every event handler re-verifies the user is actually a
participant in that conversation (never trusts a previously-joined room as
proof of authorization).

**Flow:**
1. Frontend opens a chat page at `/chat/:listingId/:buyerId`
2. `Chat.jsx` loads message history over REST (`GET /api/messages/:listingId/:buyerId`)
3. It emits `join_conversation` over the socket to join that thread's room
4. Sending a message emits `send_message`; the server saves it to MySQL via
   the `Message` model, then broadcasts `new_message` to everyone in that
   room (both participants see it appear instantly)

**Inbox:** `GET /api/messages/conversations` returns every thread a user is
part of (as buyer or seller), each with the other participant's name, the
listing being discussed, and a preview of the last message — this powers
the `/messages` page.

### New Backend Pieces
- `models/Message.js` — the message schema
- `models/index.js` — relationships: `Listing hasMany Message`, `User hasMany Message` (as buyer and as sender)
- `controllers/messagesController.js` — conversation list + history, with participant authorization
- `routes/messages.js`
- `socket.js` — the Socket.io server itself

### New Frontend Pieces
- `context/SocketContext.jsx` — connects when logged in, disconnects on logout
- `pages/Messages.jsx` — conversation inbox
- `pages/Chat.jsx` — the actual chat thread, with live updates
- `ListingDetail.jsx` now offers **"Chat with Seller"** as the primary contact method, with WhatsApp kept as a fallback link

## Task 3: GraphQL API Development — ✅ Complete

A GraphQL API running alongside the existing REST API on the same backend
and port, as an alternative way to query the same data.

### Objectives Covered
- ✅ GraphQL server set up with Apollo Server (`apollo-server-express`)
- ✅ Queries, mutations, and resolvers defined (`graphql/typeDefs.js`, `graphql/resolvers.js`)
- ✅ Authentication handled in GraphQL — the same JWT used by REST is read
  from the `Authorization` header and verified in the `context` function;
  resolvers call `requireAuth(context)` to enforce it per-operation
- ✅ Optimized queries — the `seller` field is eager-loaded via Sequelize's
  `include` in the same query as the listings themselves, avoiding an N+1
  problem where fetching 20 listings would otherwise trigger 20 additional
  lookups for their sellers

### Why REST and GraphQL Both Exist Here
The task asks for GraphQL "as an alternative to REST," not a replacement —
so both live side by side. The frontend still uses the REST API (Levels 1–2
were built on it), and GraphQL is available as a separate, fully working
endpoint at `/graphql` that demonstrates the same data through a different
query style.

### Available Operations

```graphql
# Browse listings
query {
  listings(category: "books", status: "available") {
    id
    title
    price
    seller { name phone }
  }
}

# Log in
mutation {
  login(email: "ama.serwaa@kstu.edu.gh", password: "password123") {
    token
    user { id name }
  }
}

# Create a listing (requires Authorization: Bearer <token> header)
mutation {
  createListing(input: { title: "Textbook", price: 40, category: "books" }) {
    id
    title
  }
}
```

### Try It
1. Start the backend as usual
2. Open `http://localhost:5000/graphql` in a browser — Apollo's built-in
   Playground/sandbox lets you run queries and mutations interactively
3. For protected operations, add an HTTP header:
   `{ "Authorization": "Bearer <token from a login mutation>" }`

## Setup

```bash
# backend/.env needs one more variable:
FRONTEND_URL=http://localhost:5173   # used for Socket.io CORS
```

No new database setup needed beyond what Level 2 already has — `sequelize.sync({ alter: true })`
will create the new `messages` table automatically on next server start.

## Try It (Chat)
2. In another browser (or incognito window), log in as that seller and go to Messages
3. Send messages from both sides — they should appear instantly on both screens without refreshing
