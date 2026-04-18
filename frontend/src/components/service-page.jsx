import { useEffect } from 'react';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaArrowRight,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SectionHeading } from '../components/site';
import { offlineBatchBaseDetails, servicePageDetails, services } from '../data/constant';
import { getStoredAccessToken } from '../utils/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export function ServicePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const { slug } = useParams();
  const service = services.find((item) => item.slug === slug);
  const pageDetails = slug ? servicePageDetails[slug] : null;
  const fullBatchDetails = pageDetails
    ? [...offlineBatchBaseDetails, ...(pageDetails.extraDetails ?? [])]
    : offlineBatchBaseDetails;

  if (!service) {
    return (
      <section className="section-shell service-page-shell">
        <h1>Service not found</h1>
        <p>The page you requested does not exist.</p>
        <Link className="button button-primary" to="/">
          Back home
        </Link>
      </section>
    );
  }

  const formatInr = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const handleEnrollNow = (event) => {
    event.preventDefault();
    const checkoutPath = `/checkout?course=${service.slug}`;
    const accessToken = getStoredAccessToken();

    if (accessToken) {
      navigate(checkoutPath);
      return;
    }

    sessionStorage.setItem('post_auth_redirect', checkoutPath);
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <section className="section-shell service-page-shell">
      <Link className="back-link" to="/">
        <FaArrowLeft />
        Back to home
      </Link>

      <div className="course-hero-shell">
        <div className="course-hero-copy">
          <span className="eyebrow">{service.eyebrow}</span>
          <h1 className="course-hero-title">
            <span>{service.shortTitle}</span>: {service.tagline}
          </h1>
          <p className="course-hero-description">{service.description}</p>
          <p className="course-price-note">Program fee: {formatInr(service.priceInr)}</p>
          <div className="course-hero-points">
            {service.stats.map((item) => (
              <div className="course-hero-point" key={item}>
                <FaCheckCircle />
                <p>{item}</p>
              </div>
            ))}
          </div>
          <Link
            className="button button-primary course-enroll-button"
            to={`/checkout?course=${service.slug}`}
            onClick={handleEnrollNow}
          >
            Enroll Now
            <FaArrowRight />
          </Link>
        </div>
        <div className="course-hero-media" style={{ '--service-accent': service.accent }}>
          <img src={pageDetails?.heroImageUrl} alt={pageDetails?.heroImageAlt ?? `${service.title} batch`} />
          <p>
            <strong>Offline Batch Venue:</strong> Classroom-based training with Amit Lamba
          </p>
          <p className="course-hero-media-note">
            Replace this image from `servicePageDetails` in `constant.js` with your actual classroom photo.
          </p>
        </div>
      </div>

      <div className="service-detail-grid">
        <div className="service-detail-card">
          <SectionHeading
            eyebrow="What You Will Build"
            title="Program outcomes"
            description="Each path is built around practical speaking goals, not passive content consumption."
          />
          <div className="outcome-list">
            {service.outcomes.map((item) => (
              <div className="outcome-item" key={item}>
                <FaCheckCircle />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="service-detail-card">
          <SectionHeading
            eyebrow="Offline Batch Details"
            title="Everything included in this batch"
            description="Core information learners usually need before enrolling in an offline classroom program."
          />
          <div className="offline-details-grid">
            {fullBatchDetails.map((item) => (
              <article className="offline-detail-card" key={item.label}>
                <div>
                  <FaMapMarkerAlt />
                  <span>{item.label}</span>
                </div>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="service-detail-card courses-shell">
        <SectionHeading
          eyebrow="Why This Works"
          title={`Why learners choose this ${service.shortTitle} offline batch`}
          description="These are practical reasons this in-person format delivers stronger communication outcomes."
        />
        <div className="outcome-list">
          {(pageDetails?.whyChoose ?? []).map((item) => (
            <div className="outcome-item" key={item}>
              <FaCheckCircle />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="service-detail-card courses-shell">
        <SectionHeading
          eyebrow="Detailed Curriculum"
          title={`What Amit Lamba will teach in ${service.shortTitle}`}
          description="Module-wise coverage to show exactly how the offline batch is structured."
        />
        <div className="curriculum-grid">
          {(pageDetails?.curriculum ?? []).map((module) => (
            <article className="curriculum-card" key={module.module}>
              <h3>{module.module}</h3>
              <ul>
                {module.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="service-detail-card courses-shell" id="course-list">
        <SectionHeading
          eyebrow="Batch Options"
          title={`Offline batch options under ${service.shortTitle}`}
          description="Choose the schedule that best matches your timing while keeping the same core coaching quality."
        />
        <div className="course-grid">
          {service.courses.map((course) => (
            <article className="course-card" key={course.name}>
              <h3>{course.name}</h3>
              <p>{course.audience}</p>
              <div className="course-tags">
                <span>{course.duration}</span>
                <span>{course.mode}</span>
                {course.feeInr ? <span>{formatInr(course.feeInr)}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="service-detail-card courses-shell faq-shell-lite">
        <SectionHeading
          eyebrow="Q&A"
          title="Frequently asked questions before enrollment"
          description="Quick clarity for common doubts learners have before joining an offline batch."
        />
        <div className="faq-list">
          {(pageDetails?.faqs ?? []).map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
