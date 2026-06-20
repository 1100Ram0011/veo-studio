const axios = require('axios');
const qs = require('querystring');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

exports.generateVeoImage = async (prompt, ratio = 'IMAGE_ASPECT_RATIO_PORTRAIT') => {
  const PAGE_URL = 'https://veoaifree.com/veo-video-generator/';
  const BASE_URL = 'https://veoaifree.com/wp-admin/admin-ajax.php';
  const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://veoaifree.com',
    'Referer': PAGE_URL
  };

  try {
    // 1. Initial Handshake to get nonce
    const res = await client.get(PAGE_URL, { headers: COMMON_HEADERS });
    let nonce = null;
    const match = res.data.match(/"nonce"\s*:\s*"(\w+)"/) || res.data.match(/nonce['"]\s*:\s*['"](\w+)['"]/);
    if (match) nonce = match[1];

    if (!nonce) throw new Error("Could not extract nonce from veoaifree.com");

    // 2. Step 1: banan-image-generator
    const body1 = qs.stringify({
      action: 'veo_video_generator',
      nonce,
      promptIMG: prompt,
      totalVariationsIMG: '1',
      aspectRatioIMG: ratio,
      actionType: 'banan-image-generator'
    });

    const res1 = await client.post(BASE_URL, body1, {
      headers: { ...COMMON_HEADERS, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }
    });

    // We proceed to Step 2 even if Step 1 returns an error, just in case Step 2 works independently
    // 3. Step 2: whisk_final_image
    const body2 = qs.stringify({
      action: 'veo_video_generator',
      nonce,
      promptText: prompt,
      totalImages: '1',
      ratio: ratio,
      actionType: 'whisk_final_image'
    });

    const res2 = await client.post(BASE_URL, body2, {
      headers: { ...COMMON_HEADERS, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }
    });

    if (res2.data && res2.data.success && res2.data.image_url) {
      return res2.data.image_url;
    } else if (res2.data && typeof res2.data === 'string' && res2.data.startsWith('http')) {
      return res2.data; // Sometimes it just returns the URL
    } else {
      throw new Error(JSON.stringify(res2.data));
    }
  } catch (err) {
    console.error("Veo Image Scraper Error:", err.response ? err.response.data : err.message);
    throw new Error("Failed to scrape image from veoaifree.com");
  }
};
