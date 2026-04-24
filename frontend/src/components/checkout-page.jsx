import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { fetchCourseBySlug, mergeCourseWithServiceMeta } from '../utils/course-data';

export function CheckoutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseSlug = searchParams.get('course');
  const { accessToken, user, purchasedCourses, purchasedCoursesLoading, refreshPurchasedCourses } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState('');
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');

  const displayCourse = useMemo(() => (course ? mergeCourseWithServiceMeta(course) : null), [course]);
  const isCoursePurchased = (purchasedCourse) => {
    if (!displayCourse) return false;

    const purchasedId = String(purchasedCourse?._id || purchasedCourse?.id || purchasedCourse || '').toLowerCase();
    const purchasedSlug = String(purchasedCourse?.slug || purchasedCourse || '').toLowerCase();
    const courseId = String(displayCourse._id || '').toLowerCase();
    const courseSlugValue = String(displayCourse.slug || '').toLowerCase();

    return purchasedId === courseId || purchasedSlug === courseSlugValue;
  };
  const hasPurchasedCourse = useMemo(
    () =>
      Boolean(
        accessToken &&
        displayCourse &&
        purchasedCourses.some(isCoursePurchased),
      ),
    [accessToken, displayCourse, purchasedCourses],
  );

  useEffect(() => {
    if (!accessToken) {
      const checkoutPath = `/checkout?course=${courseSlug || ''}`;
      navigate(`/auth?next=${encodeURIComponent(checkoutPath)}`, { replace: true });
    }
  }, [accessToken, courseSlug, navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadCourse = async () => {
      if (!courseSlug) {
        setCourseLoading(false);
        setCourseError('Course not found');
        return;
      }

      setCourseLoading(true);
      setCourseError('');

      try {
        const courseData = await fetchCourseBySlug(courseSlug);
        if (!isMounted) return;

        setCourse(courseData);
      } catch (requestError) {
        if (!isMounted) return;

        setCourse(null);
        setCourseError(requestError.message || 'Course not found');
      } finally {
        if (isMounted) {
          setCourseLoading(false);
        }
      }
    };

    void loadCourse();

    return () => {
      isMounted = false;
    };
  }, [courseSlug]);

  if (courseLoading) {
    return (
      <section className="section-shell payment-page-shell">
        <div className="payment-card">
          <h1>Loading Course</h1>
          <p>Fetching the latest course details.</p>
        </div>
      </section>
    );
  }

  if (!displayCourse) {
    return (
      <section className="section-shell payment-page-shell">
        <div className="payment-card">
          <h1>Course Not Found</h1>
          <p>{courseError || "The course you're trying to purchase doesn't exist."}</p>
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

  if (hasPurchasedCourse) {
    return (
      <section className="section-shell payment-page-shell">
        <div className="payment-card">
          <span className="eyebrow">Course Enrollment</span>
          <h1>You already own this course</h1>
          <p>{user?.name || 'This account'} has already purchased <strong>{displayCourse.shortTitle}</strong>.</p>
          <button
            className="button button-primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </section>
    );
  }

  if (accessToken && purchasedCoursesLoading) {
    return (
      <section className="section-shell payment-page-shell">
        <div className="payment-card">
          <h1>Checking your enrollment</h1>
          <p>We are verifying whether you already have access to this course.</p>
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
      const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: displayCourse.slug,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const paymentId = orderData.data.paymentId;
      const orderId = orderData.data.orderId;
      const amount = orderData.data.amount;
      const currency = orderData.data.currency || 'INR';

      const loadRazorpayScript = () =>
        new Promise((resolve, reject) => {
          if (window.Razorpay) {
            resolve();
            return;
          }

          const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout')), { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
          document.body.appendChild(script);
        });

      await loadRazorpayScript();

      const options = {
        key: orderData.data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY',
        amount,
        currency,
        order_id: orderId,
        name: 'Speakify',
        description: `Enrollment for ${displayCourse.shortTitle}`,
        image: 'https://ik.imagekit.io/kzspvcbz5/speakify-logo.png',
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({
                paymentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              await refreshPurchasedCourses();
              navigate('/payment-success', {
                state: {
                  courseName: verifyData.data?.courseName || displayCourse.shortTitle,
                  amount: verifyData.data?.amount ?? displayCourse.priceInr,
                },
              });
              return;
            }

            throw new Error(verifyData.message || 'Payment verification failed');
          } catch (err) {
            setError(err.message || 'Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
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
      rzp.open();
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
            <span className="payment-value">{displayCourse.shortTitle}</span>
          </div>

          <div className="payment-item">
            <span className="payment-label">Duration</span>
            <span className="payment-value">{displayCourse.courseMeta?.duration || 'Self-paced'}</span>
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
            <span className="payment-value">{formatInr(displayCourse.priceInr)}</span>
          </div>
        </div>

        {error && <div className="payment-error">{error}</div>}

        <button
          className="button button-primary payment-button"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay ${formatInr(displayCourse.priceInr)}`}
        </button>

        <p className="payment-note">
          You will be redirected to Razorpay to complete your payment securely.
        </p>
      </div>
    </section>
  );
}
