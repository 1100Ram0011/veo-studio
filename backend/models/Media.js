const mongoose = require('mongoose')

const MediaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['video', 'image', 'reels', 'voice', 'script'] },
  originalUrl: { type: String, required: true },
  userId: { type: String, required: false },
  prompt: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  sizeBytes: { type: Number, default: 1048576 } // Approx 1MB default if unknown
})

module.exports = mongoose.model('Media', MediaSchema)
