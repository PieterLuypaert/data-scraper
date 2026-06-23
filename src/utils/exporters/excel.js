import { API_BASE_URL } from './constants';
import { prepareDataForExport } from './prepareData';
import { exportCrawlToExcel } from './crawl';

/**
 * Export data to Excel file
 * @param {Object} data - Data to export (can be single page or crawl data with pages array)
 * @param {string} filename - Filename (without extension)
 */
export async function exportToExcel(data, filename = 'scraped-data') {
  try {
    // Check if this is crawl data with multiple pages
    if (data.pages && Array.isArray(data.pages) && data.pages.length > 1) {
      // Export all pages from crawl
      return await exportCrawlToExcel(data, filename);
    }

    // Single page export
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
 * Batch export to Excel
 * @param {Array} scrapes - Array of scrape history items
 * @param {string} filename - Filename
 */
export async function batchExportToExcel(scrapes, filename = 'batch-export') {
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
