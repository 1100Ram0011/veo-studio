const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { generateVideo, fetchVideoResult } = require('../services/veoai')

// Rate limiting - ek user max 10 req/minute
const videoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Bahut zyada requests. 1 minute baad try karo.' }
})

// ─── POST /api/video/generate ─────────────────────────────
// Prompt bhejo, Scene ID wapas milega
router.post('/generate', videoLimiter, async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt required hai' })
    }

    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt 500 characters se zyada nahi ho sakta' })
    }

    const validAspects = [
      'VIDEO_ASPECT_RATIO_PORTRAIT',
      'VIDEO_ASPECT_RATIO_LANDSCAPE',
      'VIDEO_ASPECT_RATIO_SQUARE',
    ]

    const aspect = validAspects.includes(aspectRatio)
      ? aspectRatio
      : 'VIDEO_ASPECT_RATIO_PORTRAIT'

    console.log(`🎬 Generating video for prompt: "${prompt.substring(0, 50)}…"`)

    const sceneId = await generateVideo(prompt.trim(), aspect)

    console.log(`✅ Scene ID: ${sceneId}`)

    res.json({
      success: true,
      sceneId,
      message: 'Video generation shuru ho gayi. Poll karo result ke liye.',
    })

  } catch (error) {
    console.error('❌ Generate error:', error.message)
    res.status(500).json({
      error: error.message || 'Video generate karne mein error aaya',
    })
  }
})

// ─── POST /api/video/result ──────────────────────────────
// Scene ID bhejo, MP4 URL wapas milega (agar ready hai)
router.post('/result', async (req, res) => {
  try {
    const { sceneId } = req.body

    if (!sceneId) {
      return res.status(400).json({ error: 'sceneId required hai' })
    }

    const videoUrl = await fetchVideoResult(sceneId)

    if (videoUrl) {
      console.log(`🎉 Video ready: ${videoUrl}`)
      res.json({ success: true, videoUrl, ready: true })
    } else {
      res.json({ success: true, videoUrl: null, ready: false, message: 'Abhi generate ho rahi hai…' })
    }

  } catch (error) {
    console.error('❌ Result fetch error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
