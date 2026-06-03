const axios = require('axios')
const qs = require('querystring')
const cheerio = require('cheerio')
const { wrapper } = require('axios-cookiejar-support')
const { CookieJar } = require('tough-cookie')

const BASE = 'https://veoaifree.com/wp-admin/admin-ajax.php'
const PAGE = 'https://veoaifree.com/veo-video-generator/'

const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/121.0',
]

let cachedNonce = null
let nonceExpiry = 0
let cookieJar = new CookieJar()
let client = wrapper(axios.create({ jar: cookieJar }))

async function getFreshNonce() {
  if (cachedNonce && Date.now() < nonceExpiry) {
    console.log('✅ Nonce cache se mil gaya')
    return cachedNonce
  }

  console.log('🔄 Fresh nonce fetch ho raha hai veoaifree.com se...')
  const ua = UAS[Math.floor(Math.random() * UAS.length)]

  const res = await client.get(PAGE, {
    headers: {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    timeout: 15000,
  })

  // Multiple patterns try karo nonce dhundne ke liye
  const patterns = [
    /"nonce"\s*:\s*"(\w+)"/,
    /nonce['"]\s*:\s*['"](\w+)['"]/,
    /nonce=([a-f0-9]+)/,
    /"nonce":"(\w+)"/,
  ]

  let nonce = null
  for (const pattern of patterns) {
    const match = res.data.match(pattern)
    if (match) {
      nonce = match[1]
      break
    }
  }

  // Cheerio se bhi try karo
  if (!nonce) {
    const $ = cheerio.load(res.data)
    $('script').each((i, el) => {
      const text = $(el).html() || ''
      const m = text.match(/nonce['":\s]+['"]?([a-f0-9]{8,})/i)
      if (m) { nonce = m[1]; return false }
    })
  }

  // Fallback: env variable
  if (!nonce) {
    nonce = process.env.VEOAI_NONCE
    console.log('⚠️ Page se nonce nahi mila, env variable use kar raha hoon')
  }

  if (!nonce) throw new Error('Nonce nahi mila — veoaifree.com ka structure change ho gaya hai')

  cachedNonce = nonce
  nonceExpiry = Date.now() + 45 * 60 * 1000 // 45 minutes cache
  console.log(`✅ Fresh nonce mila: ${nonce.substring(0, 4)}****`)
  return cachedNonce
}

// Step 1: Prompt bhejo → Scene ID milega
async function generateVideo(prompt, aspectRatio) {
  const nonce = await getFreshNonce()
  const ua = UAS[Math.floor(Math.random() * UAS.length)]

  const body = qs.stringify({
    action: 'veo_video_generator',
    nonce,
    prompt,
    totalVariations: '1',
    aspectRatio,
    actionType: 'full-video-generate',
  })

  const response = await client.post(BASE, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://veoaifree.com',
      'Referer': PAGE,
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': ua,
    },
    timeout: 30000,
  })

  const sceneId = String(response.data).trim()

  if (!sceneId || isNaN(sceneId)) {
    // Nonce invalid ho sakta hai — clear karo aur dobara try karo
    if (String(response.data).includes('invalid') || String(response.data).includes('nonce')) {
      cachedNonce = null
      nonceExpiry = 0
    }
    throw new Error(`Invalid Scene ID: "${sceneId}"`)
  }

  return sceneId
}

// Step 2: Scene ID bhejo → MP4 URL milega
async function fetchVideoResult(sceneId) {
  const nonce = await getFreshNonce()
  const ua = UAS[Math.floor(Math.random() * UAS.length)]

  const body = qs.stringify({
    action: 'veo_video_generator',
    nonce,
    sceneData: sceneId,
    actionType: 'final-video-results',
  })

  const response = await client.post(BASE, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://veoaifree.com',
      'Referer': PAGE,
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': ua,
    },
    timeout: 15000,
  })

  let url = String(response.data).trim()
  url = url.replace('/videos/uploads/', '/video/uploads/')

  if (!url || !url.startsWith('http') || !url.includes('.mp4')) {
    return null // abhi ready nahi hai
  }

  return url
}

module.exports = { generateVideo, fetchVideoResult }
