/**
 * Direct In-Site Media Downloader
 * Calls our yt-dlp powered backend at /api/download.
 * Backend downloads the actual video/audio and streams it to browser.
 */

/**
 * Request backend to download media via yt-dlp.
 * Returns download path to stream file from server.
 */
export async function fetchDirectMediaStream(url, mode = 'video', quality = '720') {
  const res = await fetch('/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url.trim(), mode, quality }),
  });

  if (!res.ok) throw new Error(`Server error ${res.status}`);
  const data = await res.json();

  if (data.success) {
    return {
      success: true,
      downloadUrl: data.downloadPath,
      filename: data.filename,
      size: data.size,
    };
  }

  throw new Error(data.error || 'Download failed');
}

/**
 * Triggers browser file download from our server stream endpoint.
 */
export function triggerDirectDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download.mp4';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
