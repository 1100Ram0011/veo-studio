const express = require('express')
const router = express.Router()
const axios = require('axios')
const Media = require('../models/Media')

router.get('/proxy/:id', async (req, res) => {
  try {
    const media = await Media.findOne({ id: req.params.id })
    if (!media) {
      return res.status(404).json({ error: 'Media not found' })
    }

    // Proxy the stream
    const response = await axios({
      url: media.originalUrl,
      method: 'GET',
      responseType: 'stream'
    })

    // Forward the headers
    res.setHeader('Content-Type', response.headers['content-type'])
    response.data.pipe(res)
  } catch (error) {
    console.error('Proxy Error:', error.message)
    res.status(500).json({ error: 'Failed to stream media' })
  }
})

module.exports = router
