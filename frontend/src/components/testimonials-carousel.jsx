<<<<<<< HEAD
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlay, FaStar } from 'react-icons/fa';
import { testimonials } from '../data/constant';

const AUTO_SCROLL_DELAY = 4500;

function getViewportMode() {
  if (typeof window === 'undefined') return 'desktop';
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1100) return 'tablet';
  return 'desktop';
}

function normalizeOffset(offset, length) {
  if (offset > length / 2) return offset - length;
  if (offset < -length / 2) return offset + length;
  return offset;
}

function getCardStyle(offset, viewportMode) {
  const absOffset = Math.abs(offset);
  const hidden = viewportMode === 'mobile' ? absOffset > 1 : absOffset > 2;

  if (viewportMode === 'mobile') {
    const translateX = offset * 78;
    const scale = absOffset === 0 ? 1 : 0.9;
    const opacity = absOffset === 0 ? 1 : 0.44;
    const zIndex = absOffset === 0 ? 5 : 4 - absOffset;

    return {
      transform: `translate(-50%, 0) translateX(${translateX}%) scale(${scale})`,
      opacity: hidden ? 0 : opacity,
      filter: 'none',
      zIndex,
      pointerEvents: hidden ? 'none' : 'auto',
    };
  }

  if (viewportMode === 'tablet') {
    const translateX = offset * 44;
    const translateY = absOffset === 0 ? 0 : 14;
    const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.88 : 0.72;
    const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.74 : 0;
    const zIndex = absOffset === 0 ? 5 : 4 - absOffset;

    return {
      transform: `translate(-50%, ${translateY}px) translateX(${translateX}%) scale(${scale})`,
      opacity,
      filter: 'none',
      zIndex,
      pointerEvents: hidden ? 'none' : 'auto',
    };
  }

  const translateX = offset * 37;
  const translateY = absOffset === 0 ? 0 : absOffset === 1 ? 18 : 28;
  const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.88 : 0.72;
  const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.76 : 0;
  const zIndex = absOffset === 0 ? 5 : 4 - absOffset;

  return {
    transform: `translate(-50%, ${translateY}px) translateX(${translateX}%) scale(${scale})`,
    opacity: hidden ? 0 : opacity,
    filter: 'none',
    zIndex,
    pointerEvents: hidden ? 'none' : 'auto',
  };
}

function useCarouselAutoplay(enabled, onAdvance, delay) {
  const callbackRef = useRef(onAdvance);

  useEffect(() => {
    callbackRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    if (!enabled) return undefined;

    const intervalId = window.setInterval(() => {
      callbackRef.current();
    }, delay);

    return () => window.clearInterval(intervalId);
  }, [delay, enabled]);
}

