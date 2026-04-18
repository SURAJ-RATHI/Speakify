import { useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SectionHeading } from "./site";
import { whyChooseUs } from "../data/constant";

export function WhyChooseUsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="why-page">
      <div className="about-page-header">
        <Link to="/" className="back-link">
          <FaArrowLeft />
          Back to Home
        </Link>
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Why learners trust Speakify"
          description="A dedicated page where each promise is paired with visuals. You can replace any image URL from constant.js."
          center
        />
      </div>

      <section className="section-shell why-page-content">
        <div className="why-page-grid">
          {whyChooseUs.map((item) => (
            <article className="why-page-card" key={item.title}>
              <div className="why-page-image-wrap">
                <img src={item.imageUrl} alt={item.imageAlt ?? item.title} />
              </div>
              <div className="why-page-copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
