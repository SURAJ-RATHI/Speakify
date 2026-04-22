import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearAuthSession, refreshAuthSession, setAuthSession } from '../utils/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export function GoogleAuthSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let ignore = false;

    const completeGoogleSignin = async () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('accessToken');

      if (!accessToken) {
        navigate('/auth?error=google_auth_failed', { replace: true });
        return;
      }

      clearAuthSession();
      setAuthSession({ accessToken });

      try {
        await refreshAuthSession(API_BASE_URL);
      } catch {
        setMessage('Signed in, but profile sync is pending. Redirecting...');
      }

      if (ignore) return;

      const redirectPath = sessionStorage.getItem('post_auth_redirect') || '/';
      sessionStorage.removeItem('post_auth_redirect');
      navigate(redirectPath, { replace: true });
    };

    completeGoogleSignin();

    return () => {
      ignore = true;
    };
  }, [location.search, navigate]);

  return (
    <section className="section-shell payment-page-shell">
      <div className="payment-card">
        <span className="eyebrow">Google Login</span>
        <h1>Please wait</h1>
        <p>{message}</p>
      </div>
    </section>
  );
}

