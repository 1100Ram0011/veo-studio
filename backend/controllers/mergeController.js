const path = require('path');
const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');

// Set fluent-ffmpeg to use the static binaries
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const TEMP_DIR = path.join(__dirname, '..', 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const downloadVideo = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

exports.mergeVideos = async (req, res) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of video URLs to merge.' });
  }

  const mergeId = 'merged_' + Date.now();
  const filePaths = [];
  const outputFilePath = path.join(TEMP_DIR, `${mergeId}.mp4`);

  console.log(`🎬 Merging ${urls.length} videos...`);

  try {
    // 1. Download all videos locally
    for (let i = 0; i < urls.length; i++) {
      const localPath = path.join(TEMP_DIR, `${mergeId}_part${i}.mp4`);
      await downloadVideo(urls[i], localPath);
      filePaths.push(localPath);
      console.log(`Downloaded part ${i+1}`);
    }

    // 2. Merge them using fluent-ffmpeg
    await new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      filePaths.forEach((file) => {
        command.input(file);
      });

      command
        .on('error', (err, stdout, stderr) => {
          console.error('ffmpeg error:', err.message);
          console.error('ffmpeg stderr:', stderr);
          reject(new Error(err.message + ' | ' + stderr));
        })
        .on('end', () => {
          console.log('ffmpeg merge complete');
          resolve();
        })
        .mergeToFile(outputFilePath, TEMP_DIR);
    });

    console.log(`✅ Merged video created at ${outputFilePath}`);

    // Since we don't have AWS S3, we will serve this file directly through a static route or proxy.
    // Wait! The /temp folder is not exposed. Let's move it to /public or save it to DB.
    // We already have a Media database, but the Media database expects an `originalUrl`.
    // Let's create an endpoint in video.js to serve files from the temp folder directly for simplicity,
    // or just upload it somewhere? No, just serve from the backend statically.
    
    // Return the URL for the merged video
    const baseUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://veo-studio-jk43.onrender.com' : 'http://localhost:5000');
    const finalUrl = `${baseUrl}/api/video/download-merged/${mergeId}`;

    return res.json({
      success: true,
      mergedUrl: finalUrl
    });

  } catch (error) {
    console.error('❌ Merge error:', error);
    return res.status(500).json({ error: 'Merge failed: ' + error.message });
  } finally {
    // Clean up the individual chunks to save space
    filePaths.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
};

exports.serveMergedVideo = (req, res) => {
  const { mergeId } = req.params;
  const filePath = path.join(TEMP_DIR, `${mergeId}.mp4`);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Merged video not found or expired.' });
  }
};
