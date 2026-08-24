/**
 * PrivaMedia Studio — Backend API Server
 * Uses yt-dlp binary for 100% reliable YouTube/Instagram downloads.
 * Runs on port 3001, proxied by Vite dev server.
 */

import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import { createReadStream, existsSync, mkdirSync, unlinkSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const YTDLP = join(__dirname, 'yt-dlp.exe');
const TEMP_DIR = join(__dirname, 'temp');

// Ensure temp dir exists
if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

// Auto-cleanup: delete temp files older than 5 minutes (runs every 2 minutes)
setInterval(() => {
  try {
    const files = readdirSync(TEMP_DIR);
    const now = Date.now();
    for (const f of files) {
      const fp = join(TEMP_DIR, f);
      try {
        const age = now - statSync(fp).mtimeMs;
        if (age > 5 * 60 * 1000) {
          unlinkSync(fp);
          console.log(`[Cleanup] Deleted old temp file: ${f}`);
        }
      } catch {}
    }
  } catch {}
}, 2 * 60 * 1000);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * Helper: run yt-dlp and return stdout
 */
function runYtDlp(args, timeout = 60000) {
  return new Promise((resolve, reject) => {
    execFile(YTDLP, args, { timeout, maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[yt-dlp stderr]', stderr);
        return reject(new Error(stderr || err.message));
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * POST /api/info
 * Get video metadata (title, duration, formats, thumbnail)
 */
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const raw = await runYtDlp([
      '--dump-json', '--no-warnings', '--no-playlist',
      url.trim(),
    ]);
    const info = JSON.parse(raw);
    res.json({
      success: true,
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      uploader: info.uploader,
      id: info.id,
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

/**
 * POST /api/download
 * Download video/audio and stream it to the client browser.
 * Body: { url, mode: 'video'|'audio', quality: '1080'|'720'|'480' }
 */
app.post('/api/download', async (req, res) => {
  const { url, mode = 'video', quality = '720' } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL required' });

  const fileId = randomUUID();
  const ext = mode === 'audio' ? 'mp3' : 'mp4';
  const outPath = join(TEMP_DIR, `${fileId}.${ext}`);

  console.log(`[Download] ${mode}@${quality}p — ${url}`);

  try {
    // Build yt-dlp arguments
    const args = ['--no-warnings', '--no-playlist', '-o', outPath];

    if (mode === 'audio') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else {
      // Download best video+audio up to requested quality, merge to mp4
      args.push(
        '-f', `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`,
        '--merge-output-format', 'mp4',
      );
    }

    args.push(url.trim());

    // Get title first for filename
    let title = 'download';
    try {
      const titleRaw = await runYtDlp(['--print', 'title', '--no-warnings', '--no-playlist', url.trim()], 15000);
      title = titleRaw.replace(/[<>:"/\\|?*]/g, '_').slice(0, 100);
    } catch { /* fallback to generic name */ }

    // Download the file
    await runYtDlp(args, 120000);

    // Find the actual output file (yt-dlp may add extension)
    let actualPath = outPath;
    if (!existsSync(actualPath)) {
      // Check common variants
      const variants = [`${outPath}`, `${outPath}.mp4`, `${outPath}.mp3`, `${outPath}.webm`];
      for (const v of variants) {
        if (existsSync(v)) { actualPath = v; break; }
      }
    }

    if (!existsSync(actualPath)) {
      return res.json({ success: false, error: 'Download completed but file not found' });
    }

    const stat = statSync(actualPath);
    const filename = `${title}.${ext}`;

    console.log(`[Download OK] ${filename} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);

    // Return file info — client will fetch via /api/file/:id
    res.json({
      success: true,
      fileId,
      filename,
      size: stat.size,
      downloadPath: `/api/file/${fileId}?ext=${ext}&name=${encodeURIComponent(filename)}`,
    });
  } catch (err) {
    console.error('[Download Error]', err.message);
    // Cleanup on error
    try { if (existsSync(outPath)) unlinkSync(outPath); } catch {}
    res.json({ success: false, error: err.message.slice(0, 200) });
  }
});

/**
 * GET /api/file/:id
 * Streams the downloaded file to the browser and auto-cleans up.
 */
app.get('/api/file/:id', (req, res) => {
  const { id } = req.params;
  const ext = req.query.ext || 'mp4';
  const name = req.query.name || `download.${ext}`;
  const filePath = join(TEMP_DIR, `${id}.${ext}`);

  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found or expired' });
  }

  const stat = statSync(filePath);
  const contentType = ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);

  const stream = createReadStream(filePath);
  stream.pipe(res);

  // Cleanup file after download completes
  stream.on('end', () => {
    setTimeout(() => {
      try { unlinkSync(filePath); } catch {}
    }, 5000);
  });
});

/* ── Health Check ── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'PrivaMedia API', ytdlp: true, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n  🚀 PrivaMedia API Server (yt-dlp) running on http://localhost:${PORT}\n`);
});
