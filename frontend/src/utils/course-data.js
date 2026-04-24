import { services } from '../data/constant';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

const serviceOrder = services.map((service) => service.slug);

export const getServiceMeta = (slug) => services.find((service) => service.slug === slug) || null;

export const mergeCourseWithServiceMeta = (course) => {
  if (!course) return null;

  const meta = getServiceMeta(course.slug) || {};

  return {
    ...meta,
    ...course,
    title: course.title || meta.title || meta.shortTitle || 'Course',
    shortTitle: meta.shortTitle || course.title || course.shortTitle || 'Course',
    tagline: meta.tagline || '',
    cardDescription: meta.cardDescription || course.description || '',
    description: course.description || meta.description || '',
    icon: meta.icon || 'book',
    accent: meta.accent || 'var(--accent-orange)',
    priceInr: course.price ?? meta.priceInr ?? 0,
    stats: meta.stats || [],
    outcomes: meta.outcomes || [],
    courseMeta: meta.courseMeta || null,
    courses: meta.courses || [],
  };
};

export const sortCoursesForUi = (courses = []) => {
  const rankedCourses = [...courses];

  return rankedCourses.sort((left, right) => {
    const leftIndex = serviceOrder.indexOf(left.slug);
    const rightIndex = serviceOrder.indexOf(right.slug);

    if (leftIndex === -1 && rightIndex === -1) {
      return String(left.title || '').localeCompare(String(right.title || ''));
    }

    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
};

const parseCourseResponse = async (response) => {
  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Failed to load courses');
  }

  return payload.data || [];
};

export const fetchCourses = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/courses`, {
    method: 'GET',
    credentials: 'include',
  });

  return parseCourseResponse(response);
};

export const fetchCourseBySlug = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/courses/slug/${encodeURIComponent(slug)}`, {
    method: 'GET',
    credentials: 'include',
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Failed to load course');
  }

  return payload.data || null;
};
