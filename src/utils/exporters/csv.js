/**
 * Convert array of objects to CSV
 * @param {Array<Object>} data - Array of objects
 * @returns {string} CSV string
 */
function arrayToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value).replace(/"/g, '""');
      if (stringValue.includes(',') || stringValue.includes('\n')) {
        return `"${stringValue}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Export data to CSV file
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
export function exportToCSV(data, filename = 'scraped-data') {
  try {
    let csvString = '';

    if (Array.isArray(data)) {
      csvString = arrayToCSV(data);
    } else if (typeof data === 'object') {
      // If it's a single object, convert to array
      csvString = arrayToCSV([data]);
    } else {
      throw new Error('Data must be an object or array');
    }

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to export CSV: ' + error.message);
  }
}

/**
 * Export links to CSV
 * @param {Array} links - Array of link objects
 * @param {string} filename - Filename
 */
export function exportLinksToCSV(links, filename = 'links') {
  const csvData = links.map(link => ({
    text: link.text || '',
    url: link.href || '',
  }));
  exportToCSV(csvData, filename);
}

/**
 * Export images to CSV
 * @param {Array} images - Array of image objects
 * @param {string} filename - Filename
 */
export function exportImagesToCSV(images, filename = 'images') {
  const csvData = images.map(img => ({
    alt: img.alt || '',
    src: img.src || '',
  }));
  exportToCSV(csvData, filename);
}