const TestimonialVideoCard = React.memo(function TestimonialVideoCard({
  testimonial,
  isActive,
  isNeighbor,
  isPlaying,
  layoutStyle,
  onTogglePlayback,
  onVideoPlay,
  onVideoPause,
  onVideoEnded,
  registerVideo,
}) {
  const setVideoRef = useCallback(
    (node) => {
      registerVideo(testimonial.id, node);
    },
    [registerVideo, testimonial.id],
  );

  return (
    <article
      className={`testimonial-spotlight-card${isActive ? ' is-active' : ''}`}
      style={layoutStyle}
    >
      <div
        className={`testimonial-spotlight-video-shell${isActive ? ' is-active' : ''}`}
        onClick={onTogglePlayback}
        role="button"
        tabIndex={0}
        aria-label={`${isPlaying ? 'Pause' : 'Play'} ${testimonial.name}'s testimonial video`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onTogglePlayback();
          }
        }}
      >
        <video
          ref={setVideoRef}
          className="testimonial-spotlight-video"
          poster={testimonial.videoThumbnailUrl}
          preload={isActive || isNeighbor ? 'metadata' : 'none'}
          playsInline
          onPlay={onVideoPlay}
          onPause={onVideoPause}
          onEnded={onVideoEnded}
        >
          <source src={testimonial.videoUrl} type="video/mp4" />
        </video>

        <div className="testimonial-spotlight-video-chip">
          <FaPlay />
          <span>{isPlaying ? 'Tap to pause' : isActive ? 'Tap to play' : 'Tap to focus & play'}</span>
        </div>
      </div>

      <div className="testimonial-spotlight-copy">
        <div className="testimonial-spotlight-rating">
          <strong>{testimonial.rating.toFixed(1)}</strong>
          <div className="testimonial-spotlight-stars" aria-label={`${testimonial.rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar key={`${testimonial.id}-star-${index}`} className={index < testimonial.rating ? 'is-filled' : ''} />
            ))}
          </div>
        </div>
        <p>{testimonial.quote}</p>
        <div className="testimonial-spotlight-meta">
          <strong>{testimonial.name}</strong>
          <span>{testimonial.role}</span>
        </div>
      </div>
    </article>
  );
});

export function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportMode, setViewportMode] = useState(getViewportMode);
  const [playingId, setPlayingId] = useState(null);
  const videoRefs = useRef(new Map());
  const pendingPlayIdRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setViewportMode(getViewportMode());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const registerVideo = useCallback((id, node) => {
    if (node) {
      videoRefs.current.set(id, node);
      return;
    }

    videoRefs.current.delete(id);
  }, []);

  const pauseAllExcept = useCallback((keepId = null) => {
    videoRefs.current.forEach((video, id) => {
      if (!video || id === keepId) return;
      if (!video.paused) {
        video.pause();
      }
    });
  }, []);

  const playVideoById = useCallback(
    (id) => {
      const video = videoRefs.current.get(id);
      if (!video) return;

      pauseAllExcept(id);
      video.currentTime = 0;

      const playAttempt = video.play();
      if (playAttempt?.catch) {
        playAttempt.catch(() => {
          setPlayingId(null);
        });
      }
    },
    [pauseAllExcept],
  );

  const goToIndex = useCallback(
    (index) => {
      setActiveIndex((index + testimonials.length) % testimonials.length);
    },
    [],
  );

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  }, []);

  useCarouselAutoplay(!playingId, goToNext, AUTO_SCROLL_DELAY);

  useEffect(() => {
    const activeTestimonial = testimonials[activeIndex];
    if (!activeTestimonial) return;

    pauseAllExcept(activeTestimonial.id);

    if (playingId && playingId !== activeTestimonial.id) {
      setPlayingId(null);
    }

    if (pendingPlayIdRef.current === activeTestimonial.id) {
      pendingPlayIdRef.current = null;
      window.requestAnimationFrame(() => {
        playVideoById(activeTestimonial.id);
      });
    }
  }, [activeIndex, pauseAllExcept, playVideoById, playingId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) return;
      pauseAllExcept();
      setPlayingId(null);
      pendingPlayIdRef.current = null;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseAllExcept]);

  const cards = useMemo(() => {
    return testimonials.map((testimonial, index) => {
      const rawOffset = index - activeIndex;
      const offset = normalizeOffset(rawOffset, testimonials.length);
      const isActive = offset === 0;
      const isNeighbor = Math.abs(offset) === 1;

      return {
        testimonial,
        index,
        isActive,
        isNeighbor,
        layoutStyle: getCardStyle(offset, viewportMode),
      };
    });
  }, [activeIndex, viewportMode]);

  return (
    <div className="testimonial-spotlight-shell">
      <div className="testimonial-spotlight-stage" role="region" aria-label="Video testimonials carousel">
        {cards.map(({ testimonial, index, isActive, isNeighbor, layoutStyle }) => (
          <TestimonialVideoCard
            key={testimonial.id}
            testimonial={testimonial}
            isActive={isActive}
            isNeighbor={isNeighbor}
            isPlaying={playingId === testimonial.id}
            layoutStyle={layoutStyle}
            registerVideo={registerVideo}
            onTogglePlayback={() => {
              if (!isActive) {
                pendingPlayIdRef.current = testimonial.id;
                goToIndex(index);
                return;
              }

              playVideoById(testimonial.id);
            }}
            onVideoPlay={() => {
              pauseAllExcept(testimonial.id);
              setPlayingId(testimonial.id);
            }}
            onVideoPause={() => {
              const video = videoRefs.current.get(testimonial.id);
              if (video?.ended) return;
              setPlayingId((current) => (current === testimonial.id ? null : current));
            }}
            onVideoEnded={() => {
              setPlayingId((current) => (current === testimonial.id ? null : current));
            }}
          />
        ))}
      </div>

      <div className="testimonial-spotlight-footer">
        <div className="testimonial-spotlight-dots" aria-label="Choose testimonial slide">
          {testimonials.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`testimonial-spotlight-dot${index === activeIndex ? ' is-active' : ''}`}
              onClick={() => goToIndex(index)}
              aria-label={`Show testimonial ${index + 1}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>

        <div className="testimonial-spotlight-controls">
          <button type="button" className="testimonial-spotlight-nav" onClick={goToPrevious} aria-label="Previous testimonial">
            <FaChevronLeft />
          </button>
          <button type="button" className="testimonial-spotlight-nav" onClick={goToNext} aria-label="Next testimonial">
            <FaChevronRight />
          </button>
=======
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FaMute, FaVolumeUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { testimonials } from '../data/constant';

// Star Rating Component
const StarRating = React.memo(function StarRating({ rating, className = '' }) {
  return (
    <div className={`star-rating ${className}`} aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`star ${i < rating ? 'filled' : 'empty'}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.07 12 19.54 3.84 25.07 6.23 16.88 0 10.35 8.91 10.26 12 2" />
        </svg>
      ))}
    </div>
  );
});

// Video Player Component with Lazy Loading and Controls
const VideoPlayer = React.memo(function VideoPlayer({ testimonial, isVisible, onStateChange }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Lazy loading with intersection observer
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !videoRef.current?.src) {
        videoRef.current.src = testimonial.videoUrl;
        videoRef.current.load();
      }
    }, { threshold: 0.1 });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [testimonial.videoUrl]);

  // Video event handlers
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(error => {
        console.error('Play error:', error);
        setHasError(true);
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleMuteToggle = useCallback((e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (!isDragging && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [isDragging]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleProgress = useCallback((e) => {
    if (!isDragging) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(x, rect.width)) / rect.width;
    const newTime = percent * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [isDragging, duration]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    handleProgress(e);
  }, [handleProgress]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Expose state to parent for carousel auto-slide
  useEffect(() => {
    onStateChange({ isPlaying, isMuted });
  }, [isPlaying, isMuted, onStateChange]);

  useEffect(() => {
    document.addEventListener('mousemove', handleProgress);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleProgress);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleProgress, handleMouseUp]);

  // Format time display
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className="video-player-error" role="alert">
        <p>Unable to load video. Please try again.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="video-container"
      onClick={handlePlayPause}
      role="button"
      tabIndex={0}
      aria-label={`Play testimonial video from ${testimonial.name}`}
      onKeyDown={(e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handlePlayPause();
        }
      }}
    >
      <video
        ref={videoRef}
        className="testimonial-video"
        poster={testimonial.videoThumbnailUrl}
        muted={true}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play overlay */}
      {!isPlaying && (
        <div className="video-play-overlay" aria-hidden="true">
          <div className="play-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Unmute button - Always visible */}
      <button
        className="video-unmute-button"
        onClick={handleMuteToggle}
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        aria-pressed={!isMuted}
      >
        {isMuted ? (
          <FaMute size={18} />
        ) : (
          <FaVolumeUp size={18} />
        )}
      </button>

      {/* Progress bar with time display */}
      <div className="video-progress-container">
        <div
          ref={progressRef}
          className="video-progress-bar"
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Video progress"
          onMouseDown={handleMouseDown}
        >
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
            <div className="progress-handle" />
          </div>
        </div>
        <span className="video-time-display" aria-hidden="true">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
});

// Testimonial Card Component
const TestimonialCard = React.memo(function TestimonialCard({ testimonial, index }) {
  const [videoState, setVideoState] = useState({ isPlaying: false, isMuted: true });

  return (
    <div
      className="testimonial-card-wrapper"
      role="article"
      aria-label={`Testimonial ${index + 1} from ${testimonial.name}`}
    >
      <VideoPlayer
        testimonial={testimonial}
        isVisible={true}
        onStateChange={setVideoState}
      />
      
      <div className="testimonial-info">
        <StarRating rating={testimonial.rating} className="testimonial-rating" />
        <div className="testimonial-header">
          <h3 className="testimonial-name">{testimonial.name}</h3>
          <p className="testimonial-role">{testimonial.role}</p>
>>>>>>> 6976f4c24f6ce36997a1ba3bf2e448ec6eb7380d
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
=======
});

// Main Carousel Component
export function TestimonialsCarousel() {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(false); // Disabled by default
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const autoSlideTimer = useRef(null);
  const dragStartTime = useRef(0);

  const cardWidth = 782; // 750px card + 32px gap
  const gap = 24;

  // Check scroll position
  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  // Auto-slide functionality
  const startAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    
    autoSlideTimer.current = setInterval(() => {
      if (scrollContainerRef.current && !isDragging) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const nextScroll = scrollLeft + cardWidth;
          scrollContainerRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    }, 5000); // 5 second interval
  }, [isDragging]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) {
      clearInterval(autoSlideTimer.current);
    }
  }, []);

  // Navigation buttons
  const handlePrevClick = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = cardWidth;
    container.scrollTo({ left: container.scrollLeft - scrollAmount, behavior: 'smooth' });
    setIsAutoSliding(false);
  }, [cardWidth]);

  const handleNextClick = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = cardWidth;
    container.scrollTo({ left: container.scrollLeft + scrollAmount, behavior: 'smooth' });
    setIsAutoSliding(false);
  }, [cardWidth]);

  // Touch and drag support
  const handleMouseDown = useCallback((e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollStart(scrollContainerRef.current.scrollLeft);
    dragStartTime.current = Date.now();
    stopAutoSlide();
  }, [stopAutoSlide]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.clientX;
    const walk = (startX - x) * 0.8; // Momentum factor
    scrollContainerRef.current.scrollLeft = scrollStart + walk;
  }, [isDragging, startX, scrollStart]);

  const handleMouseUp = useCallback((e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    setIsDragging(false);
    const dragDuration = Date.now() - dragStartTime.current;
    const distance = startX - e.clientX;
    
    // Apply momentum scrolling
    if (dragDuration < 300 && Math.abs(distance) > 30) {
      const velocity = distance / dragDuration;
      const momentum = velocity * 100;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, Math.min(currentScroll + momentum, maxScroll)),
        behavior: 'smooth'
      });
    }

    // Resume auto-slide if conditions met (auto-slide disabled)
    setTimeout(() => {
      // Auto-slide remains disabled - only user interaction
    }, 500);
  }, [isDragging, startX, isAutoSliding, startAutoSlide]);

  // Handle touch events
  const handleTouchStart = useCallback((e) => {
    handleMouseDown(e.touches[0]);
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((e) => {
    handleMouseMove(e.touches[0]);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback((e) => {
    handleMouseUp(e.changedTouches[0]);
  }, [handleMouseUp]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handlePrevClick();
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleNextClick();
        break;
      default:
        break;
    }
  }, [handlePrevClick, handleNextClick]);

  // Initialize and setup listeners
  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
    };
  }, [checkScroll]);

  // Auto-slide setup (disabled - testimonials only change on user interaction)
  useEffect(() => {
    // Auto-slide is disabled by default
    // Users must click arrows, drag, or click dots to navigate
  }, []);

  // Pause auto-slide on hover (feature removed - auto-slide is disabled)
  const handleMouseEnter = useCallback(() => {}, []);
  const handleMouseLeave = useCallback(() => {}, []);

  return (
    <section className="testimonials-section-shell">
      <div className="section-shell testimonials-section">
        <div
          className="testimonials-carousel-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          role="region"
          aria-label="Testimonials carousel"
          tabIndex={0}
        >
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="testimonials-scroll-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="presentation"
          >
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            className={`carousel-nav-button nav-prev ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={handlePrevClick}
            aria-label="Previous testimonial"
            disabled={!canScrollLeft}
          >
            <FaChevronLeft size={20} />
          </button>

          <button
            className={`carousel-nav-button nav-next ${!canScrollRight ? 'disabled' : ''}`}
            onClick={handleNextClick}
            aria-label="Next testimonial"
            disabled={!canScrollRight}
          >
            <FaChevronRight size={20} />
          </button>

          {/* Scroll Indicator Dots */}
          <div className="carousel-indicators" role="tablist" aria-label="Carousel pages">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator-dot ${index === Math.floor(currentIndex) ? 'active' : ''}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === Math.floor(currentIndex)}
                role="tab"
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                      left: index * cardWidth,
                      behavior: 'smooth'
                    });
                    setIsAutoSliding(false);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
>>>>>>> 6976f4c24f6ce36997a1ba3bf2e448ec6eb7380d
}

export default TestimonialsCarousel;
