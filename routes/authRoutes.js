const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

// กำหนดเส้นทางให้ Method POST วิ่งไปหาฟังก์ชัน register
router.post('/register', register);

module.exports = router;