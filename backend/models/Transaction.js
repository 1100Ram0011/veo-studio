const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true, default: 10 },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Transaction', TransactionSchema)