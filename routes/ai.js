const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { summarizeTicket, suggestCategoryPriority } = require('../services/aiClient');

const router = express.Router();

router.post('/summarize', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'text is required' });
    }
    const summary = await summarizeTicket(text);
    res.json({ summary });
  } catch (error) {
    console.error('AI summarize error:', error);
    res.status(502).json({ message: 'AI service unavailable', error: process.env.NODE_ENV === 'development' ? String(error) : undefined });
  }
});

router.post('/classify', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'text is required' });
    }
    const result = await suggestCategoryPriority(text);
    res.json(result);
  } catch (error) {
    console.error('AI classify error:', error);
    res.status(502).json({ message: 'AI service unavailable', error: process.env.NODE_ENV === 'development' ? String(error) : undefined });
  }
});

module.exports = router;


