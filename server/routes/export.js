const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const config = require('../config');

/**
 * Build the list of sheets (name + header + rows) for a single scraped page.
 * Mirrors the previous xlsx output exactly: same sheet names, column order
 * and "skip empty section" behaviour.
 * @param {object} scrapedData
 * @returns {Array<{name: string, header: string[], rows: Array<Array>}>}
 */
function buildSheetDescriptors(scrapedData) {
  const sheets = [];

  // Overview sheet (key/value)
  sheets.push({
    name: 'Overview',
    header: ['Property', 'Value'],
    rows: [
      ['URL', scrapedData.url || ''],
      ['Title', scrapedData.title || ''],
      ['Description', scrapedData.description || ''],
      ['Language', scrapedData.language || ''],
      ['Timestamp', scrapedData.timestamp || new Date().toISOString()],
      ['Total Links', scrapedData.links?.length || 0],
      ['Total Images', scrapedData.images?.length || 0],
      ['Total Headings', scrapedData.headings?.length || 0],
    ],
  });

  // Links sheet
  if (scrapedData.links && scrapedData.links.length > 0) {
    sheets.push({
      name: 'Links',
      header: ['Text', 'URL', 'Title', 'Target', 'Rel'],
      rows: scrapedData.links.map(link => [
        link.text || '', link.href || '', link.title || '', link.target || '', link.rel || '',
      ]),
    });
  }

  // Images sheet
  if (scrapedData.images && scrapedData.images.length > 0) {
    sheets.push({
      name: 'Images',
      header: ['Alt Text', 'Source', 'Width', 'Height'],
      rows: scrapedData.images.map(img => [
        img.alt || '', img.src || '', img.width || '', img.height || '',
      ]),
    });
  }

  // Headings sheet
  if (scrapedData.headings && scrapedData.headings.length > 0) {
    sheets.push({
      name: 'Headings',
      header: ['Level', 'Text', 'ID', 'Class'],
      rows: scrapedData.headings.map(heading => [
        heading.tag || '', heading.text || '', heading.id || '', heading.class || '',
      ]),
    });
  }

  // Meta tags sheet
  if (scrapedData.metaTags) {
    const metaRows = Object.entries(scrapedData.metaTags).map(([key, value]) => [
      key, Array.isArray(value) ? value.join(', ') : String(value),
    ]);
    if (metaRows.length > 0) {
      sheets.push({ name: 'Meta Tags', header: ['Name', 'Content'], rows: metaRows });
    }
  }

  return sheets;
}

/**
 * Produce a valid, unique Excel sheet name. Excel limits names to 31 chars and
 * forbids the characters * ? : \ / [ ]. Duplicates get a numeric suffix so
 * appending many same-named sheets (e.g. one "Overview" per crawled page) can
 * never collide.
 * @param {string} rawName
 * @param {Set<string>} usedNames
 * @returns {string}
 */
function makeUniqueSheetName(rawName, usedNames) {
  let base = String(rawName).replace(/[*?:\\/\[\]]/g, '_').trim() || 'Sheet';
  base = base.substring(0, 31);
  let name = base;
  let i = 2;
  while (usedNames.has(name)) {
    const suffix = `_${i}`;
    name = base.substring(0, 31 - suffix.length) + suffix;
    i++;
  }
  usedNames.add(name);
  return name;
}

/**
 * Add a worksheet with a bold header row followed by data rows.
 * @param {ExcelJS.Workbook} workbook
 * @param {string} rawName
 * @param {string[]} header
 * @param {Array<Array>} rows
 * @param {Set<string>} usedNames
 */
function addSheet(workbook, rawName, header, rows, usedNames) {
  const sheet = workbook.addWorksheet(makeUniqueSheetName(rawName, usedNames));
  if (header && header.length > 0) {
    const headerRow = sheet.addRow(header);
    headerRow.font = { bold: true };
  }
  rows.forEach(row => sheet.addRow(row));
  return sheet;
}

/**
 * Serialize an ExcelJS workbook to a Node Buffer.
 * @param {ExcelJS.Workbook} workbook
 * @returns {Promise<Buffer>}
 */
