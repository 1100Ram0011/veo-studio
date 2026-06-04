// const express = require('express')
// const cors = require('cors')
// const mongoose = require('mongoose')
// require('dotenv').config()

// const app = express()

// // ─── Middleware ───────────────────────────────────────────
// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     process.env.FRONTEND_URL,
//   ].filter(Boolean),
//   credentials: true,
// }))
// app.use(express.json())

// // ─── Routes ──────────────────────────────────────────────
// app.use('/api/auth', require('./routes/auth'))
// app.use('/api/video', require('./routes/video'))

// // Health check
// app.get('/', (req, res) => {
//   res.json({ status: '✅ VeoStudio Backend Running', time: new Date() })
// })

// // ─── MongoDB Connect ──────────────────────────────────────
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => {
//     console.log('⚠️ MongoDB Error (optional):', err.message)
//     console.log('📝 Note: MongoDB ke bina bhi basic features kaam karenge')
//   })

// // ─── Start Server ─────────────────────────────────────────
// const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//   console.log(`🚀 VeoStudio Backend running on http://localhost:${PORT}`)
// })














const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

// ─── Security & Logging ────────────────────────────────────────────────────
app.use(helmet())
app.use(morgan('combined'))

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS policy: Origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Body Parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/video', require('./routes/video'))

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VeoStudio Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl })
})

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)

  // CORS error
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ error: err.message })
  }

  // JSON parse error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
})

// ─── MongoDB Connect ────────────────────────────────────────────────────────
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => {
      console.warn('⚠️  MongoDB connection failed (optional):', err.message)
      console.log('📝  App will run with in-memory storage')
    })
} else {
  console.log('📝  MONGO_URI not set — using in-memory storage')
}

// ─── Graceful Shutdown ─────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully…')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VeoStudio Backend → http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})