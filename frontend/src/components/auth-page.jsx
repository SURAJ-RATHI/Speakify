import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

const normalizeRedirectPath = (value) => {
  if (typeof value !== 'string') return '/dashboard';

  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/dashboard';
  }

  return trimmed;
};

export function AuthPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation();

  const getPostAuthRedirect = () => {
    const params = new URLSearchParams(location.search);
    return normalizeRedirectPath(params.get('next'));
  };

  const handleGoogleAuth = () => {
    const nextPath = getPostAuthRedirect();
    sessionStorage.setItem('post_auth_redirect', nextPath);
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <Link to="/" className="auth-back-button">
          {'<- Back to Home'}
        </Link>

        <div className="auth-card">
          <div className="auth-content">
            <h1 className="auth-title">Welcome to Speak with amit</h1>
            <p className="auth-subtitle">Sign in with your Google account to access courses and start learning</p>

            <button
              type="button"
              className="auth-google-button"
              onClick={handleGoogleAuth}
            >
              <FaGoogle />
              Sign in with Google
            </button>

            <p className="auth-info">
              We use Google Sign-In to securely authenticate you. Your name and email from your Google account will be used and cannot be changed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
