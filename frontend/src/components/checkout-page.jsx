import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStoredAccessToken, getStoredAuthUser, decodeJwtPayload } from '../utils/auth';
import { services } from '../data/constant';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export function CheckoutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseSlug = searchParams.get('course');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseOwned, setCourseOwned] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);

  const accessToken = getStoredAccessToken();
  const user = getStoredAuthUser();
  const course = services.find((s) => s.slug === courseSlug);

  // Check if user already owns this course
  useEffect(() => {
    const checkOwnership = async () => {
      if (!accessToken || !course) {
        setCheckingOwnership(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/check-course-ownership`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({ courseId: course.slug }),
        });

        const data = await response.json();
        if (data.success && data.data?.owned) {
          setCourseOwned(true);
        }
      } catch (err) {
        console.error('Error checking course ownership:', err);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [accessToken, course]);

  useEffect(() => {
    if (!accessToken) {
      sessionStorage.setItem('post_auth_redirect', `/checkout?course=${courseSlug}`);
      window.location.href = `${API_BASE_URL}/api/auth/google`;
    }
  }, [accessToken, courseSlug]);

  if (!course) {
    return (
      <section className="section-shell payment-page-shell">
        <div className="payment-card">
          <h1>Course Not Found</h1>
          <p>The course you're trying to purchase doesn't exist.</p>
          <button
            className="button button-primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  const formatInr = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Create payment order in backend
      const orderResponse = await fetch(`${API_BASE_URL}/api/v1/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: course.slug,
          courseName: course.shortTitle,
          amount: course.priceInr,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const paymentId = orderData.data.paymentId;
      const razorpayOrderId = orderData.data.razorpayOrderId;

      if (!razorpayOrderId) {
        throw new Error('Razorpay order ID not received from server');
      }

      // Step 2: Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onerror = () => {
        setError('Failed to load Razorpay. Please check your internet connection.');
        setLoading(false);
      };

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY',
          order_id: razorpayOrderId,
          amount: course.priceInr * 100, // Amount in paise
          currency: 'INR',
          name: 'Speak with amit',
          description: `Enrollment for ${course.shortTitle}`,
          image: 'https://ik.imagekit.io/kzspvcbz5/speakify-logo.png',
          handler: async (response) => {
            try {
              // Step 3: Verify payment in backend
              const verifyResponse = await fetch(`${API_BASE_URL}/api/v1/payments/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                  paymentId,
                  razorpayOrderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyResponse.ok && verifyData.success) {
                navigate('/payment-success', {
                  state: {
                    courseName: course.shortTitle,
                    amount: course.priceInr,
                  },
                });
              } else {
                throw new Error(verifyData.message || 'Payment verification failed');
              }
            } catch (err) {
              setError(err.message || 'Payment verification failed. Please contact support.');
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#f97316',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async (response) => {
          try {
            // Log payment failure to backend
            await fetch(`${API_BASE_URL}/api/v1/payments/failure`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({
                paymentId,
                razorpayPaymentId: response.error.metadata?.payment_id,
                error: {
                  code: response.error.code,
                  description: response.error.description,
                },
              }),
            }).catch(() => {
              // If logging fails, still show error to user
              console.error('Failed to log payment failure to backend');
            });
          } catch (err) {
            console.error('Error handling payment failure:', err);
          }
          setError(`Payment failed: ${response.error.description}. Please try again.`);
          setLoading(false);
        });
        rzp.open();
        setLoading(false);
      };

      document.body.appendChild(script);
    } catch (err) {
      setError(err.message || 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section className="section-shell payment-page-shell">
      <div className="payment-card">
        <span className="eyebrow">Course Enrollment</span>
        <h1>Checkout</h1>

        <div className="payment-details">
          <div className="payment-item">
            <span className="payment-label">Course</span>
            <span className="payment-value">{course.shortTitle}</span>
          </div>

          <div className="payment-item">
            <span className="payment-label">Duration</span>
            <span className="payment-value">{course.duration || 'Self-paced'}</span>
          </div>

          <div className="payment-item">
            <span className="payment-label">Student Name</span>
            <span className="payment-value">{user?.name || 'N/A'}</span>
          </div>

          <div className="payment-item">
            <span className="payment-label">Email</span>
            <span className="payment-value">{user?.email || 'N/A'}</span>
          </div>

          <div className="payment-divider"></div>

          <div className="payment-item payment-total">
            <span className="payment-label">Total Amount</span>
            <span className="payment-value">{formatInr(course.priceInr)}</span>
          </div>
        </div>

        {error && <div className="payment-error">{error}</div>}

        {checkingOwnership ? (
          <button className="button button-primary payment-button" disabled>
            Checking...
          </button>
        ) : courseOwned ? (
          <>
            <div className="payment-success-note" style={{ marginBottom: '20px' }}>
              ✓ You have already purchased this course!
            </div>
            <button
              className="button button-primary payment-button"
              onClick={() => navigate('/my-profile')}
            >
              Start Learning
            </button>
          </>
        ) : (
          <button
            className="button button-primary payment-button"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay ${formatInr(course.priceInr)}`}
          </button>
        )}

        <p className="payment-note">
          You will be redirected to Razorpay to complete your payment securely.
        </p>
      </div>
    </section>
  );
}
