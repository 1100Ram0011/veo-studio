const axios = require('axios');
const Media = require('../models/Media');

exports.generateScript = async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide an idea to generate a prompt.' });
    }

    const scriptId = 'script_' + Math.floor(100000 + Math.random() * 900000);
    console.log(`📝 Script generation active for: ${idea}`);

    // Call Pollinations Text AI
    const promptInstructions = `You are an expert AI video prompt engineer. Turn this basic user idea into a highly detailed, cinematic prompt suitable for AI Video or Image generators (like Midjourney, Sora, or Runway). The output should describe the scene setting, camera angles, visual style, lighting, subjects, and actions. Make it around 3 to 4 paragraphs long. Do NOT include any conversation or introductory text, just return the raw final prompt. The user idea is: "${idea}"`;
    
    const response = await axios.get(`https://text.pollinations.ai/prompt/${encodeURIComponent(promptInstructions)}`);
    const generatedPrompt = response.data;

    // Save to DB (optional for scripts)
    try {
      if (process.env.MONGO_URI) {
        await Media.create({
          id: scriptId,
          type: 'script',
          originalUrl: generatedPrompt, // We can store the text directly in originalUrl or a new field
          sizeBytes: generatedPrompt.length
        });
      }
    } catch (e) {
      console.log('Script DB save skipped', e.message);
    }

    return res.status(200).json({
      success: true,
      scriptId: scriptId,
      scriptText: generatedPrompt,
      message: 'Script generated successfully'
    });

  } catch (err) {
    console.error('❌ Script engine failure:', err.message);
    return res.status(500).json({ error: 'Internal script processing framework error.' });
  }
};
