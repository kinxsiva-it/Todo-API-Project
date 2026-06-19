const express = require('express');
const router = express.Router();

const logController = require('../controllers/logController'); 

const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/activity', verifyToken, authorizeRoles('admin'), logController.getActivityLogs);


module.exports = router;