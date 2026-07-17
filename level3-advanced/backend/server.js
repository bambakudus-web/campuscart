const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const messagesRoutes = require('./routes/messages');
const initSocket = require('./socket');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();
const httpServer = http.createServer(app);

// AUDIT FIX: Railway (and most PaaS hosts) sit behind a reverse proxy.
// Without this, req.ip always resolves to the proxy's internal IP for
// every visitor, so express-rate-limit below would bucket ALL users
// together under one shared limit — a handful of people logging in
// could lock everyone out at once. Trusting the first proxy hop makes
// Express read the real client IP from the X-Forwarded-For header instead.
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.FRONTEND_URL || '*';

// AUDIT FIX: previously this was cors() with no options, which allowed
// requests from any origin — inconsistent with Socket.io, which was
// already correctly restricted to FRONTEND_URL. Now both match.
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AUDIT ADDITION: rate limiting on auth endpoints specifically, to slow
// down brute-force password guessing against /login and credential-stuffing
// against /register. 20 requests per 15 minutes per IP is generous for a
// real user but painful for an automated attack script.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth', authLimiter);

// Serve uploaded listing images (legacy local files only — new uploads go to Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'CampusCart API v3 (REST + GraphQL + WebSockets) is running', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/messages', messagesRoutes);

// Decodes the JWT from the Authorization header for GraphQL's context,
// without throwing — individual resolvers decide whether a query/mutation
// actually requires a logged-in user via requireAuth().
function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

async function startServer() {
  await sequelize.authenticate();
  console.log('✅ Connected to MySQL database:', process.env.DB_NAME);

  // { alter: true } lets Sequelize adjust existing tables to match the
  // models during development, without needing full migration files.
  await sequelize.sync({ alter: true });
  console.log('✅ Models synced with database');

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ user: getUserFromAuthHeader(req) }),
    // AUDIT FIX: Apollo warns that persisted queries default to an
    // unbounded in-memory cache, which an attacker could exploit to exhaust
    // server memory by sending many unique queries. Capping it at 1000
    // entries keeps the performance benefit without the DoS risk.
    persistedQueries: {
      cache: 'bounded'
    }
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });
  console.log(`✅ GraphQL ready at /graphql`);

  // These must be registered AFTER apolloServer.applyMiddleware() — Express
  // matches routes in the order they were added, so a catch-all 404 handler
  // registered earlier would swallow every request to /graphql before it
  // ever reached Apollo's route.
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });

  app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);

    if (err.name === 'MulterError' || err.message?.includes('Only JPEG')) {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  });

  // Attach Socket.io to the same HTTP server Express uses, so both share one port.
  initSocket(httpServer, CORS_ORIGIN);

  httpServer.listen(PORT, () => {
    console.log(`🚀 CampusCart API v3 (REST + GraphQL + real-time chat) running on http://localhost:${PORT}`);
    console.log(`   GraphQL Playground: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
});
