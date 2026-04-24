import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAuthSession } from '../utils/auth';
import { useAuth } from '../context/auth-context';

const normalizeRedirectPath = (value) => {
  if (typeof value !== 'string') return '/dashboard';

  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/dashboard';
  }

  return trimmed;
};

export function GoogleAuthSuccessPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const completeGoogleSignin = async () => {
      const redirectPath = normalizeRedirectPath(sessionStorage.getItem('post_auth_redirect'));
      sessionStorage.removeItem('post_auth_redirect');

      try {
        const session = await refreshAuthSession((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, ''));
        setSession(session);
        window.location.replace(redirectPath);
      } catch {
        navigate('/auth?error=google_auth_failed', { replace: true });
      }
    };

    completeGoogleSignin();
  }, [navigate, setSession]);

  return (
    <section className="section-shell payment-page-shell">
      <div className="payment-card">
        <span className="eyebrow">Google Login</span>
        <h1>Please wait</h1>
        <p>Completing Google sign-in...</p>
      </div>
    </section>
  );
}

