const PDFDocument = require('pdfkit');

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
        error: 'Failed to export PDF'
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
        error: 'Failed to export crawl PDF'
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
  exportToPDF,
  exportCrawlToPDF,
};
