import { FaArrowRight, FaBookOpen, FaCommentDots, FaHeart, FaMicrophoneAlt, FaWhatsapp } from 'react-icons/fa';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
<<<<<<< HEAD
=======
import logo from '../../assets/logo1.png';
import footerLogo from '../../assets/logo2.png';
>>>>>>> 6976f4c24f6ce36997a1ba3bf2e448ec6eb7380d

const iconMap = {
  mic: FaMicrophoneAlt,
  message: FaCommentDots,
  heart: FaHeart,
};

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sectionHref = (id) => (location.pathname === '/' ? `#${id}` : `/#${id}`);
  const closeMenu = () => setIsMenuOpen(false);

  const scrollToSection = useCallback((id, behavior = 'smooth') => {
    const target = document.getElementById(id);
    if (!target) return;

    const header = document.querySelector('.site-header');
    const headerOffset = (header?.getBoundingClientRect().height || 0) + 20;
    const top = Math.max(target.getBoundingClientRect().top + window.scrollY - headerOffset, 0);

    window.scrollTo({ top, behavior });
  }, []);

  const handleSectionNavigation = useCallback(
    (id) => (event) => {
      event.preventDefault();
      closeMenu();

      if (location.pathname !== '/') {
        navigate(`/#${id}`);
        return;
      }

      const targetHash = `#${id}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState({}, '', targetHash);
      }
      scrollToSection(id);
    },
    [location.pathname, navigate, scrollToSection],
  );

  useEffect(() => {
    if (!location.hash) return;

    const sectionId = decodeURIComponent(location.hash.slice(1));
    const timerId = window.setTimeout(() => {
      scrollToSection(sectionId, 'smooth');
    }, 40);

    return () => window.clearTimeout(timerId);
  }, [location.hash, location.pathname, scrollToSection]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <div className="site-shell">
      <header className="site-header">
<<<<<<< HEAD
        <Link className="brand-mark" to="/" onClick={closeMenu} aria-label="Speak with amit home">
          {/* <img className="brand-logo" src="/images/logo.png" alt="Speak with amit"  /> */}
          
          <img
            className="brand-logo"
            src="/images/favicon.png"
            alt="Speak with amit"
            style={{ width: '100%', height: '50px', objectFit: 'contain' }}
          />

=======
        <Link className="brand-mark" to="/" onClick={closeMenu} aria-label="Speakify home">
          <img className="brand-logo" src={logo} alt="Speakify" />
          <span className="sr-only">Speakify</span>
>>>>>>> 6976f4c24f6ce36997a1ba3bf2e448ec6eb7380d
        </Link>
        <button 
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`site-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/why-choose-us" onClick={closeMenu}>Why Choose Us</NavLink>
          <a href={sectionHref('testimonials')} onClick={handleSectionNavigation('testimonials')}>Testimonials</a>
          <NavLink to="/about-instructor" onClick={closeMenu}>About Instructor</NavLink>
        </nav>
        <a className="nav-cta" href={sectionHref('courses')} onClick={handleSectionNavigation('courses')}>
          Courses
        </a>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-brand">
<<<<<<< HEAD
          {/* <img className="footer-brand-logo" src="/images/logo.png" alt="Speak with amit" /> */}
          
          <img
            className="footer-brand-logo"
            src="/images/logo1.png"
            alt="Speak with amit"
            style={{ width: '100%', height: '100px',  }}
          />

          <p>Helping learners become confident, expressive, and fluent speakers.</p>
        </div>
        <div className="footer-links">
=======
          <img className="footer-logo" src={footerLogo} alt="Speakify" />
          <span className="sr-only">Speakify</span>
          <p>Helping learners become confident, expressive, and fluent speakers.</p>
        </div>
        <div>
>>>>>>> 6976f4c24f6ce36997a1ba3bf2e448ec6eb7380d
          <span>Programs</span>
          <Link to="/services/public-speaking">Public Speaking</Link>
          <Link to="/services/english-speaking">English Speaking</Link>
          <Link to="/services/stammering-cure">Stammering Cure</Link>
          <Link to="/why-choose-us">Why Choose Us</Link>
          <Link to="/about-instructor">About Instructor</Link>
        </div>
<<<<<<< HEAD
        <div className="footer-links">
=======
        <div>
>>>>>>> 6976f4c24f6ce36997a1ba3bf2e448ec6eb7380d
          <span>Contact</span>
          <a href="mailto:hello@speakify.com">hello@speakify.com</a>
          <a href="tel:+910000000000">+91 00000 00000</a>
        </div>
      </footer>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, center = false }) {
  return (
    <div className={center ? 'section-heading section-heading-center' : 'section-heading'}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export function ServiceIcon({ name }) {
  const Icon = iconMap[name] ?? FaBookOpen;
  return <Icon />;
}

export function PrimaryActions() {
  return (
    <div className="hero-actions">
      <a className="button button-secondary color:var(--green)" href="https://wa.me/7838145463" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>
        <FaWhatsapp style={{ marginRight: '8px' }} />
        Whatsapp Me
      </a>
      <a className="button button-primary" href="#courses">
        Explore Courses
        <FaArrowRight />
      </a>
    </div>
  );
}

export function ServiceCard({ service }) {
  return (
    <Link className="service-card" to={`/services/${service.slug}`}>
      <div className="service-card-surface">
        <div className="service-card-top">
          <div className="service-card-icon" style={{ background: service.accent }}>
            <ServiceIcon name={service.icon} />
          </div>
          <p className="service-card-label">{service.eyebrow}</p>
        </div>
        <div className="service-card-body">
          <h3>{service.title}</h3>
          <p className="service-card-summary">{service.tagline.split(',')[0]}</p>
          <p className="service-card-description">{service.cardDescription}</p>
        </div>
        <div className="service-card-footer">
          <span className="service-card-stat">
            {service.priceInr ? `Starts at ${formatInr(service.priceInr)}` : service.stats[0]}
          </span>
          <span className="service-card-link">
            View details
            <FaArrowRight />
          </span>
        </div>
      </div>
    </Link>
  );
}
