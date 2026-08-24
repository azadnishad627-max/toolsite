import React, { useState } from 'react';
import {
  Download, Image, Sparkles, RefreshCw, Film, Music, Video,
  ShieldCheck, Zap, CheckCircle2, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../3d/TiltCard';
import { downloadSingleFile } from '../../utils/zipHelper';
import { fetchDirectMediaStream, triggerDirectDownload } from '../../utils/mediaDownloader';

/* ── Inline Brand SVG Icons (lucide-react doesn't export these) ── */
function YoutubeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/* ── Quality Options ── */
const VIDEO_QUALITIES = [
  { label: '1080p Full HD', value: '1080', badge: 'Best', color: 'from-red-600 to-rose-600' },
  { label: '720p HD', value: '720', badge: 'Recommended', color: 'from-indigo-600 to-purple-600' },
  { label: '480p SD', value: '480', badge: 'Small File', color: 'from-slate-600 to-slate-700' },
];

export default function SocialDownloader() {
  const [platform, setPlatform] = useState('youtube');
  const [urlInput, setUrlInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [ytData, setYtData] = useState(null);
  const [instaData, setInstaData] = useState(null);

  // Download state
  const [downloadingId, setDownloadingId] = useState(null); // e.g. 'video-720', 'audio'
  const [downloadStatus, setDownloadStatus] = useState(null); // 'loading' | 'success' | 'fallback'
  const [fallbackUrl, setFallbackUrl] = useState(null);

  /* ── URL Parsers ── */
  const parseYouTubeId = (url) => {
    const m = url.trim().match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/
    );
    return m ? m[1] : null;
  };

  const parseInstaShortcode = (url) => {
    const m = url.trim().match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  };

  /* ── Fetch / Parse Link ── */
  const handleFetch = () => {
    if (!urlInput.trim()) return;
    setIsFetching(true);
    setDownloadStatus(null);
    setFallbackUrl(null);
    setDownloadingId(null);

    if (platform === 'youtube') {
      const videoId = parseYouTubeId(urlInput);
      if (!videoId) {
        alert('Invalid YouTube URL – paste a valid YouTube Video or Shorts link.');
        setIsFetching(false);
        return;
      }
      setYtData({
        videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnails: [
          { label: 'Ultra HD 1080p', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, name: `yt_${videoId}_1080p.jpg` },
          { label: 'High Quality 720p', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, name: `yt_${videoId}_hq.jpg` },
          { label: 'Standard 480p', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, name: `yt_${videoId}_sd.jpg` },
          { label: 'Medium Quality', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, name: `yt_${videoId}_mq.jpg` },
        ],
      });
      setInstaData(null);
    } else {
      const shortcode = parseInstaShortcode(urlInput);
      if (!shortcode) {
        alert('Invalid Instagram link – paste a valid Reel or Post URL.');
        setIsFetching(false);
        return;
      }
      setInstaData({
        shortcode,
        url: urlInput.trim(),
        embedUrl: `https://www.instagram.com/p/${shortcode}/embed`,
      });
      setYtData(null);
    }
    setIsFetching(false);
  };

  /* ── In-Site Direct Download Handler (yt-dlp powered) ── */
  const handleDownload = async (mode = 'video', quality = '720') => {
    const sourceUrl = platform === 'youtube' ? ytData?.watchUrl : instaData?.url;
    if (!sourceUrl) return;

    const id = `${mode}-${quality}`;
    setDownloadingId(id);
    setDownloadStatus('loading');
    setFallbackUrl(null);

    try {
      const result = await fetchDirectMediaStream(sourceUrl, mode, quality);

      if (result.success && result.downloadUrl) {
        setDownloadStatus('success');
        const sizeMB = result.size ? `(${(result.size / 1024 / 1024).toFixed(1)} MB)` : '';
        setFallbackUrl(sizeMB);
        triggerDirectDownload(result.downloadUrl, result.filename);
      } else {
        setDownloadStatus('error');
        setFallbackUrl(result.error || 'Server blocked by YouTube. Use the fast popup alternative.');
      }
    } catch (err) {
      setDownloadStatus('error');
      setFallbackUrl(err.message || 'Server blocked by YouTube. Use the fast popup alternative.');
    }
  };

  /* ── Thumbnail 1-Click Download ── */
  const downloadImageFromUrl = async (imgUrl, filename) => {
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      downloadSingleFile(blob, filename);
    } catch {
      window.open(imgUrl, '_blank');
    }
  };

  /* ── Open Fallback in Popup (not full redirect) ── */
  const openFallbackPopup = () => {
    const sourceUrl = platform === 'youtube' ? ytData?.watchUrl : instaData?.url;
    if (!sourceUrl) return;
    
    const videoId = parseYouTubeId(sourceUrl);
    const url = videoId
      ? `https://ssyoutube.com/en176/?url=${encodeURIComponent(sourceUrl)}`
      : `https://snapinsta.app/?url=${encodeURIComponent(sourceUrl)}`;

    const w = 600, h = 700;
    const left = window.screenX + (window.innerWidth - w) / 2;
    const top = window.screenY + (window.innerHeight - h) / 2;
    window.open(url, 'DownloadPopup', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
  };

  /* ── Status Banner ── */
  const StatusBanner = () => {
    if (!downloadStatus) return null;
    if (downloadStatus === 'loading') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Downloading via yt-dlp engine… This may take 10-30 seconds.
        </motion.div>
      );
    }
    if (downloadStatus === 'success') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Download ready! Check your browser's download bar. {fallbackUrl}
        </motion.div>
      );
    }
    if (downloadStatus === 'error') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="line-clamp-2">{fallbackUrl}</span>
          </div>
          <button
            onClick={openFallbackPopup}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Download className="w-4 h-4" /> Open Fast Download Alternative
          </button>
        </motion.div>
      );
    }
    return null;
  };

  /* ───────────────── RENDER ───────────────── */
  return (
    <div className="space-y-8">
      {/* Header */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Zap className="w-4 h-4" /> In-Site Direct Media Downloader
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              YouTube & Instagram Downloader
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Download MP4 Videos (1080p/720p/480p), MP3 Audio, HD Thumbnails, and Instagram Reels — all directly on this page.
            </p>
          </div>

          {/* Platform Switcher */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-800/80 border border-white/10">
            <button
              onClick={() => { setPlatform('youtube'); setYtData(null); setInstaData(null); setDownloadStatus(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${platform === 'youtube' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <YoutubeIcon className="w-4 h-4" /> YouTube & Shorts
            </button>
            <button
              onClick={() => { setPlatform('instagram'); setYtData(null); setInstaData(null); setDownloadStatus(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${platform === 'instagram' ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <InstagramIcon className="w-4 h-4" /> Instagram Reels
            </button>
          </div>
        </div>
      </TiltCard>

      {/* URL Input */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder={platform === 'youtube' ? 'Paste YouTube URL or Shorts link…' : 'Paste Instagram Reel or Post link…'}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            disabled={isFetching || !urlInput.trim()}
            onClick={handleFetch}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 text-white shadow-neon-indigo transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Process Link
          </button>
        </div>
      </div>

      {/* ─── YouTube Results ─── */}
      {platform === 'youtube' && ytData && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Video Player (3 cols) */}
            <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-white/10 overflow-hidden aspect-video">
              <iframe src={ytData.embedUrl} title="YouTube" className="w-full h-full border-0" allowFullScreen />
            </div>

            {/* Quality Picker Panel (2 cols) */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-5 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Choose Quality & Download
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Direct Save
                </span>
              </div>

              {/* Video Quality Buttons */}
              <div className="space-y-2">
                {VIDEO_QUALITIES.map((q) => {
                  const id = `video-${q.value}`;
                  const isActive = downloadingId === id && downloadStatus === 'loading';
                  return (
                    <button
                      key={q.value}
                      disabled={isActive}
                      onClick={() => handleDownload('video', q.value)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r ${q.color} hover:opacity-90 disabled:opacity-60 text-white transition-all flex items-center justify-between`}
                    >
                      <span className="flex items-center gap-2">
                        {isActive ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                        {q.label} MP4
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] opacity-80 px-1.5 py-0.5 rounded bg-black/20">{q.badge}</span>
                        <Download className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* MP3 Audio Button */}
              <button
                disabled={downloadingId === 'audio-mp3' && downloadStatus === 'loading'}
                onClick={() => handleDownload('audio', '320')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {downloadingId === 'audio-320' && downloadStatus === 'loading'
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Music className="w-4 h-4 text-cyan-400" />}
                  MP3 Audio Only (High Bitrate)
                </span>
                <Download className="w-4 h-4 text-cyan-400" />
              </button>

              {/* Status Banner */}
              <AnimatePresence>
                <StatusBanner />
              </AnimatePresence>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="space-y-3">
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-cyan-400" /> High-Res Thumbnails (1-Click Save)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ytData.thumbnails.map((t, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 group hover:border-indigo-500/40 transition-all">
                  <div className="h-32 w-full bg-slate-950 rounded-xl overflow-hidden border border-white/5">
                    <img src={t.url} alt={t.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{t.label}</div>
                  <button
                    onClick={() => downloadImageFromUrl(t.url, t.name)}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Instagram Results ─── */}
      {platform === 'instagram' && instaData && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Reel Embed */}
          <div className="bg-slate-950 rounded-2xl border border-white/10 p-4 flex items-center justify-center min-h-[460px]">
            <iframe src={instaData.embedUrl} title="Instagram Reel" className="w-full h-[440px] rounded-xl border-0" allowFullScreen />
          </div>

          {/* Download Panel */}
          <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs uppercase">
                <InstagramIcon className="w-4 h-4" /> Instagram Media Ready
              </div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white">
                Reel: {instaData.shortcode}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click below to download the full HD Reel video directly to your downloads folder:
              </p>
            </div>

            <div className="space-y-3">
              <button
                disabled={downloadingId === 'video-720' && downloadStatus === 'loading'}
                onClick={() => handleDownload('video', '720')}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white shadow-neon-purple transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {downloadingId === 'video-720' && downloadStatus === 'loading'
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Video className="w-4 h-4" />}
                  Download 1080p Reel (MP4)
                </span>
                <Download className="w-4 h-4" />
              </button>

              <AnimatePresence>
                <StatusBanner />
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
