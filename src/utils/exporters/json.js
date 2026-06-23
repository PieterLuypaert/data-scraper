/**
 * Export data to JSON file
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
export function exportToJSON(data, filename = 'scraped-data') {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to export JSON: ' + error.message);
  }
}
