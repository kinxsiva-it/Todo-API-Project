const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const pool = require('./config/db');
const createUsersTableQuery = require('./models/userModel');
const createTodosTableQuery = require('./models/todoModel');
const createSystemLogsTableQuery = require('./models/systemLogModel');
const createActivityLogsTableQuery = require('./models/activityLogModel');
const cookiesParser = require('cookie-parser');
const csrf = require('csurf');

const app = express();

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

const loggerMiddleware = require('./middlewares/loggerMiddleware');
const logRoutes = require('./routes/logRoutes');

app.use(express.json());
app.use(cors());
app.use(cookiesParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const csrfProtection = csrf({ cookie: true });
const csrfExceptSwagger = (req, res, next) => {
  const referer = req.headers['referer'] || '';
  if (referer.includes('/api-docs')) {
    return next();
  }
  return csrfProtection(req, res, next);
};

app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.use(loggerMiddleware);

app.use('/api/auth', csrfExceptSwagger, authRoutes);
app.use('/api/todos', csrfExceptSwagger, todoRoutes);
app.use('/api/logs', csrfExceptSwagger, logRoutes);


app.use(async (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Form tampered with (Invalid CSRF Token)' });
    }

    const timestamp = new Date().toLocaleString('th-TH');
    const userId = req.user ? req.user.user_id : null;

   
    const errorResponseBody = {
        error: 'Internal Server Error',
        message: 'Something went wrong on our end!'
    };

    console.error(`[${timestamp}] ERROR: ${err.message}`);

    try {
    const query = `
        INSERT INTO system_logs (user_id, level, message, meta)
        VALUES ($1, $2, $3, $4)
    `;
    const values = [
        userId,
        'error',
        err.message,
        JSON.stringify({
            method: req.method,
            url: req.originalUrl,
            stack: err.stack,
            requestBody: req.body,
            responseBody: errorResponseBody
        })
    ];
    await pool.query(query, values);
    } catch (dbError) {
        console.error(' ระบบเขียน Log ลง DB ล้มเหลว:', dbError.message);
    }

    res.status(500).json(errorResponseBody);
});

const initializeDatabase = async () => {
  if (pool.connected) return;
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
    console.error(error);
  }
};

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await initializeDatabase();
    
    if (require.main === module) {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
};

startServer();

module.exports = { app, initializeDatabase };
