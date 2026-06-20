const axios = require('axios');
const qs = require('querystring');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'https://veoaifree.com/wp-admin/admin-ajax.php';
const PAGE_URL = 'https://veoaifree.com/veo-video-generator/';

const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

let cachedNonce = null;
let nonceTimestamp = 0;

// ─── 🔄 HANDSHAKE TOKEN (NONCE) FETCH ───
async function getFreshNonce() {
  const now = Date.now();
  // Cache nonce for 10 minutes (600000 ms) to prevent rate limits
  if (cachedNonce && (now - nonceTimestamp < 600000)) {
    return cachedNonce;
  }

  try {
    console.log(`🔄 Handshaking clear identity via DIRECT connection (No Scrape.do tokens used)...`);
    
    const res = await client.get(PAGE_URL, { headers: COMMON_HEADERS });
    
    const patterns = [
      /"nonce"\s*:\s*"(\w+)"/,
      /nonce['"]\s*:\s*['"](\w+)['"]/,
      /"nonce":"(\w+)"/
    ];

    let nonce = null;
    if (res.data && typeof res.data === 'string') {
      for (const pattern of patterns) {
        const match = res.data.match(pattern);
        if (match) { nonce = match[1]; break; }
      }
      
      if (!nonce) {
        const m = res.data.match(/nonce['":\s]+['"]?([a-f0-9]{8,})/i);
        if (m) nonce = m[1];
      }
    }

    if (nonce) {
      cachedNonce = nonce;
      nonceTimestamp = now;
    }

    return nonce;
  } catch (error) {
    console.error('❌ Direct nonce handshake failed:', error.message);
    return null;
  }
}

// ─── 🎬 MAIN VIDEO GENERATION PIPELINE ───
async function generateVideo(prompt, aspectRatio, image = null, aiGenerate = false) {
  console.log(`🎬 Executing video pipeline directly...`);
  
  const nonce = await getFreshNonce();
  if (!nonce) {
    throw new Error('Automation limit bypass hit. Website blocked the direct request.');
  }

  let executionPrompt = prompt;
  if (aiGenerate && (!executionPrompt || executionPrompt.trim() === '')) {
    executionPrompt = "Cinematic slow motion shot, hyper-realistic details, 4k master production.";
  }

  const bodyData = {
    action: 'veo_video_generator',
    nonce,
    prompt: executionPrompt,
    totalVariations: '1',
    aspectRatio,
    actionType: 'full-video-generate',
  };

  if (image) bodyData.input_image = image;
  const body = qs.stringify(bodyData);

  try {
    console.log(`🚀 Routing dynamic payload directly...`);

    const response = await client.post(BASE_URL, body, {
      headers: { 
        ...COMMON_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': PAGE_URL
      }
    });

    const sceneId = String(response.data).trim();

    if (!sceneId || isNaN(sceneId) || sceneId.includes('<div') || sceneId.includes('limit')) {
      throw new Error('Website security block hit or response invalid. Re-triggering sequence...');
    }

    console.log(`✅ Scene ID successfully fetched: ${sceneId}`);
    return sceneId;
  } catch (err) {
    throw new Error(err.message || 'Direct route blocked by provider.');
  }
}

// ─── 🎯 RENDERING PIPELINE STATUS POLLING ───
async function fetchVideoResult(sceneId) {
  const nonce = await getFreshNonce();
  if (!nonce) return null;

  const body = qs.stringify({
    action: 'veo_video_generator',
    nonce,
    sceneData: sceneId,
    actionType: 'final-video-results',
  });

  try {
    const response = await client.post(BASE_URL, body, {
      headers: { 
        ...COMMON_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': PAGE_URL
      }
    });

    let url = typeof response.data === 'string' ? response.data.trim() : JSON.stringify(response.data);
    console.log(`[DEBUG POLL] SceneID: ${sceneId} | Response:`, url.substring(0, 500));
    
    if (url.toLowerCase().includes('failed')) {
      return 'FAILED';
    }

    url = url.replace('/videos/uploads/', '/video/uploads/');

    if (!url || !url.startsWith('http') || !url.includes('.mp4')) {
      return null;
    }

    return url;
  } catch (err) {
    console.log(`⚠️ Result fetch check temporary skip: ${err.message}`);
    return null;
  }
}

module.exports = { generateVideo, fetchVideoResult };
