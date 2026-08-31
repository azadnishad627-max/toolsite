/**
 * PrivaMedia Studio — Full Stack Server (Render.com Ready)
 * Serves both the React Frontend and the yt-dlp Backend API.
 */

import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import { createReadStream, existsSync, mkdirSync, unlinkSync, statSync, readdirSync, writeFileSync } from 'fs';
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

/* ── Instagram GraphQL Direct Extraction (SnapInsta technique) ── */
const IG_APP_ID = '936619743392459';

async function extractInstagramDirect(postUrl) {
  // Extract shortcode from URL
  const m = postUrl.match(/instagram\.com\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/);
  if (!m) return null;
  const shortcode = m[1];

  console.log(`[IG GraphQL] Trying direct extraction for shortcode: ${shortcode}`);

  // Method 1: Try the public oEmbed-like endpoint first (simplest, no auth needed)
  try {
    const oembedRes = await fetch(`https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        'Accept': '*/*',
        'X-IG-App-ID': IG_APP_ID,
      },
    });
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      const item = data?.graphql?.shortcode_media || data?.items?.[0];
      if (item) {
        const videoUrl = item.video_url || item.video_versions?.[0]?.url;
        if (videoUrl) {
          console.log(`[IG GraphQL] Method 1 success — got direct video URL`);
          return { videoUrl, title: (item.title || item.caption?.text || shortcode).slice(0, 100) };
        }
      }
    }
  } catch (err) {
    console.log(`[IG GraphQL] Method 1 failed: ${err.message}`);
  }

  // Method 2: Try GraphQL query endpoint
  try {
    const variables = JSON.stringify({ shortcode, child_comment_count: 0, fetch_comment_count: 0, has_threaded_comments: false });
    const graphqlRes = await fetch(`https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables=${encodeURIComponent(variables)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'X-IG-App-ID': IG_APP_ID,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    if (graphqlRes.ok) {
      const gqlData = await graphqlRes.json();
      const media = gqlData?.data?.shortcode_media;
      if (media?.video_url) {
        console.log(`[IG GraphQL] Method 2 success — got direct video URL`);
        return { videoUrl: media.video_url, title: (media.title || media.edge_media_to_caption?.edges?.[0]?.node?.text || shortcode).slice(0, 100) };
      }
    }
  } catch (err) {
    console.log(`[IG GraphQL] Method 2 failed: ${err.message}`);
  }

  // Method 3: Scrape the page HTML for embedded video URL
  try {
    const pageRes = await fetch(`https://www.instagram.com/reel/${shortcode}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      // Look for video_url in the page source
      const videoMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/);
      if (videoMatch) {
        const videoUrl = videoMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
        console.log(`[IG GraphQL] Method 3 (HTML scrape) success`);
        const titleMatch = html.match(/"text"\s*:\s*"([^"]{1,100})"/);
        return { videoUrl, title: titleMatch ? titleMatch[1].slice(0, 100) : shortcode };
      }
    }
  } catch (err) {
    console.log(`[IG GraphQL] Method 3 failed: ${err.message}`);
  }

  console.log(`[IG GraphQL] All methods failed, will fallback to yt-dlp`);
  return null;
}

/* ── AI STUDY NOTES & EXAM STUDIO API ROUTE ── */
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "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";
const NARA_API_KEY = process.env.NARA_API_KEY || "sk-nry-N9x2vinWSSErTHlfxxHd5nzXpTS_vUvq1mKThFcbUS4";

function normalizeStudyNotes(raw, defaultTopic, defaultGrade) {
  if (!raw || typeof raw !== 'object') raw = {};

  const chapterTitle = raw.chapterTitle || raw.title || raw.topic || defaultTopic || "Study Chapter";
  const subject = raw.subject || raw.grade || defaultGrade || "General Science & Studies";
  const keyTakeaway = raw.keyTakeaway || raw.summary || raw.takeaway || "Essential summary points for quick revision.";

  // Normalize handwrittenNotes
  let notes = raw.handwrittenNotes || raw.notes || raw.sections || [];
  if (!Array.isArray(notes)) {
    if (typeof notes === 'object') notes = Object.values(notes);
    else notes = [{ heading: "Key Concepts", bulletPoints: [String(notes)] }];
  }

  const handwrittenNotes = notes.map((n, idx) => {
    if (typeof n === 'string') {
      return { heading: `Section ${idx + 1}`, bulletPoints: [n], highlightNote: '' };
    }
    let points = n.bulletPoints || n.points || n.content || [];
    if (!Array.isArray(points)) {
      points = typeof points === 'string' ? points.split('\n').filter(Boolean) : [String(points)];
    }
    return {
      heading: n.heading || n.title || `Concept ${idx + 1}`,
      bulletPoints: points.map(p => String(p)),
      highlightNote: n.highlightNote || n.highlight || n.tip || ''
    };
  });

  // Normalize diagram
  let diagram = raw.diagram || raw.flowchart || raw.conceptMap || { title: `${chapterTitle} Flowchart`, steps: [] };
  let steps = diagram.steps || diagram.stages || [];
  if (!Array.isArray(steps)) steps = [];
  const normalizedSteps = steps.map((s, idx) => {
    if (typeof s === 'string') return { step: `Step ${idx + 1}`, detail: s };
    return { step: s.step || s.title || s.label || `Stage ${idx + 1}`, detail: s.detail || s.desc || s.description || '' };
  });

  // Normalize MCQs
  let mcqs = raw.mcqs || raw.quiz || raw.questions || [];
  if (!Array.isArray(mcqs)) mcqs = [];
  const normalizedMcqs = mcqs.map((m, idx) => {
    let opts = m.options || m.choices || ["Option A", "Option B", "Option C", "Option D"];
    if (!Array.isArray(opts)) opts = Object.values(opts);
    let correctIdx = typeof m.correctIndex === 'number' ? m.correctIndex : (typeof m.answer === 'number' ? m.answer : 0);
    if (correctIdx < 0 || correctIdx >= opts.length) correctIdx = 0;
    return {
      question: m.question || `Question ${idx + 1}`,
      options: opts.slice(0, 4).map(o => String(o)),
      correctIndex: correctIdx,
      explanation: m.explanation || m.detail || "Refer to the textbook concept for detailed derivation."
    };
  });

  // Normalize Exam Questions
  let examQuestions = raw.examQuestions || raw.importantQuestions || [];
  if (!Array.isArray(examQuestions)) examQuestions = [];
  const normalizedExamQuestions = examQuestions.map((q, idx) => {
    return {
      marks: q.marks === 5 ? 5 : 2,
      question: q.question || `Exam Question ${idx + 1}`,
      answer: q.answer || q.solution || "Model answer explanation."
    };
  });

  return {
    chapterTitle,
    subject,
    keyTakeaway,
    handwrittenNotes: handwrittenNotes.length ? handwrittenNotes : [{ heading: "Chapter Overview", bulletPoints: ["Key definitions and core principles."], highlightNote: "" }],
    diagram: { title: diagram.title || `${chapterTitle} Flowchart`, steps: normalizedSteps },
    mcqs: normalizedMcqs.length ? normalizedMcqs : [
      { question: "What is the primary concept of this chapter?", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0, explanation: "Standard definition." }
    ],
    examQuestions: normalizedExamQuestions.length ? normalizedExamQuestions : [
      { marks: 2, question: `Define the core principles of ${chapterTitle}.`, answer: "Step by step textbook definition and key points." }
    ]
  };
}

app.post('/api/ai/study-notes', async (req, res) => {
  const { topic, content = '', grade = 'Class 10-12', language = 'English' } = req.body;
  if (!topic && !content) {
    return res.status(400).json({ success: false, error: 'Topic or chapter content is required' });
  }

  const promptText = `
You are a master educator, textbook author, and exam paper setter.
Create comprehensive, high-yield study material for:
Topic / Chapter: "${topic || 'Provided Content'}"
Grade Level: "${grade}"
Language / Style: "${language}"
${content ? `Input Text Content: "${content.slice(0, 3000)}"` : ''}

Generate structured JSON with:
1. "chapterTitle": Clear concise title
2. "subject": Subject name & class level
3. "keyTakeaway": 1-2 sentence core concept
4. "handwrittenNotes": Array of 3-5 sections (each with "heading", "bulletPoints" (2-4 clear points with definitions/formulas), "highlightNote" (1 crucial exam tip/formula))
5. "diagram": Object with "title" and "steps" (Array of 3-5 sequential concept cards with "step" and "detail")
6. "mcqs": Array of 5 high-yield exam MCQs (each with "question", "options" [4 strings], "correctIndex" [0-3], "explanation")
7. "examQuestions": Array of 4 most expected exam questions (2 short 2-mark, 2 long 5-mark, each with "marks", "question", "answer")

CRITICAL: Return ONLY valid, raw JSON. Do NOT wrap in markdown \`\`\`json code fences.
`;

  // 1. Try NVIDIA NIM first
  try {
    console.log(`[AI Study Notes] Generating for topic: "${topic || content.slice(0, 30)}" via NVIDIA NIM...`);
    const nvRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: [
          { role: "system", content: "You are an expert exam tutor. You strictly output raw JSON without markdown code fences." },
          { role: "user", content: promptText }
        ],
        temperature: 0.3,
        max_tokens: 2800
      })
    });

    if (nvRes.ok) {
      const nvData = await nvRes.json();
      let rawText = nvData.choices?.[0]?.message?.content?.trim() || "";
      rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

      try {
        const parsed = JSON.parse(rawText);
        const normalized = normalizeStudyNotes(parsed, topic, grade);
        return res.json({ success: true, data: normalized, engine: 'nvidia' });
      } catch (parseErr) {
        console.log(`[AI Study Notes] JSON parse failed on NVIDIA output, trying regex repair...`);
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const normalized = normalizeStudyNotes(parsed, topic, grade);
          return res.json({ success: true, data: normalized, engine: 'nvidia' });
        }
      }
    }
  } catch (nvErr) {
    console.log(`[AI Study Notes] NVIDIA API failed (${nvErr.message}), falling back to Nara Router...`);
  }

  // 2. Fallback to Nara Router (DeepSeek V4 Flash)
  try {
    console.log(`[AI Study Notes] Falling back to Nara DeepSeek V4...`);
    const naraRes = await fetch("https://router.bynara.id/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NARA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "You are an expert exam tutor. You strictly output raw JSON without markdown code fences." },
          { role: "user", content: promptText }
        ],
        temperature: 0.3,
        max_tokens: 2800
      })
    });

    if (naraRes.ok) {
      const naraData = await naraRes.json();
      let rawText = naraData.choices?.[0]?.message?.content?.trim() || "";
      rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(rawText);
      const normalized = normalizeStudyNotes(parsed, topic, grade);
      return res.json({ success: true, data: normalized, engine: 'nara' });
    }
  } catch (naraErr) {
    console.log(`[AI Study Notes] Nara API also failed: ${naraErr.message}`);
  }

  res.status(500).json({ success: false, error: 'AI generation timed out. Please try again with a shorter topic.' });
});