async function workbookToBuffer(workbook) {
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

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
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Export scraped data to PDF
 */
async function exportToPDF(req, res) {
  let doc;
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required'
      });
    }
    
    doc = new PDFDocument({ margin: 50 });
    const filename = `scrape-${data.url?.replace(/[^a-z0-9]/gi, '-') || 'data'}-${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Handle errors before piping
    doc.on('error', (error) => {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to generate PDF: ' + error.message
        });
      }
    });
    
    doc.pipe(res);
    
    // Title
    doc.fontSize(20).text('Web Scrape Report', { align: 'center' });
    doc.moveDown();
    
    // Overview section
    doc.fontSize(16).text('Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`URL: ${data.url || 'N/A'}`);
    doc.text(`Title: ${data.title || 'N/A'}`);
    doc.text(`Description: ${data.description || 'N/A'}`);
    doc.text(`Language: ${data.language || 'N/A'}`);
    doc.text(`Timestamp: ${data.timestamp || new Date().toISOString()}`);
    doc.moveDown();
    
    // Statistics
    doc.fontSize(16).text('Statistics', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total Links: ${data.links?.length || 0}`);
    doc.text(`Total Images: ${data.images?.length || 0}`);
    doc.text(`Total Headings: ${data.headings?.length || 0}`);
    doc.text(`Total Paragraphs: ${data.paragraphs?.length || 0}`);
    doc.moveDown();
    
    // Screenshot if available
    // Note: Screenshots are removed from payload to avoid 413 errors
    // If screenshot was present, show a note
    if (data._hadScreenshot || data.screenshot) {
      doc.fontSize(16).text('Screenshot', { underline: true });
      doc.moveDown(0.5);
      
      if (data.screenshot) {
        try {
          // Convert base64 to buffer
          let base64Data = data.screenshot;
          if (base64Data.startsWith('data:image')) {
            base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
          }
          const imageBuffer = Buffer.from(base64Data, 'base64');
          
          // Check if buffer is valid
          if (imageBuffer.length > 0 && imageBuffer.length < 10 * 1024 * 1024) { // Max 10MB
            doc.image(imageBuffer, {
              fit: [500, 400],
              align: 'center'
            });
            doc.moveDown();
          } else {
            throw new Error('Screenshot too large or invalid');
          }
        } catch (imageError) {
          doc.fontSize(10).fillColor('gray').text('Screenshot kon niet worden toegevoegd (te groot of niet beschikbaar)', { align: 'center' });
          doc.fillColor('black');
          doc.moveDown();
        }
      } else if (data._hadScreenshot) {
        doc.fontSize(10).fillColor('gray').text('Screenshot was beschikbaar maar is verwijderd om payload grootte te beperken', { align: 'center' });
        doc.fillColor('black');
        doc.moveDown();
      }
    }
    
    // Links section
    if (data.links && data.links.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Links', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      
      // Export ALL links - no limit
      data.links.forEach((link, index) => {
        try {
          if (doc.y > 700) {
            doc.addPage();
          }
          const linkText = String(link.text || 'No text').substring(0, 200); // Limit text length
          doc.text(`${index + 1}. ${linkText}`, { continued: false });
          const linkUrl = String(link.href || '').substring(0, 500); // Limit URL length
          doc.fontSize(8).fillColor('blue').text(linkUrl, { link: linkUrl });
          doc.fontSize(10).fillColor('black');
          doc.moveDown(0.3);
        } catch (linkError) {
          console.error('Error adding link to PDF:', linkError);
          // Skip this link and continue
        }
      });
    }
    
    // Images section
    if (data.images && data.images.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Images', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      
      // Export ALL images - no limit
      data.images.forEach((img, index) => {
        try {
          if (doc.y > 700) {
            doc.addPage();
          }
          const altText = String(img.alt || 'No alt text').substring(0, 200);
          doc.text(`${index + 1}. ${altText}`);
          const imgSrc = String(img.src || '').substring(0, 500);
          doc.fontSize(8).fillColor('blue').text(imgSrc);
          doc.fontSize(10).fillColor('black');
          doc.moveDown(0.5);
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
          // Skip this image and continue
        }
      });
    }
    
    // Headings section
    if (data.headings && data.headings.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Headings', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      
      data.headings.forEach((heading, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        try {
          const level = heading.tag?.replace('h', '') || '';
          const headingText = String(heading.text || '').substring(0, 500); // Limit text length
          const fontSize = Math.max(8, 12 - (parseInt(level) * 0.5));
          doc.fontSize(fontSize).text(`${heading.tag?.toUpperCase() || ''}: ${headingText}`);
          doc.fontSize(10);
          doc.moveDown(0.3);
        } catch (headingError) {
          console.error('Error adding heading to PDF:', headingError);
          // Skip this heading and continue
        }
      });
    }
    
    // Footer on each page
    // bufferedPageRange() returns { start: pageNumber, count: numberOfPages }
    const pageRange = doc.bufferedPageRange();
    const startPage = pageRange.start || 0;
    const totalPages = pageRange.count || 1;
    
    try {
      for (let i = startPage; i < startPage + totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .fillColor('gray')
          .text(
            `Page ${i - startPage + 1} of ${totalPages} | Generated by Web Scraper`,
            { align: 'center', y: doc.page.height - 30 }
          );
      }
    } catch (footerError) {
      console.error('Error adding footer to PDF:', footerError);
      // Continue without footer if there's an error
    }
    
    doc.end();
    
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    
    // If PDF document was created, try to end it gracefully
    if (doc) {
      try {
        // Check if document is still writable
        if (!doc.writableEnded && !doc.destroyed) {
          // Try to finalize the document
          if (doc.page) {
            doc.end();
          } else {
            // Document has no pages, destroy it
            doc.destroy();
          }
        }
      } catch (docError) {
        console.error('Error ending PDF document:', docError);
        // Try to destroy the document if ending failed
        try {
          if (!doc.destroyed) {
            doc.destroy();
          }
        } catch (destroyError) {
          console.error('Error destroying PDF document:', destroyError);
        }
      }
    }
    
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to export PDF'
      });
    } else {
      // If headers are already sent, we can't send JSON, so log the error
      console.error('Cannot send error response - headers already sent');
      // Try to end the response gracefully
      try {
        if (!res.finished) {
          res.end();
        }
      } catch (endError) {
        console.error('Error ending response:', endError);
      }
    }
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
        scrape.data?.headings?.length || 0,
      ]),
      usedNames
    );

    // Individual scrape sheets
    scrapes.forEach((scrape, index) => {
      if (scrape.data) {
        addSheet(
          workbook,
          `Scrape ${index + 1}`,
          ['Property', 'Value'],
          [
            ['URL', scrape.url || ''],
            ['Title', scrape.data.title || ''],
            ['Timestamp', scrape.timestamp || ''],
          ],
          usedNames
        );
      }
    });

    const buffer = await workbookToBuffer(workbook);
    const filename = `batch-export-${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
    
  } catch (error) {
    console.error('Error batch exporting to Excel:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
    console.error('Error exporting crawl to Excel:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
        error: 'Crawl data with pages array is required'
      });
    }
    
    doc = new PDFDocument({ margin: 50 });
    const filename = `crawl-${data.startUrl?.replace(/[^a-z0-9]/gi, '-') || 'data'}-${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.on('error', (error) => {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to generate PDF: ' + error.message
        });
      }
    });
    
    doc.pipe(res);
    
    // Title page
    doc.fontSize(20).text('Website Crawl Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Start URL: ${data.startUrl || 'N/A'}`);
    doc.text(`Total Pages: ${data.totalPages || data.pages.length}`);
    doc.text(`Total Links: ${data.summary?.totalLinks || 0}`);
    doc.text(`Total Images: ${data.summary?.totalImages || 0}`);
    doc.text(`Total Headings: ${data.summary?.totalHeadings || 0}`);
    doc.moveDown();
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.addPage();
    
    // Pages Overview
    doc.fontSize(16).text('Pages Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    data.pages.forEach((page, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      doc.fontSize(12).text(`Page ${index + 1}: ${page.title || page.url || 'Untitled'}`, { underline: true });
      doc.fontSize(10);
      doc.text(`URL: ${page.url || 'N/A'}`);
      doc.text(`Links: ${page.links?.length || 0} | Images: ${page.images?.length || 0} | Headings: ${Array.isArray(page.headings) ? page.headings.length : (page.headings ? Object.values(page.headings).reduce((sum, arr) => sum + arr.length, 0) : 0)}`);
      doc.moveDown();
    });
    
    // Individual pages
    data.pages.forEach((page, pageIndex) => {
      doc.addPage();
      doc.fontSize(18).text(`Page ${pageIndex + 1}`, { underline: true });
      doc.moveDown();
      
      // Page overview
      doc.fontSize(14).text('Overview', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`URL: ${page.url || 'N/A'}`);
      doc.text(`Title: ${page.title || 'N/A'}`);
      doc.text(`Description: ${page.description || 'N/A'}`);
      doc.moveDown();
      
      // Statistics
      doc.fontSize(14).text('Statistics', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Total Links: ${page.links?.length || 0}`);
      doc.text(`Total Images: ${page.images?.length || 0}`);
      doc.text(`Total Headings: ${Array.isArray(page.headings) ? page.headings.length : (page.headings ? Object.values(page.headings).reduce((sum, arr) => sum + arr.length, 0) : 0)}`);
      doc.text(`Total Paragraphs: ${page.paragraphs?.length || 0}`);
      doc.moveDown();
      
      // Links - export ALL links for each page
      if (page.links && page.links.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Links', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        page.links.forEach((link, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }
          try {
            const linkText = String(link.text || 'No text').substring(0, 200);
            doc.text(`${index + 1}. ${linkText}`, { continued: false });
            const linkUrl = String(link.href || '').substring(0, 500);
            doc.fontSize(8).fillColor('blue').text(linkUrl, { link: linkUrl });
            doc.fontSize(10).fillColor('black');
            doc.moveDown(0.3);
          } catch (linkError) {
            console.error('Error adding link to PDF:', linkError);
          }
        });
      }
      
      // Images - export ALL images for each page
      if (page.images && page.images.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Images', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        page.images.forEach((img, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }
          try {
            const altText = String(img.alt || 'No alt text').substring(0, 200);
            doc.text(`${index + 1}. ${altText}`);
            const imgSrc = String(img.src || '').substring(0, 500);
            doc.fontSize(8).fillColor('blue').text(imgSrc);
            doc.fontSize(10).fillColor('black');
            doc.moveDown(0.5);
          } catch (imgError) {
            console.error('Error adding image to PDF:', imgError);
          }
        });
      }
    });
    
    // Footer on each page
    const pageRange = doc.bufferedPageRange();
    const startPage = pageRange.start || 0;
    const totalPages = pageRange.count || 1;
    
    try {
      for (let i = startPage; i < startPage + totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .fillColor('gray')
          .text(
            `Page ${i - startPage + 1} of ${totalPages} | Generated by Web Scraper`,
            { align: 'center', y: doc.page.height - 30 }
          );
      }
    } catch (footerError) {
      console.error('Error adding footer to PDF:', footerError);
    }
    
    doc.end();
    
  } catch (error) {
    console.error('Error exporting crawl to PDF:', error);
    
    if (doc) {
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
          if (!doc.destroyed) {
            doc.destroy();
          }
        } catch (destroyError) {
          console.error('Error destroying PDF document:', destroyError);
        }
      }
    }
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to export crawl PDF'
      });
    } else {
      console.error('Cannot send error response - headers already sent');
      try {
        if (!res.finished) {
          res.end();
        }
      } catch (endError) {
        console.error('Error ending response:', endError);
      }
    }
  }
}

module.exports = {
  exportToExcel,
  exportToPDF,
  batchExportToExcel,
  exportCrawlToExcel,
  exportCrawlToPDF
};

