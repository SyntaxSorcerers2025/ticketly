const express = require('express');
const { body, validationResult } = require('express-validator');
const { getPool } = require('../config/database');
const { authenticateToken, requireRole, ROLES } = require('../middleware/auth');

const router = express.Router();

// Get updates for a ticket
router.get('/ticket/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const pool = getPool();

    // First check if user has access to this ticket
    const ticketCheck = await pool.request()
      .input('ticketId', ticketId)
      .input('userId', req.user.user_id)
      .query(`
        SELECT ticket_id, created_by 
        FROM Tickets 
        WHERE ticket_id = @ticketId 
        ${req.user.role === ROLES.IT_COORDINATOR ? '' : 'AND created_by = @userId'}
      `);

    if (ticketCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found or access denied' });
    }

    // Get updates for the ticket
    const result = await pool.request()
      .input('ticketId', ticketId)
      .query(`
        SELECT 
          u.update_id,
          u.ticket_id,
          u.message,
          u.created_at,
          u.updated_by,
          usr.first_name,
          usr.last_name
        FROM Updates u
        LEFT JOIN Users usr ON u.updated_by = usr.user_id
        WHERE u.ticket_id = @ticketId
        ORDER BY u.created_at ASC
      `);

    res.json({
      updates: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ message: 'Server error fetching updates' });
  }
});

// Add update to a ticket
router.post('/', [
  authenticateToken,
  body('ticketId').isInt().withMessage('Valid ticket ID is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ticketId, message } = req.body;
    const pool = getPool();

    // Check if user has access to this ticket
    const ticketCheck = await pool.request()
      .input('ticketId', ticketId)
      .input('userId', req.user.user_id)
      .query(`
        SELECT ticket_id, created_by 
        FROM Tickets 
        WHERE ticket_id = @ticketId 
        ${req.user.role === ROLES.IT_COORDINATOR ? '' : 'AND created_by = @userId'}
      `);

    if (ticketCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found or access denied' });
    }

    // Get next update ID
    const nextIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(update_id), 0) + 1 as next_id FROM Updates');
    const nextId = nextIdResult.recordset[0].next_id;

    // Create update
    await pool.request()
      .input('updateId', nextId)
      .input('ticketId', ticketId)
      .input('updatedBy', req.user.user_id)
      .input('message', message)
      .input('createdAt', new Date())
      .query(`
        INSERT INTO Updates (update_id, ticket_id, updated_by, message, created_at)
        VALUES (@updateId, @ticketId, @updatedBy, @message, @createdAt)
      `);

    // Update ticket's updated_at timestamp
    await pool.request()
      .input('ticketId', ticketId)
      .input('updatedAt', new Date())
      .query('UPDATE Tickets SET updated_at = @updatedAt WHERE ticket_id = @ticketId');

    res.status(201).json({
      message: 'Update added successfully',
      updateId: nextId
    });
  } catch (error) {
    console.error('Add update error:', error);
    res.status(500).json({ message: 'Server error adding update' });
  }
});

module.exports = router;
