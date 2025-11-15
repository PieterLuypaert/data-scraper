const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const config = require('../config');

/**
 * Convert scraped data to Excel format
 */
function convertToExcelData(scrapedData) {
  const workbook = XLSX.utils.book_new();
  
  // Overview sheet
  const overviewData = [
    ['Property', 'Value'],
    ['URL', scrapedData.url || ''],
    ['Title', scrapedData.title || ''],
    ['Description', scrapedData.description || ''],
    ['Language', scrapedData.language || ''],
    ['Timestamp', scrapedData.timestamp || new Date().toISOString()],
    ['Total Links', scrapedData.links?.length || 0],
    ['Total Images', scrapedData.images?.length || 0],
    ['Total Headings', scrapedData.headings?.length || 0],
  ];
  
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
  
  // Links sheet
  if (scrapedData.links && scrapedData.links.length > 0) {
    const linksData = scrapedData.links.map(link => ({
      'Text': link.text || '',
      'URL': link.href || '',
      'Title': link.title || '',
      'Target': link.target || '',
      'Rel': link.rel || '',
    }));
    const linksSheet = XLSX.utils.json_to_sheet(linksData);
    XLSX.utils.book_append_sheet(workbook, linksSheet, 'Links');
  }
  
  // Images sheet
  if (scrapedData.images && scrapedData.images.length > 0) {
    const imagesData = scrapedData.images.map(img => ({
      'Alt Text': img.alt || '',
      'Source': img.src || '',
      'Width': img.width || '',
      'Height': img.height || '',
    }));
    const imagesSheet = XLSX.utils.json_to_sheet(imagesData);
    XLSX.utils.book_append_sheet(workbook, imagesSheet, 'Images');
  }
  
  // Headings sheet
  if (scrapedData.headings && scrapedData.headings.length > 0) {
    const headingsData = scrapedData.headings.map(heading => ({
      'Level': heading.tag || '',
      'Text': heading.text || '',
      'ID': heading.id || '',
      'Class': heading.class || '',
    }));
    const headingsSheet = XLSX.utils.json_to_sheet(headingsData);
    XLSX.utils.book_append_sheet(workbook, headingsSheet, 'Headings');
  }
  
  // Meta tags sheet
  if (scrapedData.metaTags) {
    const metaData = Object.entries(scrapedData.metaTags).map(([key, value]) => ({
      'Name': key,
      'Content': Array.isArray(value) ? value.join(', ') : String(value),
    }));
    if (metaData.length > 0) {
      const metaSheet = XLSX.utils.json_to_sheet(metaData);
      XLSX.utils.book_append_sheet(workbook, metaSheet, 'Meta Tags');
    }
  }
  
  return workbook;
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
    
    const workbook = convertToExcelData(data);
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
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
    
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = scrapes.map(scrape => ({
      'ID': scrape.id || '',
      'URL': scrape.url || '',
      'Title': scrape.data?.title || '',
      'Timestamp': scrape.timestamp || '',
      'Links Count': scrape.data?.links?.length || 0,
      'Images Count': scrape.data?.images?.length || 0,
      'Headings Count': scrape.data?.headings?.length || 0,
    }));
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Individual scrape sheets
    scrapes.forEach((scrape, index) => {
      if (scrape.data) {
        const sheetName = `Scrape ${index + 1}`.substring(0, 31); // Excel sheet name limit
        const scrapeData = [
          ['Property', 'Value'],
          ['URL', scrape.url || ''],
          ['Title', scrape.data.title || ''],
          ['Timestamp', scrape.timestamp || ''],
        ];
        const scrapeSheet = XLSX.utils.aoa_to_sheet(scrapeData);
        XLSX.utils.book_append_sheet(workbook, scrapeSheet, sheetName);
      }
    });
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
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
    
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Property', 'Value'],
      ['Start URL', data.startUrl || ''],
      ['Total Pages', data.totalPages || data.pages.length],
      ['Total Links', data.summary?.totalLinks || 0],
      ['Total Images', data.summary?.totalImages || 0],
      ['Total Headings', data.summary?.totalHeadings || 0],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // All Pages Overview sheet
    const pagesOverview = data.pages.map((page, index) => ({
      'Page #': index + 1,
      'URL': page.url || '',
      'Title': page.title || '',
      'Links': page.links?.length || 0,
      'Images': page.images?.length || 0,
      'Headings': Array.isArray(page.headings) ? page.headings.length : (page.headings ? Object.values(page.headings).reduce((sum, arr) => sum + arr.length, 0) : 0),
      'Crawl Depth': page.crawlDepth || '',
      'Crawl Order': page.crawlOrder || index + 1,
    }));
    const pagesOverviewSheet = XLSX.utils.json_to_sheet(pagesOverview);
    XLSX.utils.book_append_sheet(workbook, pagesOverviewSheet, 'All Pages');
    
    // Individual page sheets
    data.pages.forEach((page, index) => {
      const pageNumber = index + 1;
      const sheetName = `Page ${pageNumber}`.substring(0, 31); // Excel sheet name limit
      const pageWorkbook = convertToExcelData(page);
      
      // Copy all sheets from page workbook to main workbook with prefixed names
      pageWorkbook.SheetNames.forEach(sheetName => {
        const sheet = pageWorkbook.Sheets[sheetName];
        const newSheetName = `P${pageNumber}_${sheetName}`.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, sheet, newSheetName);
      });
    });
    
    // Combined Links sheet (all pages)
    const allLinks = [];
    data.pages.forEach((page, pageIndex) => {
      if (page.links && page.links.length > 0) {
        page.links.forEach(link => {
          allLinks.push({
            'Page #': pageIndex + 1,
            'Page URL': page.url || '',
            'Text': link.text || '',
            'URL': link.href || '',
            'Title': link.title || '',
            'Target': link.target || '',
            'Rel': link.rel || '',
          });
        });
      }
    });
    if (allLinks.length > 0) {
      const allLinksSheet = XLSX.utils.json_to_sheet(allLinks);
      XLSX.utils.book_append_sheet(workbook, allLinksSheet, 'All Links');
    }
    
    // Combined Images sheet (all pages)
    const allImages = [];
    data.pages.forEach((page, pageIndex) => {
      if (page.images && page.images.length > 0) {
        page.images.forEach(img => {
          allImages.push({
            'Page #': pageIndex + 1,
            'Page URL': page.url || '',
            'Alt Text': img.alt || '',
            'Source': img.src || '',
            'Width': img.width || '',
            'Height': img.height || '',
          });
        });
      }
    });
    if (allImages.length > 0) {
      const allImagesSheet = XLSX.utils.json_to_sheet(allImages);
      XLSX.utils.book_append_sheet(workbook, allImagesSheet, 'All Images');
    }
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
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

