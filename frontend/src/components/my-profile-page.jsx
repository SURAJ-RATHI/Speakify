import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAccessToken, getStoredAuthUser, clearAuthSession } from '../utils/auth';
import { services } from '../data/constant';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export function MyProfilePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const accessToken = getStoredAccessToken();
  const user = getStoredAuthUser();

  useEffect(() => {
    if (!accessToken) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch profile');
        }

        setProfileData(data.data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken, navigate]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    clearAuthSession();
    navigate('/');
  };

  const handleExploreAll = () => {
    navigate('/#courses');
  };

  const getCourseDetails = (courseId) => {
    return services.find((s) => s.slug === courseId);
  };

  if (loading) {
    return (
      <section className="profile-page-shell">
        <div className="profile-loading">
          <p>Loading your profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page-shell">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-image-wrapper">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-details">
              <h1>{user?.name || 'User'}</h1>
              <p className="profile-email">{user?.email || 'N/A'}</p>
              <div className="profile-meta">
                <span className="member-since">
                  Member since {new Date(user?.iat * 1000 || Date.now()).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn-logout"
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>

        {error && <div className="profile-error">{error}</div>}

        {/* Purchased Courses Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>My Batches</h2>
            <span className="course-count">
              {profileData?.purchasedCourses?.length || 0} course{profileData?.purchasedCourses?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {profileData?.purchasedCourses && profileData.purchasedCourses.length > 0 ? (
            <div className="courses-grid">
              {profileData.purchasedCourses.map((purchase) => {
                const courseDetails = getCourseDetails(purchase.courseId);
                return (
                  <div key={purchase.courseId} className="course-card purchased">
                    <div className="course-badge">Purchased</div>
                    <h3>{purchase.courseName}</h3>
                    <p className="course-purchased-date">
                      Purchased on {new Date(purchase.purchasedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {courseDetails && (
                      <p className="course-description">
                        {courseDetails.tagline}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't purchased any courses yet.</p>
              <p className="empty-state-sub">Explore our courses to get started.</p>
            </div>
          )}
        </div>

        {/* Explore All Courses */}
        <div className="profile-section explore-section">
          <button
            className="button button-primary btn-explore-all"
            onClick={handleExploreAll}
          >
            Explore All Courses
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
