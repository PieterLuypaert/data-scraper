/**
 * Export utilities for JSON, CSV, Excel, and PDF
 */

const API_BASE_URL = '/api';

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

/**
 * Prepare data for export by removing/limiting large fields
 * @param {Object} data - Data to prepare
 * @returns {Object} Prepared data without large fields
 */
function prepareDataForExport(data) {
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
  
  // Limit very large arrays to prevent payload issues
  // Keep enough data for useful export but prevent 413 errors
  // Very conservative limits to ensure payload stays under ~1MB
  const arrayLimits = {
    links: 50,
    images: 30,
    headings: 30,
    paragraphs: 50,
    tables: 20,
    forms: 20,
    videos: 20,
    scripts: 20,
    stylesheets: 20,
    metaTags: 30,
  };
  
  Object.keys(arrayLimits).forEach(key => {
    if (prepared[key] && Array.isArray(prepared[key])) {
      const limit = arrayLimits[key];
      if (prepared[key].length > limit) {
        prepared[`${key}_total`] = prepared[key].length;
        prepared[key] = prepared[key].slice(0, limit);
        prepared[`${key}_truncated`] = true;
      }
    }
  });
  
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

/**
 * Export data to Excel file
 * @param {Object} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
export async function exportToExcel(data, filename = 'scraped-data') {
  try {
    let preparedData = prepareDataForExport(data);
    
    // Check payload size before sending and compress if needed
    let payload = JSON.stringify({ data: preparedData });
    let payloadSizeMB = payload.length / (1024 * 1024);
    
    // Progressive compression: reduce arrays if payload is too large
    // Only compress if payload is very large (>10MB) to avoid unnecessary data loss
    // Let the server handle smaller payloads
    if (payloadSizeMB > 10) {
      console.warn(`Payload size is ${payloadSizeMB.toFixed(2)}MB, compressing...`);
      const compressionLevels = [
        { threshold: 10, maxArraySize: 100 },
        { threshold: 20, maxArraySize: 50 },
        { threshold: 50, maxArraySize: 25 },
      ];
      
      for (const level of compressionLevels) {
        if (payloadSizeMB > level.threshold) {
          console.warn(`Compressing to max ${level.maxArraySize} items per array...`);
          const moreCompressed = { ...preparedData };
          Object.keys(moreCompressed).forEach(key => {
            if (Array.isArray(moreCompressed[key]) && moreCompressed[key].length > level.maxArraySize) {
              moreCompressed[`${key}_total`] = moreCompressed[key].length;
              moreCompressed[key] = moreCompressed[key].slice(0, level.maxArraySize);
              moreCompressed[`${key}_truncated`] = true;
            }
          });
          preparedData = moreCompressed;
          payload = JSON.stringify({ data: preparedData });
          payloadSizeMB = payload.length / (1024 * 1024);
        }
      }
    }
    
    // Log payload size for debugging, but don't block small payloads
    if (payloadSizeMB > 1) {
      console.log(`Exporting with payload size: ${payloadSizeMB.toFixed(2)}MB`);
    }
    
    const response = await fetch(`${API_BASE_URL}/export/excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (!response.ok) {
      // Handle 413 Payload Too Large specifically
      if (response.status === 413) {
        throw new Error(`Server weigert export: payload te groot (${payloadSizeMB.toFixed(2)}MB). De server heeft een limiet ingesteld. Probeer een kleinere dataset of verwijder grote arrays.`);
      }
      
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(errorData.error || 'Failed to export Excel');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to export Excel: ' + error.message);
  }
}

/**
 * Export data to PDF file
 * @param {Object} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
export async function exportToPDF(data, filename = 'scraped-data') {
  try {
    // Remove screenshot from payload to avoid 413 errors
    // Screenshots are typically very large as base64 strings
    let preparedData = prepareDataForExport(data);
    
    // Check payload size before sending and compress if needed
    let payload = JSON.stringify({ data: preparedData });
    let payloadSizeMB = payload.length / (1024 * 1024);
    
    // Progressive compression: reduce arrays if payload is too large
    // Only compress if payload is very large (>10MB) to avoid unnecessary data loss
    // Let the server handle smaller payloads
    if (payloadSizeMB > 10) {
      console.warn(`PDF payload size is ${payloadSizeMB.toFixed(2)}MB, compressing...`);
      const compressionLevels = [
        { threshold: 10, maxArraySize: 100 },
        { threshold: 20, maxArraySize: 50 },
        { threshold: 50, maxArraySize: 25 },
      ];
      
      for (const level of compressionLevels) {
        if (payloadSizeMB > level.threshold) {
          console.warn(`Compressing to max ${level.maxArraySize} items per array...`);
          const moreCompressed = { ...preparedData };
          Object.keys(moreCompressed).forEach(key => {
            if (Array.isArray(moreCompressed[key]) && moreCompressed[key].length > level.maxArraySize) {
              moreCompressed[`${key}_total`] = moreCompressed[key].length;
              moreCompressed[key] = moreCompressed[key].slice(0, level.maxArraySize);
              moreCompressed[`${key}_truncated`] = true;
            }
          });
          preparedData = moreCompressed;
          payload = JSON.stringify({ data: preparedData });
          payloadSizeMB = payload.length / (1024 * 1024);
        }
      }
    }
    
    // Log payload size for debugging, but don't block small payloads
    if (payloadSizeMB > 1) {
      console.log(`Exporting PDF with payload size: ${payloadSizeMB.toFixed(2)}MB`);
    }
    
    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    // Check content type to determine if it's an error
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      // Handle 413 Payload Too Large specifically
      if (response.status === 413) {
        throw new Error(`Server weigert export: payload te groot (${payloadSizeMB.toFixed(2)}MB). De server heeft een limiet ingesteld. Probeer een kleinere dataset of verwijder grote arrays.`);
      }
      
      // Try to parse as JSON first
      let errorMessage = 'Failed to export PDF';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonError) {
        // If not JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText.includes('<!DOCTYPE')) {
            errorMessage = 'Server error: Received HTML instead of PDF. Check server logs.';
          } else {
            errorMessage = errorText.substring(0, 200);
          }
        } catch (textError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    // Check if response is actually a PDF
    if (!contentType || !contentType.includes('application/pdf')) {
      const errorText = await response.text();
      throw new Error('Server returned non-PDF content. ' + errorText.substring(0, 100));
    }

    const blob = await response.blob();
    
    // Verify it's actually a PDF blob
    if (blob.type && !blob.type.includes('pdf')) {
      throw new Error('Downloaded file is not a PDF');
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to export PDF: ' + error.message);
  }
}

/**
 * Export multiple scrapes (batch export)
 * @param {Array} scrapes - Array of scrape history items
 * @param {string} format - 'json', 'csv', or 'excel'
 * @param {string} filename - Filename
 */
export async function batchExport(scrapes, format = 'json', filename = 'batch-export') {
  if (format === 'json') {
    exportToJSON(scrapes, filename);
  } else if (format === 'csv') {
    // Flatten the data for CSV
    const csvData = scrapes.map(scrape => ({
      id: scrape.id,
      url: scrape.url,
      timestamp: scrape.timestamp,
      title: scrape.data?.title || '',
      linksCount: scrape.data?.links?.length || 0,
      imagesCount: scrape.data?.images?.length || 0,
    }));
    exportToCSV(csvData, filename);
  } else if (format === 'excel') {
    await batchExportToExcel(scrapes, filename);
  } else {
    throw new Error('Invalid format. Use "json", "csv", or "excel"');
  }
}

/**
 * Batch export to Excel
 * @param {Array} scrapes - Array of scrape history items
 * @param {string} filename - Filename
 */
async function batchExportToExcel(scrapes, filename = 'batch-export') {
  try {
    const response = await fetch(`${API_BASE_URL}/export/batch-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scrapes }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to export Excel');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to export Excel: ' + error.message);
  }
}

