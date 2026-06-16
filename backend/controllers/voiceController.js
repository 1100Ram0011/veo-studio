// controllers/voiceController.js
const Media = require('../models/Media');

exports.generateVoice = async (req, res, next) => {
  try {
    const { text, voiceModel } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioId = 'audio_' + Math.floor(100000 + Math.random() * 900000);
    
    // Map Frontend voices to StreamElements voices
    let ttsVoice = 'Brian'; // Default Adam
    if (voiceModel?.includes('Rachel')) ttsVoice = 'Amy';
    if (voiceModel?.includes('Josh')) ttsVoice = 'Justin';
    if (voiceModel?.includes('Bella')) ttsVoice = 'Salli';

    // Construct the public URL for the TTS service
    const originalUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${ttsVoice}&text=${encodeURIComponent(text.trim())}`;

    // Optionally save in DB to track usage
    try {
      if (process.env.MONGO_URI) {
        await Media.create({
          id: audioId,
          type: 'voice',
          originalUrl: originalUrl,
          sizeBytes: 500000
        });
      }
    } catch (e) {
      console.log('Voice DB save skipped', e.message);
    }

    return res.status(200).json({
      success: true,
      audioId,
      audio_url: originalUrl,
      message: 'Voice generated successfully'
    });
  } catch (err) {
    console.error('❌ Voice processing failure:', err.message);
    return res.status(500).json({ error: 'Internal voice synthesis error.' });
  }
};