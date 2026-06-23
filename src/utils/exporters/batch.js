import { exportToJSON } from './json';
import { exportToCSV } from './csv';
import { batchExportToExcel } from './excel';

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
