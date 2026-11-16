// In-page Audio Player (YouTube Embed with smooth volume fade-out)
let activeStopFn: (() => void) | null = null;
let currentPlayingId: string | null = null;
let fadeInterval: any = null;

const stateListeners = new Set<(playingId: string | null) => void>();

function notifyState(id: string | null) {
  currentPlayingId = id;
  stateListeners.forEach((listener) => {
    try {
      listener(id);
    } catch {
      // ignore
    }
  });
}

export function subscribeAudioState(listener: (playingId: string | null) => void): () => void {
  stateListeners.add(listener);
  // Initial sync
  listener(currentPlayingId);
  return () => {
    stateListeners.delete(listener);
  };
}

export function getCurrentlyPlayingId(): string | null {
  return currentPlayingId;
}

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function stopInPageAudio() {
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }

  if (activeStopFn) {
    activeStopFn();
    activeStopFn = null;
  }

  // Remove any active hidden YouTube player element
  const existingIframe = document.getElementById('youtube-bg-audio-player');
  if (existingIframe) {
    existingIframe.remove();
  }

  notifyState(null);
}

/**
 * Smoothly attenuates audio volume to 0 over durationMs, then cleans up.
 */
export function fadeAndStopAudio(durationMs: number = 500, onComplete?: () => void) {
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }

  if (!currentPlayingId) {
    stopInPageAudio();
    if (onComplete) onComplete();
    return;
  }

  const existingIframe = document.getElementById('youtube-bg-audio-player') as HTMLIFrameElement | null;
  if (!existingIframe || !existingIframe.contentWindow) {
    stopInPageAudio();
    if (onComplete) onComplete();
    return;
  }

  const steps = 10;
  const stepTime = Math.max(20, Math.floor(durationMs / steps));
  let vol = 100;

  fadeInterval = setInterval(() => {
    vol -= 100 / steps;
    if (vol <= 0) {
      clearInterval(fadeInterval);
      fadeInterval = null;
      stopInPageAudio();
      if (onComplete) onComplete();
    } else {
      try {
        existingIframe.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'setVolume',
            args: [Math.max(0, Math.round(vol))],
          }),
          '*'
        );
      } catch {
        clearInterval(fadeInterval);
        fadeInterval = null;
        stopInPageAudio();
        if (onComplete) onComplete();
      }
    }
  }, stepTime);
}

export function playInPageAudio(
  id: string,
  youtubeUrl?: string | null,
  onStateChange?: (playingId: string | null) => void
): boolean {
  if (currentPlayingId === id) {
    if (onStateChange) onStateChange(id);
    return true;
  }

  stopInPageAudio();

  const videoId = extractYouTubeId(youtubeUrl);

  if (!youtubeUrl || !youtubeUrl.trim() || !videoId) {
    notifyState(null);
    if (onStateChange) onStateChange(null);
    return false;
  }

  try {
    // Create hidden iframe background audio player for YouTube
    const iframe = document.createElement('iframe');
    iframe.id = 'youtube-bg-audio-player';
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&playsinline=1`;
    iframe.style.position = 'fixed';
    iframe.style.bottom = '-9999px';
    iframe.style.right = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.allow = 'autoplay; encrypted-media';
    document.body.appendChild(iframe);

    notifyState(id);
    if (onStateChange) onStateChange(id);

    activeStopFn = () => {
      const el = document.getElementById('youtube-bg-audio-player');
      if (el) el.remove();
    };

    return true;
  } catch (err) {
    console.warn('YouTube embed blocked:', err);
    notifyState(null);
    if (onStateChange) onStateChange(null);
    return false;
  }
}

export function toggleInPageAudio(
  id: string,
  youtubeUrl?: string | null,
  onStateChange?: (playingId: string | null) => void
): boolean {
  if (currentPlayingId === id) {
    fadeAndStopAudio(350);
    notifyState(null);
    if (onStateChange) onStateChange(null);
    return false;
  }

  return playInPageAudio(id, youtubeUrl, onStateChange);
}
