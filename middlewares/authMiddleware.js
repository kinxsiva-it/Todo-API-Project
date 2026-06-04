const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  // ดึงค่า Token จากส่วนหัวของคำขอ (Authorization Header)
  const authHeader = req.headers['authorization'];

  // เช็กว่ามี Header ส่งมาไหม และต้องขึ้นต้นด้วยคำว่า 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // [DoD] ส่ง HTTP Status 401 ทันทีหากไม่มี Token
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // ตัดคำว่า "Bearer " ออก เพื่อเอาแค่ตัวก้อน Token จริงๆ (ตัวที่ 2 ของ Array)
  const token = authHeader.split(' ')[1];

  try {
    // [DoD] ตรวจสอบความถูกต้อง (Verify) และถอดรหัส Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // [DoD] ส่งข้อมูล user_id เข้าสู่ Context ของ Request 
    // โดยการสร้างตัวแปร req.user ขึ้นมาเก็บค่าที่ถอดรหัสได้ (เช่น { user_id: 1, iat: ..., exp: ... })
    req.user = decoded;

    // เมื่อยามตรวจบัตรผ่านเรียบร้อย ให้เรียก next() เพื่อเปิดประตูให้ไปทำงานที่ Controller ถัดไป
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;