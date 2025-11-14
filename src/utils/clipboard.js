/**
 * Clipboard utilities
 */

/**
 * Copies text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    throw new Error('Kon niet kopiëren naar clipboard');
  }
}

