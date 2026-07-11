const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'CampusCart API v2 (Sequelize + JWT) is running', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Sync Sequelize models with the database, then start the server.
// { alter: true } lets Sequelize adjust existing tables to match the models
// during development, without needing full migration files for this project.
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Models synced with database');
    app.listen(PORT, () => {
      console.log(`🚀 CampusCart API v2 running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err.message);
  });
