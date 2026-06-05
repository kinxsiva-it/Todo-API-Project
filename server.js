const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const morgan = require('morgan');
require('dotenv').config();

const pool = require('./config/db');
const createUsersTableQuery = require('./models/userModel');
const createTodosTableQuery = require('./models/todoModel');

const app = express();

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

app.use(express.json());
app.use(cors());

app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// --- 3. Error Handling Middleware ---
// จัดการ Error 404 (Route Not Found)
app.use((req, res, next) => {
    res.status(404).json({ 
        error: 'Not Found', 
        message: `Route ${req.method} ${req.originalUrl} does not exist` 
    });
});

// [Requirement 2: Error Logging]
// ตัวตาข่ายรองรับ Error 500 (Global Error Handler)
app.use((err, req, res, next) => {
    // ให้ Winston ทำหน้าที่บันทึก Error Log แบบละเอียด
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl
    });

    res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Something went wrong on our end!' 
    });
});


const initializeDatabase = async () => {
  try {
    await pool.query(createUsersTableQuery);
    logger.info('Users table is ready'); 
    
    await pool.query(createTodosTableQuery);
    logger.info('Todos table is ready'); 
  } catch (error) {
    logger.error('Error initializing database:', error); 
    process.exit(1); 
  }
};

const PORT = process.env.PORT || 3000;
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`); 
  });
});