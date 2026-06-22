const express = require('express')
const router = express.Router()
const axios = require('axios')
const Media = require('../models/Media')
const { authMiddleware } = require('../middleware/authMiddleware')

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await Media.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json({ success: true, history })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

router.get('/proxy/:id', async (req, res) => {
  try {
    const media = await Media.findOne({ id: req.params.id })
    if (!media) {
      return res.status(404).json({ error: 'Media not found' })
    }

    const response = await axios({
      url: media.originalUrl,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    })

    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg')
    res.setHeader('Content-Length', response.data.length)
    res.send(response.data)
  } catch (error) {
    console.error('Proxy Error:', error.message)
    res.status(500).json({ error: error.message, details: error.response?.data || '' })
  }
})

module.exports = router
