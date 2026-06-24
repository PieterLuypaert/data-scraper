
import { API_BASE_URL } from './constants';
import { prepareDataForExport } from './prepareData';

/**
 * Export crawl data (multiple pages) to Excel
 * @param {Object} crawlData - Crawl data with pages array
 * @param {string} filename - Filename
 */
export async function exportCrawlToExcel(crawlData, filename = 'crawl-data') {
  try {
    // Prepare all pages for export
    const preparedPages = crawlData.pages.map(page => prepareDataForExport(page));

    // Create crawl export data structure
    const exportData = {
      startUrl: crawlData.startUrl,
      totalPages: crawlData.totalPages,
      pages: preparedPages,
      summary: crawlData.summary,
      visitedUrls: crawlData.visitedUrls
    };

    // Check payload size
    let payload = JSON.stringify({ data: exportData });
    let payloadSizeMB = payload.length / (1024 * 1024);

    // Progressive compression if needed
    if (payloadSizeMB > 10) {
      console.warn(`Crawl payload size is ${payloadSizeMB.toFixed(2)}MB, compressing...`);
      const compressionLevels = [
        { threshold: 10, maxArraySize: 100 },
        { threshold: 20, maxArraySize: 50 },
        { threshold: 50, maxArraySize: 25 },
      ];

      for (const level of compressionLevels) {
        if (payloadSizeMB > level.threshold) {
          console.warn(`Compressing to max ${level.maxArraySize} items per array...`);
          const moreCompressed = {
            ...exportData,
            pages: exportData.pages.map(page => {
              const compressed = { ...page };
              Object.keys(compressed).forEach(key => {
                if (Array.isArray(compressed[key]) && compressed[key].length > level.maxArraySize) {
                  compressed[`${key}_total`] = compressed[key].length;
                  compressed[key] = compressed[key].slice(0, level.maxArraySize);
                  compressed[`${key}_truncated`] = true;
                }
              });
              return compressed;
            })
          };
          exportData.pages = moreCompressed.pages;
          payload = JSON.stringify({ data: exportData });
          payloadSizeMB = payload.length / (1024 * 1024);
        }
      }
    }

    if (payloadSizeMB > 1) {
      console.log(`Exporting crawl with payload size: ${payloadSizeMB.toFixed(2)}MB`);
    }

    // Warn user if payload is very large
    if (payloadSizeMB > 50) {
      console.warn(`⚠️ Very large crawl export: ${payloadSizeMB.toFixed(2)}MB. This may take a while...`);
    }

    const response = await fetch(`${API_BASE_URL}/export/crawl-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error(`Server weigert export: payload te groot (${payloadSizeMB.toFixed(2)}MB). De server heeft een limiet ingesteld. Probeer een kleinere dataset of verwijder grote arrays.`);
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(errorData.error || 'Failed to export crawl Excel');
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
    throw new Error('Failed to export crawl Excel: ' + error.message);
  }
}

/**
 * Export crawl data (multiple pages) to PDF
 * @param {Object} crawlData - Crawl data with pages array
 * @param {string} filename - Filename
 */
export async function exportCrawlToPDF(crawlData, filename = 'crawl-data') {
  try {
    // Prepare all pages for export
    const preparedPages = crawlData.pages.map(page => prepareDataForExport(page));

    // Create crawl export data structure
    const exportData = {
      startUrl: crawlData.startUrl,
      totalPages: crawlData.totalPages,
      pages: preparedPages,
      summary: crawlData.summary,
      visitedUrls: crawlData.visitedUrls
    };

    // Check payload size
    let payload = JSON.stringify({ data: exportData });
    let payloadSizeMB = payload.length / (1024 * 1024);

    // Progressive compression if needed
    if (payloadSizeMB > 10) {
      console.warn(`Crawl PDF payload size is ${payloadSizeMB.toFixed(2)}MB, compressing...`);
      const compressionLevels = [
        { threshold: 10, maxArraySize: 100 },
        { threshold: 20, maxArraySize: 50 },
        { threshold: 50, maxArraySize: 25 },
      ];

      for (const level of compressionLevels) {
        if (payloadSizeMB > level.threshold) {
          console.warn(`Compressing to max ${level.maxArraySize} items per array...`);
          const moreCompressed = {
            ...exportData,
            pages: exportData.pages.map(page => {
              const compressed = { ...page };
              Object.keys(compressed).forEach(key => {
                if (Array.isArray(compressed[key]) && compressed[key].length > level.maxArraySize) {
                  compressed[`${key}_total`] = compressed[key].length;
                  compressed[key] = compressed[key].slice(0, level.maxArraySize);
                  compressed[`${key}_truncated`] = true;
                }
              });
              return compressed;
            })
          };
          exportData.pages = moreCompressed.pages;
          payload = JSON.stringify({ data: exportData });
          payloadSizeMB = payload.length / (1024 * 1024);
        }
      }
    }

    if (payloadSizeMB > 1) {
      console.log(`Exporting crawl PDF with payload size: ${payloadSizeMB.toFixed(2)}MB`);
    }

    // Warn user if payload is very large
    if (payloadSizeMB > 50) {
      console.warn(`⚠️ Very large crawl PDF export: ${payloadSizeMB.toFixed(2)}MB. This may take a while...`);
    }

    const response = await fetch(`${API_BASE_URL}/export/crawl-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error(`Server weigert export: payload te groot (${payloadSizeMB.toFixed(2)}MB). De server heeft een limiet ingesteld. Probeer een kleinere dataset of verwijder grote arrays.`);
      }

      let errorMessage = 'Failed to export crawl PDF';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonError) {
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

    if (!contentType || !contentType.includes('application/pdf')) {
      const errorText = await response.text();
      throw new Error('Server returned non-PDF content. ' + errorText.substring(0, 100));
    }

    const blob = await response.blob();

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
    throw new Error('Failed to export crawl PDF: ' + error.message);
  }
}
