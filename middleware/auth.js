const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('Auth middleware error: JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error: JWT secret not set' });
    }
    const decoded = jwt.verify(token, jwtSecret);
    
    // Get user details from database
    const pool = getPool();
    const result = await pool.request()
      .input('userId', decoded.userId)
      .query('SELECT user_id, first_name, last_name, email, role FROM Users WHERE user_id = @userId');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = result.recordset[0];
    // Ensure role is numeric for reliable comparisons
    if (req.user && req.user.role !== undefined) {
      req.user.role = Number(req.user.role);
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

// Role constants
const ROLES = {
  STUDENT: 1,
  TEACHER: 2,
  IT_COORDINATOR: 3
};

module.exports = { authenticateToken, requireRole, ROLES };
