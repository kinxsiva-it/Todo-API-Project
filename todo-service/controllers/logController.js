const db = require('../config/db');

const getActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id; 

    const result = await db.query(
      'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50'
    ); 

    res.status(200).json({
      success: true,
      message: 'ดึงข้อมูลประวัติกิจกรรมสำเร็จ',
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
};

module.exports = { getActivityLogs };