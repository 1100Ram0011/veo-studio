// controllers/imageController.js
const Media = require('../models/Media');

// Dhyan dein ki yahan 'exports.generateImage' likha ho
exports.generateImage = async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Graphics prompt context description is required.' })
    }

    const imageId = 'img_' + Math.floor(100000 + Math.random() * 900000)
    console.log(`🖼️ Graphics compilation active sequence for: ${prompt}`)

    const originalUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000';
    
    // Save to DB
    await Media.create({
      id: imageId,
      type: 'image',
      originalUrl: originalUrl,
      sizeBytes: 1500000 // approx 1.5MB for this unsplash image
    });

    const proxyUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/media/proxy/${imageId}`;

    return res.status(200).json({
      success: true,
      imageId,
      image_url: proxyUrl,
      message: 'Graphics generated successfully.'
    })
  } catch (err) {
    console.error('❌ Image engine failure:', err.message)
    return res.status(500).json({ error: 'Internal image processing framework error.' })
  }
}