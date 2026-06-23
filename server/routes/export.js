/**
 * Export route handlers.
 *
 * The implementation lives in `server/services/export/*`:
 *  - sheetBuilder.js — Excel sheet/workbook helpers (also exported for unit tests)
 *  - excelExport.js  — Excel request handlers
 *  - pdfExport.js    — PDF request handlers
 *
 * This module re-exports the same surface so existing requires
 * (`require('./server/routes/export')`) keep working unchanged.
 */
const {
  flattenHeadings,
  buildSheetDescriptors,
  makeUniqueSheetName,
} = require('../services/export/sheetBuilder');
const {
  exportToExcel,
  batchExportToExcel,
  exportCrawlToExcel,
} = require('../services/export/excelExport');
const {
  exportToPDF,
  exportCrawlToPDF,
} = require('../services/export/pdfExport');

module.exports = {
  exportToExcel,
  exportToPDF,
  batchExportToExcel,
  exportCrawlToExcel,
  exportCrawlToPDF,
  // Exported for unit testing
  buildSheetDescriptors,
  flattenHeadings,
  makeUniqueSheetName,
};
