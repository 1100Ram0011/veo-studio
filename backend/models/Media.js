const mongoose = require('mongoose')

const MediaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['video', 'image', 'reels', 'voice'] },
  originalUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  sizeBytes: { type: Number, default: 1048576 } // Approx 1MB default if unknown
})

module.exports = mongoose.model('Media', MediaSchema)
