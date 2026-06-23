/**
 * Prepare data for export by removing/limiting large fields
 * @param {Object} data - Data to prepare
 * @returns {Object} Prepared data without large fields
 */
export function prepareDataForExport(data) {
  const prepared = { ...data };

  // Remove screenshot if present (too large for export)
  if (prepared.screenshot) {
    prepared._hadScreenshot = true;
    delete prepared.screenshot;
  }

  // Remove other potentially large fields that aren't needed for export
  const fieldsToRemove = [
    'html', // Full HTML content is usually not needed
    'rawHtml', // Raw HTML content
    'domTree', // DOM tree representation
    'fullText', // Full text content (can be very large)
  ];

  fieldsToRemove.forEach(field => {
    if (prepared[field]) {
      delete prepared[field];
    }
  });

  // Don't limit arrays - export all data
  // Arrays are only limited during progressive compression if payload is too large (>10MB)
  // This ensures all data is exported by default

  // Also limit string fields that might be very long
  const stringFieldsToLimit = ['description', 'keywords', 'ogDescription'];
  stringFieldsToLimit.forEach(field => {
    if (prepared[field] && typeof prepared[field] === 'string' && prepared[field].length > 1000) {
      prepared[field] = prepared[field].substring(0, 1000) + '...';
      prepared[`${field}_truncated`] = true;
    }
  });

  return prepared;
}
