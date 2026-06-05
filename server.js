const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const createUsersTableQuery = require('./models/userModel');
const createTodosTableQuery = require('./models/todoModel');
const createSystemLogsTableQuery = require('./models/systemLogModel');
const createActivityLogsTableQuery = require('./models/activityLogModel');

const app = express();

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

const loggerMiddleware = require('./middlewares/loggerMiddleware');

app.use(express.json());
app.use(cors());

app.use(loggerMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.use(async (err, req, res, next) => {
    const timestamp = new Date().toLocaleString('th-TH');
    const userId = req.user ? req.user.user_id : null;

   
    const errorResponseBody = {
        error: 'Internal Server Error',
        message: 'Something went wrong on our end!'
    };

    console.error(`[${timestamp}] ERROR: ${err.message}`);

    try {
        const query = `
            INSERT INTO system_logs (user_id, level, message, method, url, stack_trace, request_body, response_body)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        const values = [
            userId, 
            'error', 
            err.message, 
            req.method, 
            req.originalUrl, 
            err.stack,
            req.body,       
            errorResponseBody 
        ];
        
        await pool.query(query, values);
    } catch (dbError) {
        console.error(' ระบบเขียน Log ลง DB ล้มเหลว:', dbError.message);
    }

    res.status(500).json(errorResponseBody);
});

const initializeDatabase = async () => {
  try {
    await pool.query(createUsersTableQuery);
    console.log('Users table is ready'); 
    
    await pool.query(createTodosTableQuery);
    console.log('Todos table is ready'); 

    await pool.query(createSystemLogsTableQuery);
    console.log('System Logs table is ready');

    await pool.query(createActivityLogsTableQuery);
    console.log('Activity Logs table is ready');

  } catch (error) {
    console.error('Error initializing database:', error); 
    process.exit(1); 
  }
};

const PORT = process.env.PORT || 3000;
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); 
  });
});