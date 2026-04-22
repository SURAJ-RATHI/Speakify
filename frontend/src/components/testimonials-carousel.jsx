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

              const video = videoRefs.current.get(testimonial.id);
              if (!video) return;

              if (!video.paused && !video.ended) {
                video.pause();
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
        </div>
      </div>
    </div>
  );
}

export default TestimonialsCarousel;
