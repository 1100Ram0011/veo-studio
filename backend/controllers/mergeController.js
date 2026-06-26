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

// ─── In-memory job store (resets on server restart, good enough for temp use) ───
const mergeJobs = {};

const downloadVideo = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    timeout: 30000,
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// ─── Background merge worker ───
async function runMergeJob(mergeId, urls) {
  const filePaths = [];
  const outputFilePath = path.join(TEMP_DIR, `${mergeId}.mp4`);

  try {
    mergeJobs[mergeId].status = 'downloading';
    console.log(`🎬 Merging ${urls.length} videos (job: ${mergeId})...`);

    // 1. Download all videos
    for (let i = 0; i < urls.length; i++) {
      const localPath = path.join(TEMP_DIR, `${mergeId}_part${i}.mp4`);
      await downloadVideo(urls[i], localPath);
      filePaths.push(localPath);
      mergeJobs[mergeId].progress = Math.round(((i + 1) / urls.length) * 40);
      console.log(`Downloaded part ${i + 1}/${urls.length}`);
    }

    mergeJobs[mergeId].status = 'merging';
    mergeJobs[mergeId].progress = 50;

    // 2. Merge with ffmpeg
    await new Promise((resolve, reject) => {
      const command = ffmpeg();

      filePaths.forEach((file) => {
        command.input(file);
      });

      command
        .on('error', (err, stdout, stderr) => {
          console.error('ffmpeg error:', err.message);
          reject(new Error(err.message + ' | ' + stderr));
        })
        .on('end', () => {
          console.log('ffmpeg merge complete');
          resolve();
        })
        .mergeToFile(outputFilePath, TEMP_DIR);
    });

    console.log(`✅ Merged video ready: ${outputFilePath}`);

    const baseUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://veo-studio-jk43.onrender.com' : 'http://localhost:5000');
    const finalUrl = `${baseUrl}/api/video/download-merged/${mergeId}`;

    mergeJobs[mergeId].status = 'done';
    mergeJobs[mergeId].progress = 100;
    mergeJobs[mergeId].mergedUrl = finalUrl;

  } catch (error) {
    console.error('❌ Merge job error:', error.message);
    mergeJobs[mergeId].status = 'failed';
    mergeJobs[mergeId].error = error.message;
  } finally {
    // Clean up part files
    filePaths.forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    // Auto-cleanup merged file after 30 minutes
    setTimeout(() => {
      if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
      delete mergeJobs[mergeId];
    }, 30 * 60 * 1000);
  }
}

// ─── POST /api/video/merge → starts background job, returns jobId immediately ───
exports.mergeVideos = async (req, res) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of video URLs to merge.' });
  }

  const mergeId = 'merged_' + Date.now();

  // Register job
  mergeJobs[mergeId] = { status: 'queued', progress: 0, mergedUrl: null, error: null };

  // Start background (don't await)
  runMergeJob(mergeId, urls);

  // Respond immediately with jobId — no timeout risk!
  return res.json({
    success: true,
    mergeId,
    message: 'Merge started in background. Poll /api/video/merge-status/:mergeId for result.',
  });
};

// ─── GET /api/video/merge-status/:mergeId → poll for job progress ───
exports.getMergeStatus = (req, res) => {
  const { mergeId } = req.params;
  const job = mergeJobs[mergeId];

  if (!job) {
    return res.status(404).json({ error: 'Merge job not found or expired.' });
  }

  return res.json({
    success: true,
    status: job.status,       // 'queued' | 'downloading' | 'merging' | 'done' | 'failed'
    progress: job.progress,
    mergedUrl: job.mergedUrl, // available when status === 'done'
    error: job.error,         // available when status === 'failed'
  });
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
