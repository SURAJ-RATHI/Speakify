import { useEffect } from 'react';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { SectionHeading } from './site';
import {
  aboutInstructorDetails,
  classroomImages,
  corporateTrainingProgram,
  instructorCertificates,
} from '../data/constant';

export function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="about-page">
      <div className="about-page-header">
        <Link to="/" className="back-link">
          <FaArrowLeft />
          Back to Home
        </Link>
        <SectionHeading
          eyebrow={aboutInstructorDetails.pageEyebrow}
          title={aboutInstructorDetails.pageTitle}
          description={aboutInstructorDetails.pageDescription}
          center
        />
      </div>

      <section className="about-page-content section-shell">
        <div className="about-instructor-grid">
          <div className="about-instructor-image-card">
            <img src={aboutInstructorDetails.photoUrl} alt="Instructor Amit Lamba" />
          </div>
          <div className="about-instructor-copy-card">
            <h3>Instructor Profile</h3>
            {aboutInstructorDetails.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p><strong>Mission:</strong> {aboutInstructorDetails.mission}</p>
            <ul className="about-list">
              {aboutInstructorDetails.values.map((value) => (
                <li key={value}>
                  <FaCheckCircle />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
            <p className="about-signature">~ Amit Lamba</p>
          </div>
        </div>

        <div className="about-values-section">
          <h3>Instructor Certificates</h3>
          <div className="gallery-grid">
            {instructorCertificates.map((certificate) => (
              <article className="gallery-card" key={certificate.id}>
                <img src={certificate.imageUrl} alt={certificate.title} />
                <div className="gallery-card-copy">
                  <h4>{certificate.title}</h4>
                  <p>{certificate.issuer}</p>
                  <span>{certificate.year}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="about-values-section">
          <h3>Classroom Moments</h3>
          <div className="gallery-grid">
            {classroomImages.map((image) => (
              <article className="gallery-card" key={image.id}>
                <img src={image.imageUrl} alt={image.caption} />
                <div className="gallery-card-copy">
                  <h4>{image.caption}</h4>
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="corporate-training-shell">
          <div className="corporate-training-head">
            <span className="eyebrow">{corporateTrainingProgram.eyebrow}</span>
            <h3>{corporateTrainingProgram.title}</h3>
            <p>{corporateTrainingProgram.intro}</p>
            <p>{corporateTrainingProgram.overview}</p>
          </div>

          <div className="corporate-training-grid">
            {corporateTrainingProgram.curriculum.map((item) => (
              <article className="corporate-module-card" key={item.module}>
                <h4>{item.module}</h4>
                <ul className="about-list">
                  {item.topics.map((topic) => (
                    <li key={topic}>
                      <FaCheckCircle />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="corporate-meta-grid">
            <article className="corporate-meta-card">
              <h4>Course Features</h4>
              <ul className="about-list">
                {corporateTrainingProgram.features.map((feature) => (
                  <li key={feature}>
                    <FaCheckCircle />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="corporate-meta-card">
              <h4>Organization Benefits</h4>
              <ul className="about-list">
                {corporateTrainingProgram.benefits.map((benefit) => (
                  <li key={benefit}>
                    <FaCheckCircle />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <div className="about-cta-section">
          <h3>Ready to join an offline batch?</h3>
          <p>Join our batch and elevate your speaking skills!</p>
          <Link className="button button-primary" to="/#courses">  
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
