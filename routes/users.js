const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, requireRole, ROLES } = require('../middleware/auth');

const router = express.Router();

// Get all users (IT coordinators only)
router.get('/', [
  authenticateToken,
  requireRole(ROLES.IT_COORDINATOR)
], async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        user_id,
        first_name,
        last_name,
        email,
        role,
        created_at
      FROM Users
      ORDER BY created_at DESC
    `);

    res.json({
      users: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get users by role (IT coordinators only)
router.get('/role/:role', [
  authenticateToken,
  requireRole(ROLES.IT_COORDINATOR)
], async (req, res) => {
  try {
    const { role } = req.params;
    const pool = getPool();

    if (![1, 2, 3].includes(parseInt(role))) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const result = await pool.request()
      .input('role', role)
      .query(`
        SELECT 
          user_id,
          first_name,
          last_name,
          email,
          role,
          created_at
        FROM Users
        WHERE role = @role
        ORDER BY first_name, last_name
      `);

    res.json({
      users: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ message: 'Server error fetching users by role' });
  }
});

// Get user statistics (IT coordinators only)
router.get('/stats/overview', [
  authenticateToken,
  requireRole(ROLES.IT_COORDINATOR)
], async (req, res) => {
  try {
    const pool = getPool();

    const statsResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 1 THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN role = 2 THEN 1 ELSE 0 END) as teachers,
        SUM(CASE WHEN role = 3 THEN 1 ELSE 0 END) as it_coordinators
      FROM Users
    `);

    res.json({ stats: statsResult.recordset[0] });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error fetching user statistics' });
  }
});

module.exports = router;
