/**
 * Pragati Engineering College - PEC CampusTech
 * Frontend Security & Sanitization Utilities (XSS Prevention)
 */

/**
 * Escapes unsafe HTML characters to prevent XSS injection in template literals.
 * @param {string|any} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes URLs to prevent javascript: pseudo-protocol execution.
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^(javascript:|data:text\/html|vbscript:)/i.test(trimmed)) {
    return '#';
  }
  return trimmed;
}
