 



const axios = require('axios');
const qs = require('querystring');

// ✅ Aapka Active Token securely locked via env
const SCRAPE_DO_TOKEN = process.env.SCRAPE_DO_TOKEN || "4182420bba99461b8bb840c21e6f40dedfa29545d07";

const BASE_URL = 'https://veoaifree.com/wp-admin/admin-ajax.php';
const PAGE_URL = 'https://veoaifree.com/veo-video-generator/';

// Scrape.do dynamic global gateway routing builder
function getScrapeDoUrl(targetUrl) {
  return `http://api.scrape.do?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(targetUrl)}`;
}

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
    const proxyUrl = getScrapeDoUrl(PAGE_URL);
    console.log(`🔄 Handshaking clear identity via Scrape.do Residential Proxy...`);
    
    const res = await axios.get(proxyUrl);
    
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
    console.error('❌ Scrape.do nonce handshake failed:', error.message);
    return null;
  }
}

// ─── 🎬 MAIN VIDEO GENERATION PIPELINE ───
async function generateVideo(prompt, aspectRatio, image = null, aiGenerate = false) {
  console.log(`🎬 Executing video pipeline with anonymous digital footprints...`);
  
  const nonce = await getFreshNonce();
  if (!nonce) {
    throw new Error('Automation limit bypass hit. Scrape.do dashboard par limits check karein.');
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
    const proxyUrl = getScrapeDoUrl(BASE_URL);
    console.log(`🚀 Routing dynamic payload through secure residential tunnel...`);

    const response = await axios.post(proxyUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const sceneId = String(response.data).trim();

    if (!sceneId || isNaN(sceneId) || sceneId.includes('<div') || sceneId.includes('limit')) {
      throw new Error('Website security block hit or response invalid. Re-triggering sequence...');
    }

    console.log(`✅ Scene ID successfully fetched: ${sceneId}`);
    return sceneId;
  } catch (err) {
    throw new Error(err.message || 'Tunnel route blocked by provider.');
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
    const proxyUrl = getScrapeDoUrl(BASE_URL);
    const response = await axios.post(proxyUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    let url = typeof response.data === 'string' ? response.data.trim() : JSON.stringify(response.data);
    console.log(`[DEBUG POLL] SceneID: ${sceneId} | Response:`, url.substring(0, 500));
    
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
