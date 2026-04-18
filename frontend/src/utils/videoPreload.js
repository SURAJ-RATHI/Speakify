/**
 * Intelligent video preloading system
 * - Preloads videos when page is idle
 * - Uses IntersectionObserver to detect when user is near
 * - Prevents blocking initial page load
 */

// Cache for video thumbnails to avoid duplicate preloads
const thumbnailCache = new Set();

export function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    let videoId = "";

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      videoId = parsed.searchParams.get("v") || "";
    } else if (hostname === "youtu.be") {
      videoId = parsed.pathname.replace("/", "");
    }

    return videoId || "";
  } catch {
    return "";
  }
}

/**
 * Generate optimized YouTube embed URL with performance features
 * Optimizations: lazy-loading, no relative suggestions, optimized parameters
 */
export function getYouTubeEmbedUrl(url) {
  try {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return "";
    // Optimized parameters: playsinline for mobile, no autoplay, no suggestions
    return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1`;
  } catch {
    return "";
  }
}

/**
 * Preload YouTube thumbnails efficiently
 * Caches to avoid duplicate image loads
 */
export function preloadYouTubeVideo(videoId) {
  if (!videoId || thumbnailCache.has(videoId)) return;
  
  thumbnailCache.add(videoId);
  
  // Preload SD quality thumbnail (loads fast, good quality)
  const img = new Image();
  img.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
  
  // Also preload maxres as fallback (higher priority in browser)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const imgHD = new Image();
      imgHD.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    });
  }
}

/**
 * Preload native video resources efficiently
 * Uses requestIdleCallback to avoid blocking main thread
 */
export function preloadNativeVideo(videoUrl) {
  if (!videoUrl) return;

  // Preload with low priority to avoid blocking interactions
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      fetch(videoUrl, { 
        method: 'HEAD',
        mode: 'no-cors',
        priority: 'low'
      }).catch(() => {
        // Silently fail - video will load on demand
      });
    }, { timeout: 3000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      fetch(videoUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      }).catch(() => {});
    }, 2000);
  }
}

/**
 * Setup IntersectionObserver to preload videos intelligently
 * - Preloads visible testimonials immediately
 * - Preloads adjacent testimonials for smooth sliding
 * - Preloads 300px before user scrolls to section
 */
export function setupVideoPreloadingObserver(testimonials) {
  if (!('IntersectionObserver' in window)) {
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting || entry.intersectionRatio > 0.01) {
        const videoUrl = entry.target.getAttribute('data-video-url');
        
        if (!videoUrl) return;
        
        const videoId = getYouTubeVideoId(videoUrl);
        if (videoId) {
          preloadYouTubeVideo(videoId);
        } else {
          preloadNativeVideo(videoUrl);
        }
        
        // Unobserve to save memory
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '300px 100px', // Preload 300px vertically ahead, 100px horizontally
    threshold: 0.01 // Trigger as soon as even 1% is visible
  });

  return observer;
}