/* ── API ROUTES ── */
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const raw = await runYtDlp(['--dump-json', '--no-warnings', '--no-playlist', '--extractor-args', 'youtube:player_client=ios,web', url.trim()]);
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
    const isInsta = url.includes('instagram.com') || url.includes('instagr.am');
    const isYT = url.includes('youtube.com') || url.includes('youtu.be');

    // ── INSTAGRAM: Try direct GraphQL extraction FIRST (guaranteed audio) ──
    if (isInsta && mode === 'video') {
      try {
        const igResult = await extractInstagramDirect(url);
        if (igResult && igResult.videoUrl) {
          console.log(`[IG Direct] Downloading from CDN...`);
          const videoRes = await fetch(igResult.videoUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
            },
          });
          if (videoRes.ok) {
            const buffer = Buffer.from(await videoRes.arrayBuffer());
            const outPath = join(TEMP_DIR, `${fileId}.mp4`);
            writeFileSync(outPath, buffer);

            const title = igResult.title.replace(/[<>:"/\\|?*\n\r]/g, '_').trim().slice(0, 100) || 'instagram_reel';
            const stat = statSync(outPath);

            console.log(`[IG Direct] Success! File size: ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
            return res.json({
              success: true,
              fileId,
              filename: `${title}.mp4`,
              size: stat.size,
              downloadPath: `/api/file/${fileId}?ext=mp4&name=${encodeURIComponent(`${title}.mp4`)}`,
            });
          }
        }
      } catch (igErr) {
        console.log(`[IG Direct] GraphQL method failed, falling back to yt-dlp: ${igErr.message}`);
      }
    }

    // ── FALLBACK: yt-dlp for YouTube + Instagram failures ──

    const args = [
      '--no-warnings', 
      '--no-playlist',
      '--no-check-certificates',
      '-o', outTemplate
    ];

    // Use iOS client for YouTube — it bypasses many DASH restrictions on cloud servers
    if (isYT) {
      args.push('--extractor-args', 'youtube:player_client=ios,web');
    }

    if (mode === 'audio') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else if (isInsta) {
      args.push(
        '-f', 'bestvideo*+bestaudio/best',
        '--audio-multistreams',
        '--merge-output-format', 'mp4'
      );
    } else {
      // YouTube: Use format-sort to prioritize resolution, then try merge
      args.push(
        '-f', `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`,
        '-S', `res:${quality},ext:mp4:m4a`,
        '--merge-output-format', 'mp4'
      );
    }
    args.push(url.trim());

    let title = 'download';
    try {
      const titleRaw = await runYtDlp(['--print', 'title', '--no-warnings', '--no-playlist', '--extractor-args', 'youtube:player_client=ios,web', url.trim()], 15000);
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
