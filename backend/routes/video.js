 


const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const { generateVideo, fetchVideoResult } = require('../services/veoai')

// ─── Constants ─────────────────────────────────────────────────────────────
const VALID_ASPECT_RATIOS = [
  'VIDEO_ASPECT_RATIO_PORTRAIT',
  'VIDEO_ASPECT_RATIO_LANDSCAPE',
  'VIDEO_ASPECT_RATIO_SQUARE',
]

const DEFAULT_ASPECT_RATIO = 'VIDEO_ASPECT_RATIO_PORTRAIT'
const MAX_PROMPT_LENGTH = 500

// ─── Rate Limiter ──────────────────────────────────────────────────────────
const videoLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait 1 minute and try again.' },
  skip: () => process.env.NODE_ENV === 'test',
})

const resultLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,                   // polling can be more frequent
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many status checks. Please slow down.' },
})

// ─── Validation ────────────────────────────────────────────────────────────
const generateValidation = [
  body('prompt')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: MAX_PROMPT_LENGTH })
    .withMessage(`Prompt must be under ${MAX_PROMPT_LENGTH} characters`),
  body('aspectRatio')
    .optional()
    .isIn(VALID_ASPECT_RATIOS)
    .withMessage('Invalid aspect ratio'),
]

const resultValidation = [
  body('sceneId')
    .notEmpty()
    .withMessage('sceneId is required')
    .isString()
    .trim(),
]

// ─── POST /api/video/generate ──────────────────────────────────────────────
router.post('/generate', videoLimiter, generateValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  const { prompt, aspectRatio, image, aiGenerate } = req.body

  // At least one input must be provided
  const hasPrompt = prompt && prompt.trim().length > 0
  const hasImage = Boolean(image)
  const hasAiMode = Boolean(aiGenerate)

  if (!hasPrompt && !hasImage && !hasAiMode) {
    return res.status(400).json({
      error: 'Please provide a prompt, upload an image, or enable AI mode.',
    })
  }

  const aspect = VALID_ASPECT_RATIOS.includes(aspectRatio)
    ? aspectRatio
    : DEFAULT_ASPECT_RATIO

  const finalPrompt = hasPrompt
    ? prompt.trim()
    : 'Cinematic slow motion shot, hyper-realistic details, 4K master production.'

  console.log(`🎬 Video generation request | mode=AI:${hasAiMode} image:${hasImage} | aspect=${aspect}`)

  try {
    const sceneId = await generateVideo(finalPrompt, aspect, image || null, aiGenerate || false)

    console.log(`✅ Scene ID obtained: ${sceneId}`)

    return res.status(202).json({
      success: true,
      sceneId,
      message: 'Video generation started. Poll /api/video/result for status.',
    })
  } catch (err) {
    console.error('❌ Video generate error:', err.message)

    // Surface a clean message to the client
    const clientMessage = err.message?.includes('limit') || err.message?.includes('block')
      ? 'Generation limit reached. Please try again in a few minutes.'
      : 'Video generation failed. Please try again.'

    return res.status(502).json({ error: clientMessage })
  }
})

// ─── POST /api/video/result ────────────────────────────────────────────────
router.post('/result', resultLimiter, resultValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg })
  }

  const { sceneId } = req.body

  try {
    const videoUrl = await fetchVideoResult(sceneId.trim())

    if (videoUrl) {
      console.log(`🎉 Video ready for scene ${sceneId}: ${videoUrl}`)
      
      const Media = require('../models/Media')
      const mediaId = 'vid_' + sceneId.trim()
      
      // Save original URL to database
      await Media.findOneAndUpdate(
        { id: mediaId },
        {
          type: 'video',
          originalUrl: videoUrl,
          sizeBytes: 5000000 // roughly 5MB fallback
        },
        { upsert: true, new: true }
      )

      const proxyUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/media/proxy/${mediaId}`
      return res.json({ success: true, ready: true, videoUrl: proxyUrl })
    }

    // Still processing
    return res.json({
      success: true,
      ready: false,
      videoUrl: null,
      message: 'Still rendering. Check again shortly.',
    })
  } catch (err) {
    // Do NOT return 5xx on a polling timeout — keep the client retrying
    console.warn(`⚠️  Result fetch issue for scene ${sceneId}:`, err.message)
    return res.json({
      success: true,
      ready: false,
      videoUrl: null,
      message: 'Server is busy rendering. Keep polling.',
    })
  }
})

module.exports = router