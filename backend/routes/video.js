 

// const express = require('express')
// const router = express.Router()
// const rateLimit = require('express-rate-limit')
// const { generateVideo, fetchVideoResult } = require('../services/veoai')

// // Rate limiting - ek user max 10 req/minute
// const videoLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 10,
//   message: { error: 'Bahut zyada requests. 1 minute baad try karo.' }
// })

// // ─── POST /api/video/generate ─────────────────────────────
// // Prompt bhejo, Scene ID wapas milega
// router.post('/generate', videoLimiter, async (req, res) => {
//   try {
//     const { prompt, aspectRatio, image, aiGenerate } = req.body

//     // UPDATED VALIDATION: Agar prompt khali hai, aur na hi image hai, aur na hi AI mode select kiya hai
//     if ((!prompt || prompt.trim().length === 0) && !image && !aiGenerate) {
//       return res.status(400).json({ error: 'Prompt, Image upload ya AI mode select karna required hai!' })
//     }

//     if (prompt && prompt.length > 100000) {
//       return res.status(400).json({ error: 'Prompt 500 characters se zyada nahi ho sakta' })
//     }

//     const validAspects = [
//       'VIDEO_ASPECT_RATIO_PORTRAIT',
//       'VIDEO_ASPECT_RATIO_LANDSCAPE',
//       'VIDEO_ASPECT_RATIO_SQUARE',
//     ]

//     const aspect = validAspects.includes(aspectRatio)
//       ? aspectRatio
//       : 'VIDEO_ASPECT_RATIO_PORTRAIT'

//     const finalPrompt = prompt ? prompt.trim() : '';
//     console.log(`🎬 Generating video sequence... Mode: AI=${!!aiGenerate}, Image=${!!image}`)

//     // UPDATED CALL: Ab hum prompt ke saath optional image aur aiGenerate instructions bhi bhej rahe hain
//     const sceneId = await generateVideo(finalPrompt, aspect, image, aiGenerate)

//     console.log(`✅ Scene ID: ${sceneId}`)

//     res.json({
//       success: true,
//       sceneId,
//       message: 'Video generation shuru ho gayi. Poll karo result ke liye.',
//     })

//   } catch (error) {
//     console.error('❌ Generate error:', error.message)
//     res.status(500).json({
//       error: error.message || 'Video generate karne mein error aaya',
//     })
//   }
// })

// // ─── POST /api/video/result ──────────────────────────────
// // Scene ID bhejo, MP4 URL wapas milega (agar ready hai)
// // ─── POST /api/video/result ──────────────────────────────
// router.post('/result', async (req, res) => {
//   try {
//     const { sceneId } = req.body

//     if (!sceneId) {
//       return res.status(400).json({ error: 'sceneId required hai' })
//     }

//     // Try catch lagayein taaki timeout hone par poora app ya request crash na ho
//     try {
//       const videoUrl = await fetchVideoResult(sceneId)

//       if (videoUrl) {
//         console.log(`🎉 Video ready: ${videoUrl}`)
//         return res.json({ success: true, videoUrl, ready: true })
//       } else {
//         return res.json({ success: true, videoUrl: null, ready: false, message: 'Abhi generate ho rahi hai…' })
//       }
//     } catch (axiosError) {
//       // Agar veoaifree.com timeout marta hai ya network slow hota hai
//       console.log(`⚠️ VeoAI Server is taking too long for Scene: ${sceneId}. Retrying in next poll...`)
//       return res.json({ success: true, videoUrl: null, ready: false, message: 'Server slow hai, video process ho rahi hai, please wait...' })
//     }

//   } catch (error) {
//     console.error('❌ Result fetch major error:', error.message)
//     res.status(500).json({ error: error.message })
//   }
// })
// module.exports = router





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
      return res.json({ success: true, ready: true, videoUrl })
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