const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getPool } = require('../config/database');
const { authenticateToken, ROLES } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isInt({ min: 1, max: 3 }).withMessage('Valid role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role } = req.body;
    const pool = getPool();

    // Check if user already exists
    const existingUser = await pool.request()
      .input('email', email)
      .query('SELECT user_id FROM Users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get next user ID
    const nextIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(user_id), 0) + 1 as next_id FROM Users');
    const nextId = nextIdResult.recordset[0].next_id;

    // Create user
    await pool.request()
      .input('userId', nextId)
      .input('firstName', firstName)
      .input('lastName', lastName)
      .input('email', email)
      .input('passwordHash', hashedPassword)
      .input('role', role)
      .input('createdAt', new Date())
      .query(`
        INSERT INTO Users (user_id, first_name, last_name, email, password_hash, role, created_at)
        VALUES (@userId, @firstName, @lastName, @email, @passwordHash, @role, @createdAt)
      `);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('Registration error: JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error: JWT secret not set' });
    }
    const token = jwt.sign(
      { userId: nextId, role: role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        userId: nextId,
        firstName,
        lastName,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const pool = getPool();

    // Find user
    const userResult = await pool.request()
      .input('email', email)
      .query('SELECT user_id, first_name, last_name, email, role, created_at, password_hash FROM Users WHERE email = @email');

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.recordset[0];

    // Verify password against stored bcrypt hash
    if (!user.password_hash) {
      return res.status(500).json({ message: 'User password not set. Contact administrator.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('Login error: JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error: JWT secret not set' });
    }
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
