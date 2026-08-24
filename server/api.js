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

// Use Windows .exe locally, or global 'yt-dlp' on Linux (Render)
const isWindows = platform() === 'win32';
const YTDLP = isWindows ? join(__dirname, 'yt-dlp.exe') : 'yt-dlp';
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
    const raw = await runYtDlp(['--dump-json', '--no-warnings', '--no-playlist', url.trim()]);
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
  const outPath = join(TEMP_DIR, `${fileId}.${ext}`);

  try {
    const args = ['--no-warnings', '--no-playlist', '-o', outPath];
    if (mode === 'audio') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else {
      args.push('-f', `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`, '--merge-output-format', 'mp4');
    }
    args.push(url.trim());

    let title = 'download';
    try {
      const titleRaw = await runYtDlp(['--print', 'title', '--no-warnings', '--no-playlist', url.trim()], 15000);
      title = titleRaw.replace(/[<>:"/\\|?*]/g, '_').slice(0, 100);
    } catch {}

    await runYtDlp(args, 120000);

    let actualPath = outPath;
    if (!existsSync(actualPath)) {
      for (const v of [`${outPath}`, `${outPath}.mp4`, `${outPath}.mp3`, `${outPath}.webm`]) {
        if (existsSync(v)) { actualPath = v; break; }
      }
    }
    if (!existsSync(actualPath)) return res.json({ success: false, error: 'Download failed' });

    const stat = statSync(actualPath);
    res.json({
      success: true,
      fileId,
      filename: `${title}.${ext}`,
      size: stat.size,
      downloadPath: `/api/file/${fileId}?ext=${ext}&name=${encodeURIComponent(`${title}.${ext}`)}`,
    });
  } catch (err) {
    try { if (existsSync(outPath)) unlinkSync(outPath); } catch {}
    res.json({ success: false, error: err.message.slice(0, 200) });
  }
});

app.get('/api/file/:id', (req, res) => {
  const { id } = req.params;
  const ext = req.query.ext || 'mp4';
  const name = req.query.name || `download.${ext}`;
  const filePath = join(TEMP_DIR, `${id}.${ext}`);

  if (!existsSync(filePath)) return res.status(404).json({ error: 'File not found or expired' });

  const stat = statSync(filePath);
  res.setHeader('Content-Type', ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);

  const stream = createReadStream(filePath);
  stream.pipe(res);
  stream.on('end', () => { setTimeout(() => { try { unlinkSync(filePath); } catch {} }, 5000); });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

function runYtDlp(args, timeout = 60000) {
  return new Promise((resolve, reject) => {
    execFile(YTDLP, args, { timeout, maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
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
