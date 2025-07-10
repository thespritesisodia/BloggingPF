const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// For now, store password in plain text (bcrypt can be added later)
router.post('/login', async (req, res) => {
  const { password } = req.body;
  console.log('Received password:', password);
  console.log('Expected password:', ADMIN_PASSWORD);
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  // In production, use bcrypt.compare
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

module.exports = router; 