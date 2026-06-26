const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const { generateVideo, fetchVideoResult } = require('../services/veoai')
const { authMiddleware, requireCredits } = require('../middleware/authMiddleware')
const mergeController = require('../controllers/mergeController')

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
router.post('/generate', authMiddleware, requireCredits(1), videoLimiter, generateValidation, async (req, res) => {
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

    try {
      const Media = require('../models/Media')
      await Media.findOneAndUpdate(
        { id: 'vid_' + sceneId },
        {
          type: 'video',
          originalUrl: 'PENDING',
          userId: req.user ? req.user.id : null,
          prompt: finalPrompt
        },
        { upsert: true }
      );
    } catch(e) {
      console.log('Non-fatal media save error:', e.message);
    }

    return res.status(202).json({
      success: true,
      sceneId,
      message: 'Video generation started. Poll /api/video/result for status.',
    })
  } catch (err) {
    console.error('❌ Video generate error:', err.message)

    if (err.message === 'PROVIDER_LIMIT_REACHED' || err.message?.includes('limit')) {
      return res.status(429).json({ error: 'Free engine limit reached (Max 2 videos per IP). Please wait or use a VPN.' })
    }
    if (err.message === 'SCRAPE_DO_LIMIT') {
      return res.status(402).json({ error: 'Scrape.do API key limit exceeded. Please upgrade your Scrape.do plan.' })
    }

    return res.status(502).json({ error: 'Video generation failed. Provider might be blocking the request.' })
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

    if (videoUrl === 'FAILED') {
      return res.json({ success: true, ready: false, failed: true, message: 'Provider rejected or failed generation.' })
    }

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

      const baseUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://veo-studio-jk43.onrender.com' : 'http://localhost:5000');
      const proxyUrl = `${baseUrl}/api/media/proxy/${mediaId}`;
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

// ─── POST /api/video/merge ──────────────────────────────────────────────────
router.post('/merge', authMiddleware, requireCredits(1), mergeController.mergeVideos)

// ─── GET /api/video/download-merged/:mergeId ──────────────────────────────
router.get('/download-merged/:mergeId', mergeController.serveMergedVideo)

module.exports = router
