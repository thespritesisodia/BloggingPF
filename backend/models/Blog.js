const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sections: [
    {
      type: { type: String, enum: ['text', 'code', 'heading', 'image'], required: true },
      content: { type: String, required: true }
    }
  ],
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Blog', blogSchema); 