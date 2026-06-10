const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/logController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/activity', verifyToken, getActivityLogs);

module.exports = router;