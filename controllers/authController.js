const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const register = async (req, res) => {
  try {
    // รับค่า email และ password จาก Request Body
    const { email, password } = req.body;

    // ตรวจสอบเบื้องต้นว่าส่งข้อมูลมาครบไหม (Request Validation)
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    // เช็กว่าอีเมลนี้มีในระบบหรือยัง
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // เข้ารหัสผ่าน (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // บันทึกข้อมูลลงฐานข้อมูล
    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );

    // ส่ง Response กลับไปบอกว่าสร้างสำเร็จ (Status 201 Created)
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  register
};