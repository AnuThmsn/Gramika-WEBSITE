// Centralized configuration for accessing backend resources
// Use API_BASE for all network requests, and buildImageUrl() to generate
// fully-qualified URLs for images returned by the backend.

export const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Convert a possibly-relative image path into a full URL pointing at the
 * backend.  If the value already appears to be an absolute URL (starts with
 * http or data URI) it is returned unmodified.
 *
 * @param {string} path  the path stored in the database ("/uploads/.." or
 *                       "/api/uploads/..." or an absolute URL)
 * @returns {string} full URL safe for <img src>
 */
export function buildImageUrl(path) {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed; // already absolute
  }
  // ensure leading slash
  const withSlash = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
  return API_BASE + withSlash;
}
