/**
 * PDF theme constants aligned with the app's indigo design system (src/index.css).
 */
const THEME = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  bgMuted: '#F9FAFB',
  bgAccent: '#EEF2FF',
  link: '#4F46E5',
  white: '#FFFFFF',
  margin: 50,
  contentWidth: 495, // A4 (595) minus 2×margin
};

const FONTS = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
  oblique: 'Helvetica-Oblique',
};

const FONT_SIZE = {
  coverTitle: 28,
  coverSubtitle: 14,
  pageTitle: 22,
  section: 14,
  body: 10,
  caption: 8,
  statValue: 20,
  statLabel: 9,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  sectionGap: 20,
  rowHeight: 22,
  statCardHeight: 56,
  footerY: 30,
};

/** Bottom Y threshold before triggering a page break (leaves room for footer). */
const PAGE_BOTTOM = 720;

module.exports = {
  THEME,
  FONTS,
  FONT_SIZE,
  SPACING,
  PAGE_BOTTOM,
};
