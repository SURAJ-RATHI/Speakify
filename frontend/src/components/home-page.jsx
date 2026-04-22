import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  FaArrowRight,
  FaEnvelope,
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaPlay,
  FaTwitter,
  FaUserCircle,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { PrimaryActions, SectionHeading, ServiceCard } from '../components/site';
import {
  aboutInstructorPreview,
  classroomImages,
  faqs,
  heroContent,
  instructorCertificates,
  services,
} from '../data/constant';
import { TestimonialsCarousel } from './testimonials-carousel';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Static constants - moved outside component to avoid recreation on every render
const INSTRUCTOR_QUICK_PLATFORMS = ['whatsapp', 'youtube', 'linkedin', 'instagram', 'twitter', 'email'];

const socialIconMap = {
  whatsapp: FaWhatsapp,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  instagram: FaInstagram,
  twitter: FaTwitter,
  youtube: FaYoutube,
  email: FaEnvelope,
  profile: FaUserCircle,
  "about instructor": FaUserCircle,
};

const socialColorMap = {
  whatsapp: "#25D366",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  youtube: "#FF0000",
  email: "var(--accent-orange)",
  profile: "#ffffff",
  "about instructor": "#ffffff",
};

const FeedbackForm = React.memo(function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!submitStatus) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmitStatus(null);
      setSubmitMessage('');
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [submitStatus]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const validationError = Array.isArray(data?.errors) && data.errors.length > 0
          ? data.errors.map((error) => `${error.field}: ${error.message}`).join('. ')
          : null;
        throw new Error(validationError || data.message || 'Something went wrong while sending your feedback.');
      }

      if (data.success) {
        console.log('Feedback submitted successfully:', data);
        setSubmitStatus('success');
        setSubmitMessage(data.message || 'Thank you. We have received your message and will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return (
    <section className="section-shell feedback-shell">
      <div className="feedback-container">
        <div className="feedback-content">
          <SectionHeading
            eyebrow="We'd Love to Hear From You"
            title="Share your feedback or get in touch"
            description="Have questions, suggestions, or just want to say hello? Fill out the form below and we'll be in touch soon."
            center
          />
        </div>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-form-row">
            <div className="feedback-form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>

            <div className="feedback-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="abc@example.com"
                required
              />
            </div>
          </div>

          <div className="feedback-form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us your thoughts, questions, or feedback..."
              rows="5"
              required
            ></textarea>
          </div>

          {submitStatus === 'success' && (
            <div className="feedback-message feedback-message-success">
              {submitMessage}
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="feedback-message feedback-message-error">
              {submitMessage}
            </div>
          )}

          <button
            type="submit"
            className="button button-primary feedback-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
            {!isSubmitting && <FaArrowRight />}
          </button>
        </form>
      </div>
    </section>
  );
});

