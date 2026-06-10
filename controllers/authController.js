const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async (req, res, next) => {
  try {
    console.log('Received Body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🌟 เริ่ม Transaction (ล็อกการ Insert ให้เซฟลง 2 ตารางพร้อมกัน)
    await pool.query('BEGIN');

    // 1. บันทึกลงตาราง users
    const newUserResult = await pool.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING id, email, created_at',
      [email]
    );
    const newUser = newUserResult.rows[0];

    // 2. บันทึกลงตาราง user_credentials โดยใช้ id จากตารางแรก
    await pool.query(
      'INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)',
      [newUser.id, hashedPassword]
    );

    // ยืนยันการบันทึกข้อมูลทั้ง 2 ตาราง
    await pool.query('COMMIT');

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    // ถ้าระหว่างทางเกิดพัง ให้ย้อนข้อมูลกลับทั้งหมด
    await pool.query('ROLLBACK');
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // 🌟 ใช้ JOIN เพื่อดึงข้อมูลจาก 2 ตารางมาตรวจสอบพร้อมกัน
    const userResult = await pool.query(`
      SELECT u.id, u.email, uc.password_hash 
      FROM users u
      JOIN user_credentials uc ON u.id = uc.user_id
      WHERE u.email = $1
    `, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // เปรียบเทียบรหัสผ่านกับ password_hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // 🌟 ส่ง Token ผ่าน HttpOnly Cookie แทนการคืนค่าทาง JSON
    res.cookie('token', token, {
      httpOnly: true, // ป้องกัน JavaScript แอบดึงคุกกี้ (กัน XSS)
      secure: process.env.NODE_ENV === 'production', // บังคับใช้ https บน Production
      sameSite: 'strict', // ป้องกันการส่งคุกกี้ข้ามเว็บ (กัน CSRF เบื้องต้น)
      maxAge: 24 * 60 * 60 * 1000 // หมดอายุใน 24 ชั่วโมง
    });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};