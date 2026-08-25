/**
 * PrivaMedia Studio — Full Stack Server (Render.com Ready)
 * Serves both the React Frontend and the yt-dlp Backend API.
 */

import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import { createReadStream, existsSync, mkdirSync, unlinkSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { platform } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use Windows .exe locally, or absolute path for global 'yt-dlp' on Linux (Render Docker)
const isWindows = platform() === 'win32';
const YTDLP = isWindows ? join(__dirname, 'yt-dlp.exe') : '/usr/local/bin/yt-dlp';
const TEMP_DIR = join(__dirname, 'temp');

// Ensure temp dir exists
if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

// Auto-cleanup: delete temp files older than 5 minutes
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
        }
      } catch {}
    }
  } catch {}
}, 2 * 60 * 1000);

const app = express();
// Render uses process.env.PORT automatically
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/* ── API ROUTES ── */
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const raw = await runYtDlp(['--dump-json', '--no-warnings', '--no-playlist', '--extractor-args', 'youtube:player_client=android,web', url.trim()]);
    const info = JSON.parse(raw);
    res.json({ success: true, title: info.title, duration: info.duration, thumbnail: info.thumbnail });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/api/download', async (req, res) => {
  const { url, mode = 'video', quality = '720' } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL required' });

  const fileId = randomUUID();
  const ext = mode === 'audio' ? 'mp3' : 'mp4';
  // Use %(ext)s so yt-dlp writes the correct extension itself; we find the file afterwards
  const outTemplate = join(TEMP_DIR, `${fileId}.%(ext)s`);
  const outPathFixed = join(TEMP_DIR, `${fileId}.${ext}`);

  try {
    const args = [
      '--no-warnings', 
      '--no-playlist', 
      '--extractor-args', 'youtube:player_client=android,web',
      '-o', outTemplate
    ];

    if (mode === 'audio') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else {
      const isInsta = url.includes('instagram.com') || url.includes('instagr.am');

      if (isInsta) {
        // Instagram: Try best video+audio merge first, fall back to best single stream
        // --audio-multistreams ensures all audio tracks are kept during merge
        args.push(
          '-f', 'bestvideo*+bestaudio/best',
          '--audio-multistreams',
          '--merge-output-format', 'mp4'
        );
      } else {
        // YouTube: quality-limited download with merge
        args.push(
          '-f', `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`,
          '--merge-output-format', 'mp4'
        );
      }
    }
    args.push(url.trim());

    let title = 'download';
    try {
      const titleRaw = await runYtDlp(['--print', 'title', '--no-warnings', '--no-playlist', '--extractor-args', 'youtube:player_client=android,web', url.trim()], 15000);
      title = titleRaw.replace(/[<>:"/\\|?*]/g, '_').trim().slice(0, 100) || 'download';
    } catch {}

    await runYtDlp(args, 120000);

    // Find the actual output file — yt-dlp may have written .mp4, .webm, .mkv, etc.
    let actualPath = null;
    const possibleExts = ['mp4', 'mkv', 'webm', 'mp3', 'm4a', 'opus'];
    for (const tryExt of possibleExts) {
      const candidate = join(TEMP_DIR, `${fileId}.${tryExt}`);
      if (existsSync(candidate)) { actualPath = candidate; break; }
    }

    // Also scan for any file starting with the fileId (handles edge cases)
    if (!actualPath) {
      try {
        const allFiles = readdirSync(TEMP_DIR);
        const match = allFiles.find(f => f.startsWith(fileId));
        if (match) actualPath = join(TEMP_DIR, match);
      } catch {}
    }

    if (!actualPath) return res.json({ success: false, error: 'Download failed — file not found after processing' });

    // Determine actual extension for serving
    const actualExt = actualPath.split('.').pop() || ext;

    const stat = statSync(actualPath);
    res.json({
      success: true,
      fileId,
      filename: `${title}.${actualExt}`,
      size: stat.size,
      downloadPath: `/api/file/${fileId}?ext=${actualExt}&name=${encodeURIComponent(`${title}.${actualExt}`)}`,
    });
  } catch (err) {
    // Cleanup any partial files
    try {
      const allFiles = readdirSync(TEMP_DIR);
      for (const f of allFiles) {
        if (f.startsWith(fileId)) {
          try { unlinkSync(join(TEMP_DIR, f)); } catch {}
        }
      }
    } catch {}
    res.json({ success: false, error: err.message.slice(0, 300) });
  }
});

app.get('/api/file/:id', (req, res) => {
  const { id } = req.params;
  const ext = req.query.ext || 'mp4';
  const name = req.query.name || `download.${ext}`;
  let filePath = join(TEMP_DIR, `${id}.${ext}`);

  // If exact path not found, scan for any file with this id
  if (!existsSync(filePath)) {
    try {
      const allFiles = readdirSync(TEMP_DIR);
      const match = allFiles.find(f => f.startsWith(id));
      if (match) filePath = join(TEMP_DIR, match);
    } catch {}
  }

  if (!existsSync(filePath)) return res.status(404).json({ error: 'File not found or expired' });

  const mimeTypes = {
    mp4: 'video/mp4', mkv: 'video/x-matroska', webm: 'video/webm',
    mp3: 'audio/mpeg', m4a: 'audio/mp4', opus: 'audio/opus',
  };
  const fileExt = filePath.split('.').pop() || 'mp4';

  const stat = statSync(filePath);
  res.setHeader('Content-Type', mimeTypes[fileExt] || 'application/octet-stream');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);

  const stream = createReadStream(filePath);
  stream.pipe(res);
  stream.on('end', () => { setTimeout(() => { try { unlinkSync(filePath); } catch {} }, 5000); });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

function runYtDlp(args, timeout = 60000) {
  return new Promise((resolve, reject) => {
    console.log(`[yt-dlp] Running: ${args.join(' ')}`);
    execFile(YTDLP, args, { timeout, maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (stderr) console.log(`[yt-dlp stderr] ${stderr.slice(0, 500)}`);
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout.trim());
    });
  });
}

/* ── SERVE FRONTEND BUILD ── */
// In production (Render), serve the static React 'dist' folder built by Vite
const distPath = join(__dirname, '../dist');
app.use(express.static(distPath));

// For any other route, return the React index.html (Client-side routing fallback)
// Using app.use instead of app.get('*') to be compatible with Express 5 path-to-regexp v8 changes
app.use((req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🚀 PrivaMedia Full Stack Server running on port ${PORT}\n`);
});