export function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const firstClassroomImage = classroomImages[0];
  
  // Memoize instructor links calculation to avoid unnecessary filtering on every render
  const instructorQuickLinks = useMemo(() => {
    return INSTRUCTOR_QUICK_PLATFORMS
      .map((platform) => heroContent.socials.find((social) => social.platform.toLowerCase() === platform))
      .filter(Boolean);
  }, []);

  return (
    <>
      <section className="hero-section section-shell">
        <div className="hero-copy">
          <span className="eyebrow">
            <FaGlobe style={{ fontSize: '1.2em' }} />
            {heroContent.eyebrow}
          </span>
          <h1>
            {heroContent.title}
            {' '}
            <span className="hero-highlight-word">{heroContent.highlightedWord}</span>
          </h1>
          {heroContent.subtitle ? <p>{heroContent.subtitle}</p> : null}
          <PrimaryActions />
        </div>
      </section>

      <section className="section-shell about-instructor-quick-section" id="about">
        <div className="about-instructor-quick-layout">
          <article className="about-instructor-quick-copy">
            <SectionHeading
              eyebrow={aboutInstructorPreview.eyebrow}
              title={aboutInstructorPreview.title}
              description={aboutInstructorPreview.text}
            />
            <div className="about-actions">
              <Link className="button button-primary" to={aboutInstructorPreview.readMorePath}>
                View more about instructor
                <FaArrowRight />
              </Link>
            </div>
          </article>

          <aside className="about-instructor-quick-right">
            <p className="about-signature">~ Amit Lamba</p>
            <div className="about-instructor-portrait-wrap">
              <img src={heroContent.rightPanelImageUrl} alt={heroContent.rightPanelImageAlt} loading="lazy" />
              <span>Instructor portrait</span>
            </div>
            <div className="about-instructor-quick-socials">
              {instructorQuickLinks.map((social) => {
                const platform = social.platform.toLowerCase();
                const Icon = socialIconMap[platform] ?? FaArrowRight;
                const iconColor = socialColorMap[platform] ?? "var(--text-soft)";
                const isExternal = /^(https?:\/\/|mailto:|tel:)/i.test(social.url);

                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    title={social.label}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                  >
                    <Icon className="hero-social-icon" style={{ color: iconColor }} />
                    <span>{social.platform}</span>
                  </a>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <section className="section-shell" id="courses">
        <SectionHeading
          eyebrow="Our Courses"
          title="Three focused paths for stronger speaking skills"
          description="Choose the learning journey that matches your biggest communication goal and move forward with guided practice."
        />
        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="section-shell" id="testimonials">
        <SectionHeading
          eyebrow="Video Testimonials"
          title="Real feedback from learners"
          description="Use the arrow buttons at the bottom-right to slide through testimonials."
          center
        />
        <TestimonialsCarousel />
      </section>

      <section className="section-shell about-minimal" id="about-preview">
        <div className="about-instructor-preview-shell">
          <div className="about-instructor-preview-copy">
            <SectionHeading
              eyebrow={aboutInstructorPreview.eyebrow}
              title={aboutInstructorPreview.title}
              description={aboutInstructorPreview.text2}
            />
            <p className="about-signature">~ {aboutInstructorPreview.signature}</p>
            <div className="about-actions">
              <Link className="button button-primary" to={aboutInstructorPreview.readMorePath}>
                Read More
                <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="about-instructor-preview-media">
            <img src={firstClassroomImage.imageUrl} alt={firstClassroomImage.caption} loading="lazy" />
            <div className="about-preview-meta">
              <span>20+ Years of Industry Experience</span>
              <span>Specialized in Public Speaking</span>
              <span>Taken more than 100+ confrences</span>
              <span>{instructorCertificates.length}+ Instructor Certificates</span>
              <span>{classroomImages.length}+ Classroom Moments</span>
              <span>Real usecases and Doubt Solving</span>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="section-shell">
        <SectionHeading
          eyebrow="Offline Courses"
          title="Classroom programs with online payment support"
          description="Add, remove, or edit any course from constant.js."
        />
        <div className="course-grid">
          {offlineCourses.map((course) => (
            <article className="course-card" key={course.id}>
              <h3>{course.name}</h3>
              <p>{course.audience}</p>
              <div className="course-tags">
                <span>{course.duration}</span>
                <span>{course.schedule}</span>
                <span>{course.fee}</span>
                <span>{course.paymentMode}</span>
              </div>
            </article>
          ))}
        </div>
      </section> */}

      <section className="section-shell">
        <SectionHeading
          eyebrow="Program Overview"
          title="Watch how our sessions work"
          description="This section can be replaced with your original class clips any time from the constants data."
          center
        />
        <div className="about-video-preview">
          <div className="video-card-badge">
            <FaPlay />
            Session walkthrough
          </div>
          <div className="video-frame">
            <iframe
              src="https://www.youtube.com/embed/fHjq16kUFz0?start=297"
              title="Speak with amit introduction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <FeedbackForm />

      <section className="section-shell cta-panel" id="cta">
        <div>
          <span className="eyebrow">Start Your Journey</span>
          <h2>Transform your speaking skills to the next level with focused, confidence-building practice.</h2>
          <p>
            Join a learning path that is structured, supportive, and built to help you speak with more fluency, calm, and presence.
          </p>
        </div>
        <div className="cta-actions">
          <Link className="button button-primary" to="/services/public-speaking">
            Explore Programs
          </Link>
          <a className="button button-secondary" href="mailto:hello@speakify.com">
            Talk To Us
            <FaArrowRight />
          </a>
        </div>
      </section>

      <section className="section-shell faq-shell">
        <SectionHeading
          eyebrow="Helpful Answers"
          title="Questions learners usually ask before joining"
          description="A simple FAQ layer helps the page feel complete and production-ready while covering key decision points."
        />
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
