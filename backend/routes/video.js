 

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
    const { prompt, aspectRatio, image, aiGenerate } = req.body

    // UPDATED VALIDATION: Agar prompt khali hai, aur na hi image hai, aur na hi AI mode select kiya hai
    if ((!prompt || prompt.trim().length === 0) && !image && !aiGenerate) {
      return res.status(400).json({ error: 'Prompt, Image upload ya AI mode select karna required hai!' })
    }

    if (prompt && prompt.length > 100000) {
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

    const finalPrompt = prompt ? prompt.trim() : '';
    console.log(`🎬 Generating video sequence... Mode: AI=${!!aiGenerate}, Image=${!!image}`)

    // UPDATED CALL: Ab hum prompt ke saath optional image aur aiGenerate instructions bhi bhej rahe hain
    const sceneId = await generateVideo(finalPrompt, aspect, image, aiGenerate)

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
// ─── POST /api/video/result ──────────────────────────────
router.post('/result', async (req, res) => {
  try {
    const { sceneId } = req.body

    if (!sceneId) {
      return res.status(400).json({ error: 'sceneId required hai' })
    }

    // Try catch lagayein taaki timeout hone par poora app ya request crash na ho
    try {
      const videoUrl = await fetchVideoResult(sceneId)

      if (videoUrl) {
        console.log(`🎉 Video ready: ${videoUrl}`)
        return res.json({ success: true, videoUrl, ready: true })
      } else {
        return res.json({ success: true, videoUrl: null, ready: false, message: 'Abhi generate ho rahi hai…' })
      }
    } catch (axiosError) {
      // Agar veoaifree.com timeout marta hai ya network slow hota hai
      console.log(`⚠️ VeoAI Server is taking too long for Scene: ${sceneId}. Retrying in next poll...`)
      return res.json({ success: true, videoUrl: null, ready: false, message: 'Server slow hai, video process ho rahi hai, please wait...' })
    }

  } catch (error) {
    console.error('❌ Result fetch major error:', error.message)
    res.status(500).json({ error: error.message })
  }
})
module.exports = router