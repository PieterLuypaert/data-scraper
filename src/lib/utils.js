import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "dompurify"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Escape regex metacharacters so a user search term is matched literally. */
function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Return HTML with occurrences of `query` wrapped in <mark>, safe to pass to
 * dangerouslySetInnerHTML. Both the scraped text and the (escaped) query are
 * sanitized with DOMPurify, so neither malicious scraped content nor a crafted
 * search term can inject script. Only the <mark> highlight tag survives.
 *
 * @param {string} text - raw text (may contain attacker-controlled scraped HTML)
 * @param {string} query - user search term
 * @returns {string} sanitized HTML string
 */
export function highlightSafe(text, query) {
  const safeText = String(text ?? "")
  if (!query) {
    return DOMPurify.sanitize(safeText, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  }
  // Escape the source text first (neutralize any raw HTML), then inject <mark>.
  const escapedText = safeText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi")
  const marked = escapedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  return DOMPurify.sanitize(marked, { ALLOWED_TAGS: ["mark"], ALLOWED_ATTR: ["class"] })
}

