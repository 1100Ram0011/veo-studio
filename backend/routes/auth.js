// const express = require('express')
// const router = express.Router()
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

// // Simple in-memory users (MongoDB optional hai)
// const users = []

// // ─── POST /api/auth/register ──────────────────────────────
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body

//     if (!name || !email || !password) {
//       return res.status(400).json({ error: 'Sab fields required hain' })
//     }

//     const exists = users.find(u => u.email === email)
//     if (exists) {
//       return res.status(400).json({ error: 'Email already registered hai' })
//     }

//     const hashedPassword = await bcrypt.hash(password, 10)
//     const user = { id: Date.now().toString(), name, email, password: hashedPassword, credits: 5, plan: 'Free' }
//     users.push(user)

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

//     res.json({
//       success: true,
//       token,
//       user: { id: user.id, name: user.name, email: user.email, credits: user.credits, plan: user.plan }
//     })
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//   }
// })

// // ─── POST /api/auth/login ─────────────────────────────────
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body

//     const user = users.find(u => u.email === email)
//     if (!user) {
//       return res.status(400).json({ error: 'Email ya password galat hai' })
//     }

//     const valid = await bcrypt.compare(password, user.password)
//     if (!valid) {
//       return res.status(400).json({ error: 'Email ya password galat hai' })
//     }

//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

//     res.json({
//       success: true,
//       token,
//       user: { id: user.id, name: user.name, email: user.email, credits: user.credits, plan: user.plan }
//     })
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//   }
// })

// module.exports = router






const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')

// ─── In-Memory User Store (swap with MongoDB model if needed) ──────────────
const users = new Map() // email → user object

// ─── Helpers ───────────────────────────────────────────────────────────────
function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_change_in_prod',
    { expiresIn: '7d' }
  )
}

function sanitizeUser(user) {
  const { password, ...safe } = user
  return safe
}

// ─── Validation Middleware ─────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 80 }),
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
]

const loginValidation = [
  body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
]

// ─── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  try {
    const { name, email, password } = req.body

    if (users.has(email)) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email,
      password: hashedPassword,
      credits: 5,
      plan: 'Free',
      createdAt: new Date().toISOString(),
    }

    users.set(email, user)

    const token = createToken(user.id)
    console.log(`✅ New user registered: ${email}`)

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed. Try again.' })
  }
})

// ─── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  try {
    const { email, password } = req.body

    const user = users.get(email)
    if (!user) {
      // Constant-time response to prevent user enumeration
      await bcrypt.hash('dummy', 12)
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = createToken(user.id)
    console.log(`✅ User logged in: ${email}`)

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed. Try again.' })
  }
})

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
// Optional: verify token and return current user
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_in_prod')
    
    // Find user by id
    const user = [...users.values()].find(u => u.id === decoded.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({ success: true, user: sanitizeUser(user) })
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
})

module.exports = router
