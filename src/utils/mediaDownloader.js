/**
 * Direct In-Site Media Downloader
 * Uses VITE_API_URL environment variable to connect to the Render backend when on Vercel.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchDirectMediaStream(url, mode = 'video', quality = '720') {
  try {
    const res = await fetch(`${API_BASE}/api/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim(), mode, quality }),
    });

    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();

    if (data.success) {
      return {
        success: true,
        // Make sure the stream URL also points to the backend
        downloadUrl: `${API_BASE}${data.downloadPath}`,
        filename: data.filename,
        size: data.size,
      };
    }

    throw new Error(data.error || 'Download failed');
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function triggerDirectDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download.mp4';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
