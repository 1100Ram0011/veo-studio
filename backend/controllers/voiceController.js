// controllers/voiceController.js
const Media = require('../models/Media');

exports.generateVoice = async (req, res, next) => {
  try {
    const { text, voiceModel } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioId = 'audio_' + Math.floor(100000 + Math.random() * 900000);
    
    // Map Frontend voices to Google Translate Accents
    let langCode = 'en-US'; 
    if (voiceModel?.includes('Rachel')) langCode = 'en-GB';
    if (voiceModel?.includes('Josh')) langCode = 'en-AU';
    if (voiceModel?.includes('Bella')) langCode = 'en-IN';
    if (voiceModel?.includes('Liam')) langCode = 'en-IE';
    if (voiceModel?.includes('Sophia')) langCode = 'en-ZA';
    if (voiceModel?.includes('Noah')) langCode = 'en-NZ';

    // Construct the public URL for the Google TTS service
    const originalUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(text.trim())}`;

    // Optionally save in DB to track usage
    try {
      if (process.env.MONGO_URI) {
        await Media.create({
          id: audioId,
          type: 'voice',
          originalUrl: originalUrl,
          sizeBytes: 500000,
          userId: req.user ? req.user.id : null,
          prompt: text.trim()
        });
      }
    } catch (e) {
      console.log('Voice DB save skipped', e.message);
    }

    const baseUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://veo-studio-jk43.onrender.com' : 'http://localhost:5000');
    const proxyUrl = `${baseUrl}/api/media/proxy/${audioId}`;

    return res.status(200).json({
      success: true,
      audioId,
      audio_url: proxyUrl,
      message: 'Voice generated successfully'
    });
  } catch (err) {
    console.error('❌ Voice processing failure:', err.message);
    return res.status(500).json({ error: 'Internal voice synthesis error.' });
  }
};
