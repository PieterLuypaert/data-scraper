const {
  createDocument,
  drawCoverPage,
  drawSectionTitle,
  drawPageDivider,
  drawStatGrid,
  drawKeyValueTable,
  drawDataTable,
  drawRecordTable,
  drawHeadingEntry,
  drawScreenshot,
  drawPageFooters,
  countHeadings,
  flattenHeadingsForPdf,
} = require('./pdfBuilder');
const { THEME } = require('./pdfTheme');

/**
 * Shared error cleanup for PDF export handlers.
 */
function cleanupDocument(doc) {
  if (!doc) return;
  try {
    if (!doc.writableEnded && !doc.destroyed) {
      if (doc.page) {
        doc.end();
      } else {
        doc.destroy();
      }
    }
  } catch (docError) {
    console.error('Error ending PDF document:', docError);
    try {
      if (!doc.destroyed) doc.destroy();
    } catch (destroyError) {
      console.error('Error destroying PDF document:', destroyError);
    }
  }
}

function handleExportError(res, error, message) {
  console.error(message, error);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: message });
  } else {
    console.error('Cannot send error response - headers already sent');
    try {
      if (!res.finished) res.end();
    } catch (endError) {
      console.error('Error ending response:', endError);
    }
  }
}

function setupDocumentResponse(doc, res, filename) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.on('error', (error) => {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF: ' + error.message,
      });
    }
  });

  doc.pipe(res);
}

/**
 * Render links, images and headings sections for a single page of scraped data.
 */
function renderPageSections(doc, pageData) {
  if (pageData.links?.length > 0) {
    doc.addPage();
    doc.y = THEME.margin;
    drawSectionTitle(doc, 'Links');
    drawRecordTable(doc, 'links', pageData.links);
  }

  if (pageData.images?.length > 0) {
    doc.addPage();
    doc.y = THEME.margin;
    drawSectionTitle(doc, 'Images');
    drawRecordTable(doc, 'images', pageData.images);
  }

  const flatHeadings = flattenHeadingsForPdf(pageData.headings);
  if (flatHeadings.length > 0) {
    doc.addPage();
    doc.y = THEME.margin;
    drawSectionTitle(doc, 'Headings');
    flatHeadings.forEach(heading => {
      try {
        drawHeadingEntry(doc, heading);
      } catch (headingError) {
        console.error('Error adding heading to PDF:', headingError);
      }
    });
  }
}

/**
 * Render overview + stats for a single scraped page (used on cover page and crawl pages).
 */
function renderPageOverview(doc, pageData) {
  drawSectionTitle(doc, 'Overview');
  drawKeyValueTable(doc, [
    ['URL', pageData.url || 'N/A'],
    ['Title', pageData.title || 'N/A'],
    ['Description', pageData.description || 'N/A'],
    ['Language', pageData.language || pageData.lang || 'N/A'],
    ['Timestamp', pageData.timestamp || new Date().toISOString()],
  ]);

  drawSectionTitle(doc, 'Statistics');
  drawStatGrid(doc, [
    { label: 'Links', value: pageData.links?.length || 0 },
    { label: 'Images', value: pageData.images?.length || 0 },
    { label: 'Headings', value: countHeadings(pageData.headings) },
    { label: 'Paragraphs', value: pageData.paragraphs?.length || 0 },
  ]);
}

/**
 * Export scraped data to PDF
 */
async function exportToPDF(req, res) {
  let doc;
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, error: 'Data is required' });
    }

    doc = createDocument();
    const filename = `scrape-${data.url?.replace(/[^a-z0-9]/gi, '-') || 'data'}-${Date.now()}.pdf`;
    setupDocumentResponse(doc, res, filename);

    drawCoverPage(doc, {
      title: 'Web Scrape Report',
      subtitle: data.url || 'Scraped page',
      metaRows: [
        ['URL', data.url || 'N/A'],
        ['Title', data.title || 'N/A'],
        ['Taal', data.language || data.lang || 'N/A'],
        ['Gegenereerd', data.timestamp || new Date().toISOString()],
      ],
    });

    doc.addPage();
    doc.y = THEME.margin;
    renderPageOverview(doc, data);

    if (data._hadScreenshot || data.screenshot) {
      drawScreenshot(doc, data.screenshot, data._hadScreenshot);
    }

    renderPageSections(doc, data);

    try {
      drawPageFooters(doc);
    } catch (footerError) {
      console.error('Error adding footer to PDF:', footerError);
    }

    doc.end();
  } catch (error) {
    cleanupDocument(doc);
    handleExportError(res, error, 'Failed to export PDF');
  }
}

/**
 * Export crawl data (multiple pages) to PDF
 */
async function exportCrawlToPDF(req, res) {
  let doc;
  try {
    const { data } = req.body;

    if (!data || !data.pages || !Array.isArray(data.pages)) {
      return res.status(400).json({
        success: false,
        error: 'Crawl data with pages array is required',
      });
    }

    doc = createDocument();
    const filename = `crawl-${data.startUrl?.replace(/[^a-z0-9]/gi, '-') || 'data'}-${Date.now()}.pdf`;
    setupDocumentResponse(doc, res, filename);

    drawCoverPage(doc, {
      title: 'Website Crawl Report',
      subtitle: data.startUrl || 'Multi-page crawl',
      metaRows: [
        ['Start URL', data.startUrl || 'N/A'],
        ['Totaal pagina\'s', data.totalPages || data.pages.length],
        ['Totaal links', data.summary?.totalLinks || 0],
        ['Totaal afbeeldingen', data.summary?.totalImages || 0],
        ['Totaal headings', data.summary?.totalHeadings || 0],
        ['Gegenereerd', new Date().toISOString()],
      ],
    });

    doc.addPage();
    doc.y = THEME.margin;
    drawSectionTitle(doc, 'Pages Overview');
    drawDataTable(
      doc,
      ['#', 'Titel', 'URL', 'Links', 'Images', 'Headings'],
      data.pages.map((page, index) => [
        String(index + 1),
        (page.title || 'Untitled').substring(0, 40),
        (page.url || 'N/A').substring(0, 60),
        String(page.links?.length || 0),
        String(page.images?.length || 0),
        String(countHeadings(page.headings)),
      ]),
      [28, 90, 200, 45, 55, 60]
    );

    data.pages.forEach((page, pageIndex) => {
      doc.addPage();
      doc.y = THEME.margin;
      drawPageDivider(doc, `Pagina ${pageIndex + 1}: ${page.title || page.url || 'Untitled'}`);
      renderPageOverview(doc, page);
      renderPageSections(doc, page);
    });

    try {
      drawPageFooters(doc);
    } catch (footerError) {
      console.error('Error adding footer to PDF:', footerError);
    }

    doc.end();
  } catch (error) {
    cleanupDocument(doc);
    handleExportError(res, error, 'Failed to export crawl PDF');
  }
}

module.exports = {
  exportToPDF,
  exportCrawlToPDF,
};
