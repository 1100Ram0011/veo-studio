const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: {
    type: Number,
    default: 10
  },
  plan: { type: String, default: 'Free' },
  isUnlimited: { type: Boolean, default: false },
  planExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User', UserSchema)
