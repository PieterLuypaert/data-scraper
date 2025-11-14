/**
 * URL validation utilities
 */

/**
 * Validates if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates and normalizes a URL input
 * @param {string} url - The URL to validate
 * @returns {{isValid: boolean, error?: string, normalizedUrl?: string}}
 */
export function validateUrl(url) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return {
      isValid: false,
      error: 'Voer alstublieft een URL in',
    };
  }

  if (!isValidUrl(trimmedUrl)) {
    return {
      isValid: false,
      error: 'Ongeldige URL. Zorg ervoor dat de URL begint met http:// of https://',
    };
  }

  return {
    isValid: true,
    normalizedUrl: trimmedUrl,
  };
}

