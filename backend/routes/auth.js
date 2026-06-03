const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Simple in-memory users (MongoDB optional hai)
const users = []

// ─── POST /api/auth/register ──────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Sab fields required hain' })
    }

    const exists = users.find(u => u.email === email)
    if (exists) {
      return res.status(400).json({ error: 'Email already registered hai' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = { id: Date.now().toString(), name, email, password: hashedPassword, credits: 5, plan: 'Free' }
    users.push(user)

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, credits: user.credits, plan: user.plan }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── POST /api/auth/login ─────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(400).json({ error: 'Email ya password galat hai' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(400).json({ error: 'Email ya password galat hai' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, credits: user.credits, plan: user.plan }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
