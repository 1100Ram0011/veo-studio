// controllers/imageController.js
const Media = require('../models/Media');

const { generateVeoImage } = require('../services/veoai_image');

// Dhyan dein ki yahan 'exports.generateImage' likha ho
exports.generateImage = async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Graphics prompt context description is required.' })
    }

    const imageId = 'img_' + Math.floor(100000 + Math.random() * 900000)
    console.log(`🖼️ Graphics compilation active sequence for: ${prompt}`)

    let originalUrl = null;

    // First try the new VeoAI Scraper pipeline
    try {
      // Map UI ratios to VeoAI ratios
      let veoRatio = 'IMAGE_ASPECT_RATIO_PORTRAIT';
      if (aspectRatio === 'Square') veoRatio = 'IMAGE_ASPECT_RATIO_SQUARE';
      if (aspectRatio === 'Landscape') veoRatio = 'IMAGE_ASPECT_RATIO_LANDSCAPE';

      originalUrl = await generateVeoImage(prompt, veoRatio);
      console.log('✅ VeoAI Scraper Success:', originalUrl);
    } catch (veoErr) {
      console.log('⚠️ VeoAI Scraper Failed, falling back to Pollinations:', veoErr.message);
      // Fallback: Using Pollinations AI
      const seed = Math.floor(Math.random() * 100000);
      originalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
    }
    
    // Save to DB
    try {
      if (process.env.MONGO_URI) {
        await Media.create({
          id: imageId,
          type: 'image',
          originalUrl: originalUrl,
          sizeBytes: 1500000,
          userId: req.user ? req.user.id : null,
          prompt: prompt.trim()
        });
      }
    } catch (e) {
      console.log('Image DB save skipped', e.message);
    }

    return res.status(200).json({
      success: true,
      imageId: imageId,
      image_url: originalUrl, // Return direct URL to avoid proxy rate limits
      message: 'Image generated successfully'
    });
  } catch (err) {
    console.error('❌ Image engine failure:', err.message)
    return res.status(500).json({ error: 'Internal image processing framework error.' })
  }
}
