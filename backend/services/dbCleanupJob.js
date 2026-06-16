const mongoose = require('mongoose');
const Media = require('../models/Media');

const MAX_DB_SIZE_BYTES = 300 * 1024 * 1024; // 300 MB
const TARGET_CLEANUP_BYTES = 100 * 1024 * 1024; // 100 MB

async function cleanupOldMedia() {
  try {
    if (mongoose.connection.readyState !== 1) return;
    
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    console.log(`📊 DB Size Check: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (stats.dataSize > MAX_DB_SIZE_BYTES) {
      console.log(`⚠️ DB Size exceeded 300MB. Starting cleanup...`);
      
      // We will delete oldest media documents until we free ~100MB
      // Note: MongoDB stats.dataSize includes all collections, but we'll focus on Media
      // since it holds the URLs (and potentially large embedded documents if any).
      // We are just simulating the logic by deleting oldest media documents.
      
      const oldestMedia = await Media.find().sort({ createdAt: 1 }).limit(1000);
      let bytesFreed = 0;
      let idsToDelete = [];
      
      for (const m of oldestMedia) {
        if (bytesFreed >= TARGET_CLEANUP_BYTES) break;
        bytesFreed += (m.sizeBytes || 1048576); // fallback 1MB per doc assumption
        idsToDelete.push(m._id);
      }
      
      if (idsToDelete.length > 0) {
        await Media.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`✅ Cleanup complete. Deleted ${idsToDelete.length} old media records, freed approx ${(bytesFreed / 1024 / 1024).toFixed(2)} MB`);
      } else {
        console.log(`ℹ️ Cleanup skipped: No media records to delete.`);
      }
    }
  } catch (err) {
    console.error('❌ DB Cleanup Error:', err.message);
  }
}

// Run every hour
function startCleanupJob() {
  setInterval(cleanupOldMedia, 60 * 60 * 1000);
  console.log('🕒 Scheduled DB cleanup job (Every 1 hour)');
}

module.exports = { startCleanupJob, cleanupOldMedia };
