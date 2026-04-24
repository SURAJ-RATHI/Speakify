import { useEffect, useMemo } from 'react';
import { FaBookOpen, FaCalendarAlt, FaChevronRight, FaUserCircle } from 'react-icons/fa';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const formatDate = (value) => {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export function UserDashboardPage() {
  const {
    user,
    isAuthenticated,
    purchasedCourses,
    purchasedCoursesLoading,
    purchasedCoursesError,
    refreshPurchasedCourses,
  } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = useMemo(() => [
    {
      label: 'Purchased Courses',
      value: purchasedCourses.length,
      icon: FaBookOpen,
    },
    {
      label: 'Account Holder',
      value: user?.name || 'Student',
      icon: FaUserCircle,
    },
    {
      label: 'Last Update',
      value: purchasedCourses[0]?.purchase?.purchasedAt ? formatDate(purchasedCourses[0].purchase.purchasedAt) : 'Just now',
      icon: FaCalendarAlt,
    },
  ], [purchasedCourses, user?.name]);

  if (!isAuthenticated) {
    return <Navigate to="/auth?next=/dashboard" replace />;
  }

  return (
    <section className="dashboard-shell section-shell">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="eyebrow">Your Learning Space</span>
          <h1>Welcome back, {user?.name || 'Student'}.</h1>
          <p>
            This is your personal dashboard where you can review the courses you have purchased and continue your learning journey.
          </p>
        </div>

        <div className="dashboard-hero-panel">
          <div className="dashboard-avatar-large" aria-hidden="true">
            {user?.name ? user.name.trim().slice(0, 1).toUpperCase() : 'S'}
          </div>
          <div>
            <strong>{user?.name || 'Student'}</strong>
            <span>{user?.email || 'Signed in successfully'}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="dashboard-stat-card">
              <Icon />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          );
        })}
      </div>

      <div className="dashboard-section-header">
        <div>
          <span className="eyebrow">Purchased Courses</span>
          <h2>Your enrolled programs</h2>
        </div>
        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={() => refreshPurchasedCourses()}
          disabled={purchasedCoursesLoading}
        >
          {purchasedCoursesLoading ? 'Refreshing...' : 'Refresh Courses'}
        </button>
      </div>

      {purchasedCoursesError && (
        <div className="dashboard-alert dashboard-alert-error">
          {purchasedCoursesError}
        </div>
      )}

      {purchasedCoursesLoading ? (
        <div className="dashboard-empty-state">
          Loading your purchased courses...
        </div>
      ) : purchasedCourses.length === 0 ? (
        <div className="dashboard-empty-state">
          You have not purchased any courses yet. Explore the available programs to get started.
          <Link className="dashboard-empty-link" to="/">
            Explore courses
            <FaChevronRight />
          </Link>
        </div>
      ) : (
        <div className="dashboard-courses-grid">
          {purchasedCourses.map((course) => (
            <article key={course._id} className="dashboard-course-card">
              <div className="dashboard-course-top">
                <div>
                  <span className="dashboard-course-category">{course.category || 'Course'}</span>
                  <h3>{course.title || course.courseName || 'Purchased Course'}</h3>
                </div>
                <span className="dashboard-course-price">{formatInr(course.purchase?.amount ?? course.price)}</span>
              </div>

              <p className="dashboard-course-description">
                {course.description || 'This course is part of your purchased library.'}
              </p>

              <div className="dashboard-course-meta">
                <span>Instructor: {course.instructor || 'Speakify'}</span>
                <span>Level: {course.level || 'Beginner'}</span>
                <span>Purchased: {formatDate(course.purchase?.purchasedAt)}</span>
              </div>

              <div className="dashboard-course-footer">
                <span>{course.purchase?.currency || 'INR'}</span>
                <span>{course.isPublished ? 'Active Access' : 'Access Ready'}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
