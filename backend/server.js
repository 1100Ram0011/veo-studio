const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json())

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/video', require('./routes/video'))

// Health check
app.get('/', (req, res) => {
  res.json({ status: '✅ VeoStudio Backend Running', time: new Date() })
})

// ─── MongoDB Connect ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.log('⚠️ MongoDB Error (optional):', err.message)
    console.log('📝 Note: MongoDB ke bina bhi basic features kaam karenge')
  })

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 VeoStudio Backend running on http://localhost:${PORT}`)
})
