// routes/payment.js (Backend)
const express = require('express')
const router = express.Router()

// 🔌 Sahi se Controller file ko import karein
const paymentController = require('../controllers/paymentController')

// ─── 1. POST /api/payment/initiate ──────────────────────────────────────────
// Frontend jab hit karega, toh yeh controller ka initializeScanPay chalayega
router.post('/initiate', paymentController.initializeScanPay)

// ─── 2. POST /api/payment/verify ────────────────────────────────────────────
// Polling ya check button par yeh controller ka verifyPaymentStatus chalayega
router.post('/verify', paymentController.verifyPaymentStatus)

module.exports = router