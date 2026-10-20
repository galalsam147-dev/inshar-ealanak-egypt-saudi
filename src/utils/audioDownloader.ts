/**
 * تنزيل وتحميل المقاطع الصوتية والموسيقى مباشرة لجهاز المستخدم
 * Direct Audio Track Downloader with cross-browser blob and direct stream support
 */

export async function downloadAudioTrack(track: {
  title: string;
  url: string;
  artist?: string;
}): Promise<boolean> {
  const safeFilename = `${track.title.replace(/[\\/:*?"<>|]/g, '_')}${track.artist ? ` - ${track.artist.replace(/[\\/:*?"<>|]/g, '_')}` : ''}.mp3`;

  try {
    // If it's a data URL or blob URL already, download directly
    if (track.url.startsWith('data:') || track.url.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = track.url;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    // Try fetching blob for clean download filename
    const res = await fetch(track.url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = safeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      return true;
    }
  } catch (err) {
    console.warn('Direct blob fetch failed, falling back to direct link download:', err);
  }

  // Fallback: direct window or link trigger
  try {
    const link = document.createElement('a');
    link.href = track.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
}
