/**
 * Direct In-Site Media Downloader
 */

export async function fetchDirectMediaStream(url, mode = 'video', quality = '720') {
  try {
    // Both frontend and backend are now on the same domain, so we use relative URL
    const res = await fetch(`/api/download`, {
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
