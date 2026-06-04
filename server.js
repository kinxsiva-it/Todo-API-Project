const express = require('express');
require('dotenv').config();

const pool = require('./config/db');
const createUsersTableQuery = require('./models/userModel');
const createTodosTableQuery = require('./models/todoModel');


const app = express();
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const todoRoutes = require('./routes/todoRoutes');
app.use('/api/todos', todoRoutes);

// ฟังก์ชันสำหรับสร้างตาราง (Migration)
const initializeDatabase = async () => {
  try {
    await pool.query(createUsersTableQuery);
    console.log('Users table is ready');
    
    await pool.query(createTodosTableQuery);
    console.log('Todos table is ready');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // สั่งรันสร้างตารางทันทีที่ Server เปิด
  await initializeDatabase(); 
});