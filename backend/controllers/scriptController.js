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
    
    const response = await axios.get(`https://text.pollinations.ai/prompt/${encodeURIComponent(promptInstructions)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/plain,application/json'
      },
      timeout: 15000
    });
    const generatedPrompt = response.data;

    // Save to DB (optional for scripts)
    try {
      if (process.env.MONGO_URI) {
        await Media.create({
          id: scriptId,
          type: 'script',
          originalUrl: generatedPrompt,
          sizeBytes: generatedPrompt.length,
          userId: req.user ? req.user.id : null,
          prompt: idea
        });
      }
    } catch (e) {
      console.log('Non-fatal: could not save script to DB', e.message);
    }

    return res.status(200).json({
      success: true,
      scriptId,
      script: generatedPrompt,
    });
  } catch (error) {
    console.error('❌ Script generation error:', error.message);
    return res.status(502).json({ error: 'Failed to generate prompt from AI. Please try again.' });
  }
};

exports.generate4PartScript = async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide an idea to generate a story.' });
    }

    console.log(`📝 Story generation active for: ${idea}`);

    // Call Pollinations Text AI and enforce strict JSON array output
    const promptInstructions = `You are an expert AI video prompt engineer. Turn this user idea into exactly 4 sequential, highly detailed, cinematic scene prompts suitable for AI Video generators. 
    The 4 scenes must form a cohesive story.
    You MUST output ONLY a valid JSON array of 4 strings. Do not use markdown blocks or any other text.
    Example: ["Scene 1 prompt...", "Scene 2 prompt...", "Scene 3 prompt...", "Scene 4 prompt..."]
    
    The user idea is: "${idea}"`;
    
    const response = await axios.get(`https://text.pollinations.ai/prompt/${encodeURIComponent(promptInstructions)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/plain,application/json'
      },
      timeout: 15000
    });
    
    let rawText = response.data;
    let prompts = [];

    if (Array.isArray(rawText)) {
      // Axios already parsed the JSON into an array
      prompts = rawText.map(p => typeof p === 'string' ? p : JSON.stringify(p));
    } else {
      // It's a string, we need to extract and parse
      if (typeof rawText === 'string') {
        if (rawText.includes('```json')) {
          rawText = rawText.split('```json')[1].split('```')[0].trim();
        } else if (rawText.includes('```')) {
          rawText = rawText.split('```')[1].split('```')[0].trim();
        }
      }

      try {
        prompts = JSON.parse(rawText);
        if (!Array.isArray(prompts)) throw new Error("Not an array");
        prompts = prompts.map(p => typeof p === 'string' ? p : JSON.stringify(p));
      } catch (e) {
        console.error("Failed to parse JSON array from AI:", rawText);
        // Fallback: just split it roughly if it's a string
        const fallbackText = typeof rawText === 'string' ? rawText : JSON.stringify(rawText);
        prompts = [
          fallbackText.substring(0, 100),
          "Scene 2: Continuation of the story...",
          "Scene 3: The climax approaches...",
          "Scene 4: Resolution."
        ];
      }
    }

    // Ensure we have exactly 4
    if (prompts.length > 4) prompts = prompts.slice(0, 4);
    while (prompts.length < 4) prompts.push("Continuation scene...");

    return res.status(200).json({
      success: true,
      prompts,
    });
  } catch (error) {
    console.error('❌ Story generation error:', error.message);
    return res.status(502).json({ error: 'Failed to generate story from AI. Please try again.' });
  }
};
