const express = require('express');
const { body, validationResult } = require('express-validator');
const { getPool } = require('../config/database');
const { authenticateToken, requireRole, ROLES } = require('../middleware/auth');

const router = express.Router();

// Get all tickets (with role-based filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    let query = `
      SELECT 
        t.ticket_id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.category,
        t.created_at,
        t.updated_at,
        t.created_by,
        t.assigned_to,
        u1.first_name as creator_first_name,
        u1.last_name as creator_last_name,
        u2.first_name as assignee_first_name,
        u2.last_name as assignee_last_name
      FROM Tickets t
      LEFT JOIN Users u1 ON t.created_by = u1.user_id
      LEFT JOIN Users u2 ON t.assigned_to = u2.user_id
    `;

    // Role-based filtering
    if (req.user.role === ROLES.STUDENT || req.user.role === ROLES.TEACHER) {
      query += ' WHERE t.created_by = @userId';
    }

    query += ' ORDER BY t.created_at DESC';

    const request = pool.request().input('userId', req.user.user_id);
    const result = await request.query(query);

    res.json({
      tickets: result.recordset,
      count: result.recordset.length
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error fetching tickets' });
  }
});

// Get single ticket
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.request()
      .input('ticketId', id)
      .input('userId', req.user.user_id)
      .query(`
        SELECT 
          t.ticket_id,
          t.title,
          t.description,
          t.priority,
          t.status,
          t.category,
          t.created_at,
          t.updated_at,
          t.created_by,
          t.assigned_to,
          u1.first_name as creator_first_name,
          u1.last_name as creator_last_name,
          u2.first_name as assignee_first_name,
          u2.last_name as assignee_last_name
        FROM Tickets t
        LEFT JOIN Users u1 ON t.created_by = u1.user_id
        LEFT JOIN Users u2 ON t.assigned_to = u2.user_id
        WHERE t.ticket_id = @ticketId
        ${req.user.role === ROLES.IT_COORDINATOR ? '' : 'AND t.created_by = @userId'}
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ ticket: result.recordset[0] });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error fetching ticket' });
  }
});

// Create new ticket
router.post('/', [
  authenticateToken,
  requireRole([ROLES.STUDENT, ROLES.TEACHER]),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required and must be less than 2000 characters'),
  body('priority').isInt({ min: 1, max: 4 }).withMessage('Valid priority is required'),
  body('category').isInt({ min: 1, max: 4 }).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority, category } = req.body;
    const pool = getPool();

    // Get next ticket ID
    const nextIdResult = await pool.request()
      .query('SELECT ISNULL(MAX(ticket_id), 0) + 1 as next_id FROM Tickets');
    const nextId = nextIdResult.recordset[0].next_id;

    // Create ticket
    await pool.request()
      .input('ticketId', nextId)
      .input('createdBy', req.user.user_id)
      .input('title', title)
      .input('description', description)
      .input('priority', priority)
      .input('category', category)
      .input('status', 1) // 1 = currently_open
      .input('createdAt', new Date())
      .input('updatedAt', new Date())
      .query(`
        INSERT INTO Tickets (ticket_id, created_by, title, description, priority, status, category, created_at, updated_at)
        VALUES (@ticketId, @createdBy, @title, @description, @priority, @status, @category, @createdAt, @updatedAt)
      `);

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: nextId
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error creating ticket' });
  }
});

// Update ticket (IT coordinators only)
router.put('/:id', [
  authenticateToken,
  requireRole(ROLES.IT_COORDINATOR),
  body('status').optional().isInt({ min: 1, max: 4 }).withMessage('Valid status is required'),
  body('assignedTo').optional().isInt().withMessage('Valid assignee is required'),
  body('priority').optional().isInt({ min: 1, max: 4 }).withMessage('Valid priority is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority } = req.body;
    const pool = getPool();

    // Check if ticket exists
    const ticketResult = await pool.request()
      .input('ticketId', id)
      .query('SELECT ticket_id FROM Tickets WHERE ticket_id = @ticketId');

    if (ticketResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Build update query dynamically
    let updateFields = [];
    let params = { ticketId: id, updatedAt: new Date() };

    if (status !== undefined) {
      updateFields.push('status = @status');
      params.status = status;
    }
    if (assignedTo !== undefined) {
      updateFields.push('assigned_to = @assignedTo');
      params.assignedTo = assignedTo;
    }
    if (priority !== undefined) {
      updateFields.push('priority = @priority');
      params.priority = priority;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    updateFields.push('updated_at = @updatedAt');

    const query = `UPDATE Tickets SET ${updateFields.join(', ')} WHERE ticket_id = @ticketId`;
    const request = pool.request();

    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });

    await request.query(query);

    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error updating ticket' });
  }
});

// Get ticket statistics (IT coordinators only)
router.get('/stats/overview', [
  authenticateToken,
  requireRole(ROLES.IT_COORDINATOR)
], async (req, res) => {
  try {
    const pool = getPool();

    const statsResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as in_progress_tickets,
        SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as closed_tickets,
        SUM(CASE WHEN priority = 4 THEN 1 ELSE 0 END) as urgent_tickets
      FROM Tickets
    `);

    res.json({ stats: statsResult.recordset[0] });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// Delete ticket (creator only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Ensure requester is the creator
    const check = await pool.request()
      .input('ticketId', id)
      .input('userId', req.user.user_id)
      .query('SELECT ticket_id FROM Tickets WHERE ticket_id = @ticketId AND created_by = @userId');

    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'You can only delete your own tickets' });
    }

    // Delete related updates first (FK safety)
    await pool.request().input('ticketId', id).query('DELETE FROM Updates WHERE ticket_id = @ticketId');

    // Delete the ticket
    await pool.request().input('ticketId', id).query('DELETE FROM Tickets WHERE ticket_id = @ticketId');

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ message: 'Server error deleting ticket' });
  }
});

module.exports = router;
