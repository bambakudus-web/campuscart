const express = require('express');
const cors = require('cors');
require('dotenv').config();

const listingsRoutes = require('./routes/listings');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'CampusCart API is running', status: 'ok' });
});

// Routes
app.use('/api/listings', listingsRoutes);

// 404 handler — must come after all valid routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Centralized error handler — must have 4 args to be recognized by Express
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CampusCart API running on http://localhost:${PORT}`);
});
