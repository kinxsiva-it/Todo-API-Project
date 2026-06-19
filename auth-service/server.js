const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
require('dotenv').config();

const pool = require('./config/db');
const createUsersTableQuery = require('./models/userModel');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.use('/api/auth', csrfProtection, authRoutes);

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Form tampered with (Invalid CSRF Token)' });
    }
    console.error(`[Auth Service ERROR]: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error', message: 'Auth Service encountered an error' });
});

const initializeDatabase = async () => {
  if (pool.connected) return;
  try {
    await pool.query(createUsersTableQuery);
    console.log('Users table is ready (Auth Service)'); 
  } catch (error) {
    console.error('Error initializing Auth database:', error); 
  }
};

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    await initializeDatabase();
    if (require.main === module) {
        app.listen(PORT, () => {
            console.log(`🔐 Auth Service is running on port ${PORT}`);
        });
    }
};

startServer();

module.exports = { app, initializeDatabase };