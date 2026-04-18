import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

export function PaymentSuccessPage() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const courseName = location.state?.courseName || 'Your Course';
  const amount = location.state?.amount || 0;

  const formatInr = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <section className="section-shell payment-page-shell">
      <div className="payment-card">
        <div className="payment-success-icon">
          <FaCheckCircle />
        </div>

        <h1>Payment Successful!</h1>
        <p className="payment-success-message">
          Your enrollment in <strong>{courseName}</strong> has been confirmed.
        </p>

        <div className="payment-success-details">
          <div className="success-item">
            <span>Course</span>
            <strong>{courseName}</strong>
          </div>
          <div className="success-item">
            <span>Amount Paid</span>
            <strong>{formatInr(amount)}</strong>
          </div>
        </div>

        <p className="payment-note payment-success-note">
          A confirmation email has been sent to your registered email address. You can now access the course materials.
        </p>

        <div className="payment-actions">
          <Link to="/" className="button button-primary">
            Back to Home
          </Link>
          <a href="/my-courses" className="button button-secondary">
            View My Courses
          </a>
        </div>
      </div>
    </section>
  );
}
