// EXAMPLE: How to use TestimonialsCarousel in your pages

import { TestimonialsCarousel } from '../components/testimonials-carousel';

// ============================================
// EXAMPLE 1: Add to Home Page
// ============================================
export function HomePageWithTestimonials() {
  return (
    <div className="site-shell">
      {/* Hero Section */}
      <section className="hero-section">
        {/* Your hero content */}
      </section>

      {/* Services Section */}
      <section className="section-shell">
        {/* Your services */}
      </section>

      {/* Why Choose Us Section */}
      <section className="section-shell">
        {/* Your features */}
      </section>

      {/* 🎯 TESTIMONIALS CAROUSEL - Just add this! */}
      <TestimonialsCarousel />

      {/* FAQ Section */}
      <section className="section-shell">
        {/* Your FAQs */}
      </section>

      {/* CTA Section */}
      <section className="section-shell">
        {/* Your CTA */}
      </section>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Dedicated Testimonials Page
// ============================================
export function TestimonialsPage() {
  return (
    <main className="site-shell">
      <div className="page-header" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
        <h1>What Our Students Say</h1>
        <p>Hear from people who have transformed their communication skills</p>
      </div>

      <TestimonialsCarousel />

      <section className="section-shell" style={{ paddingTop: '48px' }}>
        <h2>Join Our Learning Community</h2>
        <p>See real results from our proven coaching methods</p>
        {/* CTA Button */}
      </section>
    </main>
  );
}

// ============================================
// EXAMPLE 3: Integration with Navigation Link
// ============================================
export function SiteNav() {
  return (
    <nav className="site-nav">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/#testimonials">Testimonials</a>
      <a href="/contact">Contact</a>
    </nav>
  );
}

// Then add to your carousel:
// <div id="testimonials">
//   <TestimonialsCarousel />
// </div>

// ============================================
// EXAMPLE 4: Multiple Testimonial Sections
// ============================================
export function AdvancedLayout() {
  return (
    <main>
      {/* Section 1: Home testimonials */}
      <section>
        <h2>Student Success Stories</h2>
        <TestimonialsCarousel />
      </section>

      {/* Section 2: Course-specific testimonials (future enhancement) */}
      <section id="course-testimonials">
        {/* Could filter by course later */}
        <h2>Public Speaking Course Reviews</h2>
        <TestimonialsCarousel />
      </section>

      {/* Section 3: Corporate testimonials (future enhancement) */}
      <section id="corporate-testimonials">
        <h2>Corporate Client Feedback</h2>
        <TestimonialsCarousel />
      </section>
    </main>
  );
}

// ============================================
// EXAMPLE 5: Custom Styling Wrapper
// ============================================
export function CustomTestimonialsSection() {
  return (
    <section className="custom-testimonials-wrapper">
      <style>{`
        .custom-testimonials-wrapper {
          background: linear-gradient(135deg, #ffffff 0%, #f9f5f1 100%);
          padding: 80px 0;
          border-top: 1px solid rgba(236, 228, 220, 0.6);
        }
      `}</style>

      <div className="section-shell">
        <div className="testimonials-header">
          <span className="eyebrow">Proven Track Record</span>
          <h2>Thousands of Students Have Transformed Their Speaking</h2>
          <p>Watch real testimonials from learners across different backgrounds</p>
        </div>

        <TestimonialsCarousel />
      </div>
    </section>
  );
}

// ============================================
// EXAMPLE 6: Responsive Container
// ============================================
export function ResponsiveTestimonials() {
  return (
    <article className="testimonials-article">
      <style>{`
        .testimonials-article {
          width: 100%;
          max-width: 100%;
          padding: 0;
          margin: 0 auto;
        }

        /* Desktop */
        @media (min-width: 1200px) {
          .testimonials-article {
            padding: 80px 16px;
          }
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .testimonials-article {
            padding: 60px 12px;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .testimonials-article {
            padding: 48px 0;
          }
        }
      `}</style>

      <TestimonialsCarousel />
    </article>
  );
}

// ============================================
// USAGE IN Your Home Page
// ============================================

// In frontend/src/components/home-page.jsx:
// Add this import at the top:
// import { TestimonialsCarousel } from './testimonials-carousel';

// Then in your JSX, add somewhere:
// <TestimonialsCarousel />

// Example placement in home page:
/*
export function HomePage() {
  return (
    <div className="site-shell">
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialsCarousel />  // ← Right here!
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
*/

// ============================================
// STYLING HOOKS - CSS Classes Available
// ============================================

// Main containers
// .testimonials-section-shell        - Outer wrapper
// .testimonials-section              - Inner container
// .testimonials-heading              - Header area
// .testimonials-carousel-wrapper     - Carousel area

// Carousel elements
// .testimonials-scroll-container     - Scroll container
// .testimonial-card-wrapper          - Individual card
// .video-container                   - Video player
// .testimonial-info                  - Name/role/rating info

// Controls
// .carousel-nav-button               - Arrow buttons
// .carousel-indicators               - Dot indicators
// .video-unmute-button               - Mute/unmute button
// .video-progress-container          - Progress bar area

// Example custom styling:
// const customStyles = `
//   .testimonials-section-shell {
//     background: linear-gradient(180deg, #f0f9ff, white);
//   }
//   .video-container {
//     border-radius: 24px;
//   }
//   .carousel-nav-button {
//     background: linear-gradient(135deg, var(--accent-orange), #ffb27d);
//   }
// `;

// ============================================
// PERFORMANCE MONITORING
// ============================================

export function useTestimonialsPerformance() {
  useEffect(() => {
    // Monitor Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor video play events
    const videos = document.querySelectorAll('.testimonial-video');
    videos.forEach(video => {
      video.addEventListener('play', () => {
        console.log('Video playing:', video.src);
      });
    });

    return () => observer.disconnect();
  }, []);
}

// ============================================
// ACCESSIBILITY TESTING CHECKLIST
// ============================================

/*
□ Test with keyboard only (no mouse)
□ Test with screen reader (NVDA/VoiceOver)
□ Verify focus order is logical
□ Check focus visible indicator is clear
□ Test with magnification at 200%
□ Test with high contrast mode
□ Verify color contrast is sufficient
□ Test touch targets are 44x44px minimum
□ Verify ARIA labels are descriptive
□ Test reduced motion preference
*/

export default HomePageWithTestimonials;
