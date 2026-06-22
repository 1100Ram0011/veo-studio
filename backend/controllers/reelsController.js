const { generateVideo, fetchVideoResult } = require('../services/veoai')

// POST /api/reels/generate
exports.generateReels = async (req, res, next) => {
  try {
    const { prompt } = req.body

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Instagram Reels prompt is required' })
    }

    const aspect = 'VIDEO_ASPECT_RATIO_PORTRAIT' // Reports ke mutabik locked 9:16 portrait framework
    console.log(`📱 Instagram Reels prompt request received: ${prompt}`)

    // Aapka active automated proxy tunnel link call ho rha hai
    const sceneId = await generateVideo(prompt.trim(), aspect, null, false)
    console.log(`✅ Reels Pipeline registered: ${sceneId}`)

    try {
      const Media = require('../models/Media')
      await Media.findOneAndUpdate(
        { id: 'reels_' + sceneId.trim() },
        {
          type: 'reels',
          originalUrl: 'PENDING',
          userId: req.user ? req.user.id : null,
          prompt: prompt.trim()
        },
        { upsert: true }
      );
    } catch(e) {
      console.log('Non-fatal media save error:', e.message);
    }

    return res.status(202).json({
      success: true,
      sceneId,
      message: 'Reels generation pipeline triggered asynchronously.'
    })
  } catch (err) {
    console.error('❌ Reels engine process failed:', err.message)
    if (err.message === 'PROVIDER_LIMIT_REACHED') {
      return res.status(429).json({ error: 'Free engine limit reached (Max 2 videos per IP). Please wait or use a VPN/Proxy.' })
    }
    if (err.message === 'SCRAPE_DO_LIMIT') {
      return res.status(402).json({ error: 'Scrape.do API key limit exceeded. Please upgrade your Scrape.do plan.' })
    }
    return res.status(502).json({ error: 'Reels automation pipeline failed. Check limits.' })
  }
}

// POST /api/reels/result
exports.getReelsResult = async (req, res, next) => {
  try {
    const { sceneId } = req.body
    if (!sceneId) return res.status(400).json({ error: 'sceneId is required' })

    const videoUrl = await fetchVideoResult(sceneId.trim())

    if (videoUrl === 'FAILED') {
      return res.json({ success: true, ready: false, failed: true, message: 'Provider rejected or failed generation.' })
    }

    if (videoUrl) {
      const Media = require('../models/Media')
      const mediaId = 'reels_' + sceneId.trim()
      
      await Media.findOneAndUpdate(
        { id: mediaId },
        {
          type: 'reels',
          originalUrl: videoUrl,
          sizeBytes: 4000000
        },
        { upsert: true, new: true }
      )

      const baseUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://veo-studio-jk43.onrender.com' : 'http://localhost:5000');
      const proxyUrl = `${baseUrl}/api/media/proxy/${mediaId}`;
      return res.json({ success: true, ready: true, videoUrl: proxyUrl })
    }
    return res.json({ success: true, ready: false, message: 'Reel asset is rendering...' })
  } catch (err) {
    return res.json({ success: true, ready: false, message: 'Server compiling stream layer...' })
  }
}
