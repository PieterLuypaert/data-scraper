const ExcelJS = require('exceljs');
const { sendError } = require('../../utils/errorResponse');
const {
  flattenHeadings,
  buildSheetDescriptors,
  addSheet,
  workbookToBuffer,
} = require('./sheetBuilder');

/**
 * Export scraped data to Excel
 */
async function exportToExcel(req, res) {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required'
      });
    }

    const workbook = new ExcelJS.Workbook();
    const usedNames = new Set();
    buildSheetDescriptors(data).forEach(s => addSheet(workbook, s.name, s.header, s.rows, usedNames));
    const buffer = await workbookToBuffer(workbook);

    const filename = `scrape-${data.url?.replace(/[^a-z0-9]/gi, '-') || 'data'}-${Date.now()}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    sendError(res, 500, error, 'Failed to export to Excel');
  }
}

/**
 * Batch export to Excel
 */
async function batchExportToExcel(req, res) {
  try {
    const { scrapes } = req.body;

    if (!scrapes || !Array.isArray(scrapes)) {
      return res.status(400).json({
        success: false,
        error: 'Scrapes array is required'
      });
    }

    const workbook = new ExcelJS.Workbook();
    const usedNames = new Set();

    // Summary sheet
    addSheet(
      workbook,
      'Summary',
      ['ID', 'URL', 'Title', 'Timestamp', 'Links Count', 'Images Count', 'Headings Count'],
      scrapes.map(scrape => [
        scrape.id || '',
        scrape.url || '',
        scrape.data?.title || '',
        scrape.timestamp || '',
        scrape.data?.links?.length || 0,
        scrape.data?.images?.length || 0,
        flattenHeadings(scrape.data?.headings).length,
      ]),
      usedNames
    );

    // Individual scrape sheets — full data per scrape, prefixed S{n}_
    scrapes.forEach((scrape, index) => {
      if (scrape.data) {
        const scrapeNumber = index + 1;
        buildSheetDescriptors(scrape.data).forEach(s =>
          addSheet(workbook, `S${scrapeNumber}_${s.name}`, s.header, s.rows, usedNames)
        );
      }
    });

    const buffer = await workbookToBuffer(workbook);
    const filename = `batch-export-${Date.now()}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    sendError(res, 500, error, 'Failed to batch export to Excel');
  }
}

/**
 * Export crawl data (multiple pages) to Excel
 */
async function exportCrawlToExcel(req, res) {
  try {
    const { data } = req.body;

    if (!data || !data.pages || !Array.isArray(data.pages)) {
      return res.status(400).json({
        success: false,
        error: 'Crawl data with pages array is required'
      });
    }

    const workbook = new ExcelJS.Workbook();
    const usedNames = new Set();

    // Summary sheet
    addSheet(
      workbook,
      'Summary',
      ['Property', 'Value'],
      [
        ['Start URL', data.startUrl || ''],
        ['Total Pages', data.totalPages || data.pages.length],
        ['Total Links', data.summary?.totalLinks || 0],
        ['Total Images', data.summary?.totalImages || 0],
        ['Total Headings', data.summary?.totalHeadings || 0],
      ],
      usedNames
    );

    // All Pages Overview sheet
    addSheet(
      workbook,
      'All Pages',
      ['Page #', 'URL', 'Title', 'Links', 'Images', 'Headings', 'Crawl Depth', 'Crawl Order'],
      data.pages.map((page, index) => [
        index + 1,
        page.url || '',
        page.title || '',
        page.links?.length || 0,
        page.images?.length || 0,
        Array.isArray(page.headings) ? page.headings.length : (page.headings ? Object.values(page.headings).reduce((sum, arr) => sum + arr.length, 0) : 0),
        page.crawlDepth || '',
        page.crawlOrder || index + 1,
      ]),
      usedNames
    );

    // Individual page sheets (prefixed; names auto-deduplicated)
    data.pages.forEach((page, index) => {
      const pageNumber = index + 1;
      buildSheetDescriptors(page).forEach(s =>
        addSheet(workbook, `P${pageNumber}_${s.name}`, s.header, s.rows, usedNames)
      );
    });

    // Combined Links sheet (all pages)
    const allLinks = [];
    data.pages.forEach((page, pageIndex) => {
      if (page.links && page.links.length > 0) {
        page.links.forEach(link => {
          allLinks.push([
            pageIndex + 1,
            page.url || '',
            link.text || '',
            link.href || '',
            link.title || '',
            link.target || '',
            link.rel || '',
          ]);
        });
      }
    });
    if (allLinks.length > 0) {
      addSheet(workbook, 'All Links', ['Page #', 'Page URL', 'Text', 'URL', 'Title', 'Target', 'Rel'], allLinks, usedNames);
    }

    // Combined Images sheet (all pages)
    const allImages = [];
    data.pages.forEach((page, pageIndex) => {
      if (page.images && page.images.length > 0) {
        page.images.forEach(img => {
          allImages.push([
            pageIndex + 1,
            page.url || '',
            img.alt || '',
            img.src || '',
            img.width || '',
            img.height || '',
          ]);
        });
      }
    });
    if (allImages.length > 0) {
      addSheet(workbook, 'All Images', ['Page #', 'Page URL', 'Alt Text', 'Source', 'Width', 'Height'], allImages, usedNames);
    }

    const buffer = await workbookToBuffer(workbook);
    const filename = `crawl-${data.startUrl?.replace(/[^a-z0-9]/gi, '-') || 'data'}-${Date.now()}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    sendError(res, 500, error, 'Failed to export crawl to Excel');
  }
}

module.exports = {
  exportToExcel,
  batchExportToExcel,
  exportCrawlToExcel,
};
