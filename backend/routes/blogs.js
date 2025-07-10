const express = require('express');
const Blog = require('../models/Blog');
const router = express.Router();
const verifyAdmin = require('../middleware/auth');

// Get all blogs (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Create a new blog (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  const { title, sections } = req.body;
  if (!title || !Array.isArray(sections) || sections.length === 0) {
    return res.status(400).json({ error: 'Title and sections are required' });
  }
  // Validate each section
  for (const section of sections) {
    if (!section.type || !section.content || !['text', 'code', 'heading', 'image'].includes(section.type)) {
      return res.status(400).json({ error: 'Each section must have type (text/code) and content' });
    }
  }
  try {
    const newBlog = new Blog({ title, sections });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// Delete a blog (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Update a blog (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { title, sections } = req.body;
  if (!title || !Array.isArray(sections) || sections.length === 0) {
    return res.status(400).json({ error: 'Title and sections are required' });
  }
  for (const section of sections) {
    if (!section.type || !section.content || !['text', 'code', 'heading', 'image'].includes(section.type)) {
      return res.status(400).json({ error: 'Each section must have type (text/code) and content' });
    }
  }
  try {
    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, sections },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

module.exports = router; 