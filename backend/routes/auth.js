const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
// ─── Helpers ───────────────────────────────────────────────────────────────
function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_change_in_prod',
    { expiresIn: '7d' }
  )
}

function sanitizeUser(user) {
  const safe = user.toObject ? user.toObject() : { ...user }
  delete safe.password
  delete safe._id
  delete safe.__v
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

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email,
      password: hashedPassword,
      credits: 10,
      plan: 'Free',
      isUnlimited: false
    })

    try {
      await User.collection.dropIndex('username_1');
    } catch (ignore) {
      // Index might not exist, ignore
    }

    await user.save()

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

// ─── POST /api/auth/use-credit ──────────────────────────────────────────────
router.post('/use-credit', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_in_prod')
    
    const user = await User.findOne({ id: decoded.id })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.isUnlimited) {
      return res.json({ success: true, user: sanitizeUser(user) })
    }

    if (user.credits <= 0) {
      return res.status(403).json({ error: 'Insufficient credits' })
    }

    user.credits -= 1
    await user.save()

    return res.json({ success: true, user: sanitizeUser(user) })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to use credit' })
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

    const user = await User.findOne({ email })
    if (!user) {
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
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_in_prod')
    
    const user = await User.findOne({ id: decoded.id })
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
