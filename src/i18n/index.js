/**
 * i18n (Internationalization) system for multi-language support
 */

import nl from './locales/nl.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';

const translations = {
  nl,
  en,
  fr,
  de,
  es
};

// Get language from localStorage or browser, default to 'nl'
function getDefaultLanguage() {
  const stored = localStorage.getItem('app_language');
  if (stored && translations[stored]) {
    return stored;
  }
  
  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0];
  if (translations[browserLang]) {
    return browserLang;
  }
  
  return 'nl'; // Default to Dutch
}

let currentLanguage = getDefaultLanguage();

/**
 * Set the current language
 * @param {string} lang - Language code (nl, en, fr, de, es)
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('app_language', lang);
    // Trigger a custom event so components can react
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  }
}

/**
 * Get the current language
 * @returns {string} Current language code
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Get translation for a key
 * @param {string} key - Translation key (e.g., 'app.title' or 'tabs.scrape')
 * @param {object} params - Optional parameters for interpolation
 * @returns {string} Translated string
 */
export function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      // Fallback to Dutch if translation not found
      value = translations.nl;
      for (const k2 of keys) {
        if (value && typeof value === 'object') {
          value = value[k2];
        } else {
          return key; // Return key if no translation found
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Simple parameter interpolation
  return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? params[paramKey] : match;
  });
}

/**
 * Format date according to current locale
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const format = t('export.dateFormat');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);
}

/**
 * Format time according to current locale
 * @param {Date} date - Date to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const format = t('export.timeFormat');
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  if (format.includes('A')) {
    // 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return format
      .replace('hh', String(hour12).padStart(2, '0'))
      .replace('mm', minutes)
      .replace('ss', seconds)
      .replace('A', ampm);
  } else {
    // 24-hour format
    return format
      .replace('HH', String(hours).padStart(2, '0'))
      .replace('mm', minutes)
      .replace('ss', seconds);
  }
}

/**
 * Format datetime according to current locale
 * @param {Date} date - Date to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Get available languages
 * @returns {Array} Array of language objects with code and name
 */
export function getAvailableLanguages() {
  return [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];
}

// Initialize language on load
setLanguage(getDefaultLanguage());

