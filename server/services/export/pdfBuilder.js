const PDFDocument = require('pdfkit');
const { THEME, FONTS, FONT_SIZE, SPACING, PAGE_BOTTOM } = require('./pdfTheme');

/**
 * Create a PDFDocument with standard margins and buffered pages for footers.
 */
function createDocument() {
  return new PDFDocument({
    margin: THEME.margin,
    bufferPages: true,
    size: 'A4',
  });
}

function resetColors(doc) {
  doc.fillColor(THEME.text).strokeColor(THEME.border);
}

function applyFont(doc, { font = FONTS.regular, size = FONT_SIZE.body, color = THEME.text }) {
  doc.font(font).fontSize(size).fillColor(color);
}

function measureText(doc, text, width, fontOpts = {}) {
  applyFont(doc, fontOpts);
  return doc.heightOfString(String(text ?? ''), { width: Math.max(width, 1) });
}

function ensureSpace(doc, minHeight) {
  if (doc.y + minHeight > PAGE_BOTTOM) {
    doc.addPage();
    doc.y = THEME.margin;
  }
  return doc.y;
}

/**
 * Draw text at a fixed position; returns the rendered height.
 */
function drawTextAt(doc, text, x, y, width, fontOpts = {}, textOpts = {}) {
  applyFont(doc, fontOpts);
  const content = String(text ?? '');
  doc.text(content, x, y, { width, ...textOpts });
  return measureText(doc, content, width, fontOpts);
}

/**
 * Draw a bordered box around a region.
 */
function drawBox(doc, x, y, w, h, { fill, stroke = true, radius = 6 } = {}) {
  doc.save();
  if (fill) {
    doc.roundedRect(x, y, w, h, radius).fill(fill);
  }
  if (stroke) {
    doc.roundedRect(x, y, w, h, radius).stroke(THEME.border);
  }
  doc.restore();
}

/**
 * Draw cover page with indigo header band and metadata box.
 */
function drawCoverPage(doc, { title, subtitle, metaRows = [] }) {
  const pageWidth = doc.page.width;
  const headerHeight = 120;

  doc.save();
  doc.rect(0, 0, pageWidth, headerHeight).fill(THEME.primary);
  doc.restore();

  drawTextAt(doc, title, THEME.margin, 36, THEME.contentWidth, {
    font: FONTS.bold,
    size: FONT_SIZE.coverTitle,
    color: THEME.white,
  });

  if (subtitle) {
    drawTextAt(doc, subtitle, THEME.margin, 72, THEME.contentWidth, {
      font: FONTS.regular,
      size: FONT_SIZE.coverSubtitle,
      color: THEME.white,
    });
  }

  resetColors(doc);
  doc.y = headerHeight + SPACING.xl;

  if (metaRows.length > 0) {
    drawKeyValueTable(doc, metaRows, { boxed: true, accentBackground: true });
  }

  return doc.y;
}

/**
 * Section title with indigo left accent bar.
 */
function drawSectionTitle(doc, title) {
  ensureSpace(doc, SPACING.xl + FONT_SIZE.section + 8);
  const x = THEME.margin;
  const y = doc.y;
  const barWidth = 4;
  const textWidth = THEME.contentWidth - barWidth - SPACING.sm;
  const textH = measureText(doc, title, textWidth, {
    font: FONTS.bold,
    size: FONT_SIZE.section,
  });
  const barHeight = Math.max(FONT_SIZE.section + 4, textH + 4);

  doc.save();
  doc.rect(x, y, barWidth, barHeight).fill(THEME.primary);
  doc.restore();

  drawTextAt(doc, title, x + barWidth + SPACING.sm, y + 1, textWidth, {
    font: FONTS.bold,
    size: FONT_SIZE.section,
  });

  resetColors(doc);
  doc.y = y + barHeight + SPACING.md;
  return doc.y;
}

/**
 * Colored page divider band (used for crawl per-page sections).
 */
function drawPageDivider(doc, label) {
  ensureSpace(doc, 52);
  const x = THEME.margin;
  const y = doc.y;
  const bandHeight = 40;
  const textWidth = THEME.contentWidth - SPACING.md * 2;
  const textH = measureText(doc, label, textWidth, {
    font: FONTS.bold,
    size: FONT_SIZE.section,
  });
  const height = Math.max(bandHeight, textH + SPACING.md);

  doc.save();
  doc.roundedRect(x, y, THEME.contentWidth, height, 6).fill(THEME.primaryDark);
  doc.restore();

  drawTextAt(doc, label, x + SPACING.md, y + SPACING.sm, textWidth, {
    font: FONTS.bold,
    size: FONT_SIZE.section,
    color: THEME.white,
  });

  resetColors(doc);
  doc.y = y + height + SPACING.lg;
  return doc.y;
}

/**
 * 2-column stat card grid.
 */
function drawStatGrid(doc, stats) {
  if (!stats || stats.length === 0) return doc.y;

  const cols = 2;
  const gap = SPACING.sm;
  const cardWidth = (THEME.contentWidth - gap) / cols;
  const cardHeight = SPACING.statCardHeight;
  const rows = Math.ceil(stats.length / cols);
  const totalHeight = rows * (cardHeight + gap);

  ensureSpace(doc, totalHeight + SPACING.md);
  const startY = doc.y;

  stats.forEach((stat, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = THEME.margin + col * (cardWidth + gap);
    const y = startY + row * (cardHeight + gap);

    drawBox(doc, x, y, cardWidth, cardHeight, { fill: THEME.bgAccent });

    drawTextAt(doc, String(stat.value ?? 0), x + SPACING.md, y + SPACING.sm, cardWidth - SPACING.md * 2, {
      font: FONTS.bold,
      size: FONT_SIZE.statValue,
      color: THEME.primary,
    });

    drawTextAt(doc, String(stat.label), x + SPACING.md, y + SPACING.sm + 26, cardWidth - SPACING.md * 2, {
      font: FONTS.regular,
      size: FONT_SIZE.statLabel,
      color: THEME.muted,
    });
  });

  resetColors(doc);
  doc.y = startY + totalHeight + SPACING.sectionGap;
  return doc.y;
}

/**
 * Compute row layout for key-value pairs with dynamic heights.
 */
function computeKeyValueRows(doc, rows, labelWidth, valueWidth) {
  const labelOpts = { font: FONTS.bold, size: FONT_SIZE.body, color: THEME.muted };
  const valueOpts = { font: FONTS.regular, size: FONT_SIZE.body, color: THEME.text };

  return rows.map(([label, value]) => {
    const labelH = measureText(doc, label, labelWidth, labelOpts);
    const valueH = measureText(doc, value ?? 'N/A', valueWidth, valueOpts);
    const rowH = Math.max(labelH, valueH) + SPACING.md;
    return { label, value, rowH, labelOpts, valueOpts };
  });
}

/**
 * Key-value table with zebra striping and dynamic row heights.
 */
function drawKeyValueTable(doc, rows, options = {}) {
  if (!rows || rows.length === 0) return doc.y;

  const { boxed = true, accentBackground = false } = options;
  const tableX = THEME.margin;
  const labelWidth = 115;
  const valueWidth = THEME.contentWidth - labelWidth - SPACING.md * 2;
  const paddingX = SPACING.md;
  const computed = computeKeyValueRows(doc, rows, labelWidth - paddingX, valueWidth);
  const totalHeight = computed.reduce((sum, r) => sum + r.rowH, 0) + (boxed ? SPACING.sm * 2 : 0);

  ensureSpace(doc, totalHeight + SPACING.sm);
  const startY = doc.y;
  let currentY = startY + (boxed ? SPACING.sm : 0);

  if (boxed) {
    const bg = accentBackground ? THEME.bgAccent : THEME.white;
    drawBox(doc, tableX, startY, THEME.contentWidth, totalHeight, { fill: bg });
  }

  computed.forEach((row, i) => {
    if (i % 2 === (accentBackground ? 1 : 0)) {
      doc.save();
      doc.rect(tableX + 1, currentY, THEME.contentWidth - 2, row.rowH).fill(THEME.bgMuted);
      doc.restore();
    }

    drawTextAt(doc, row.label, tableX + paddingX, currentY + SPACING.xs, labelWidth - paddingX, row.labelOpts);
    drawTextAt(doc, row.value ?? 'N/A', tableX + paddingX + labelWidth, currentY + SPACING.xs, valueWidth, row.valueOpts);

    // Row divider
    doc.save();
    doc.moveTo(tableX + paddingX, currentY + row.rowH)
      .lineTo(tableX + THEME.contentWidth - paddingX, currentY + row.rowH)
      .strokeColor(THEME.border)
      .lineWidth(0.5)
      .stroke();
    doc.restore();

    currentY += row.rowH;
  });

  resetColors(doc);
  doc.y = startY + totalHeight + SPACING.sectionGap;
  return doc.y;
}

/**
 * Compute heights for a table row across columns.
 */
function computeTableRow(doc, cells, widths, cellFontOpts) {
  const cellHeights = cells.map((cell, i) =>
    measureText(doc, cell, widths[i] - SPACING.sm, cellFontOpts)
  );
  const rowH = Math.max(...cellHeights, FONT_SIZE.caption) + SPACING.md;
  return { rowH, cellHeights };
}

/**
 * Multi-column data table with header row and dynamic row heights.
 */
function drawDataTable(doc, headers, rows, colWidths) {
  if (!headers || headers.length === 0) return doc.y;

  const colCount = headers.length;
  const widths = colWidths || headers.map(() => THEME.contentWidth / colCount);
  const tableX = THEME.margin;
  const headerOpts = { font: FONTS.bold, size: FONT_SIZE.caption, color: THEME.white };
  const cellOpts = { font: FONTS.regular, size: FONT_SIZE.caption, color: THEME.text };

  const drawHeader = () => {
    const headerHeights = headers.map((h, i) =>
      measureText(doc, h, widths[i] - SPACING.sm, headerOpts)
    );
    const headerH = Math.max(...headerHeights, FONT_SIZE.caption) + SPACING.md;
    const y = doc.y;

    doc.save();
    doc.rect(tableX, y, THEME.contentWidth, headerH).fill(THEME.primary);
    doc.restore();

    let colX = tableX + SPACING.sm;
    headers.forEach((h, i) => {
      drawTextAt(doc, h, colX, y + SPACING.xs, widths[i] - SPACING.sm, headerOpts);
      colX += widths[i];
    });

    resetColors(doc);
    doc.y = y + headerH;
    return headerH;
  };

  drawHeader();

  rows.forEach((row, i) => {
    const { rowH } = computeTableRow(doc, row, widths, cellOpts);
    ensureSpace(doc, rowH);

    if (doc.y + rowH > PAGE_BOTTOM) {
      doc.addPage();
      doc.y = THEME.margin;
      drawHeader();
    }

    const rowY = doc.y;

    if (i % 2 === 0) {
      doc.save();
      doc.rect(tableX, rowY, THEME.contentWidth, rowH).fill(THEME.bgMuted);
      doc.restore();
    }

    let colX = tableX + SPACING.sm;
    row.forEach((cell, ci) => {
      const isUrlCol = ci === 2 && String(cell).startsWith('http');
      drawTextAt(
        doc,
        cell,
        colX,
        rowY + SPACING.xs,
        widths[ci] - SPACING.sm,
        isUrlCol ? { ...cellOpts, color: THEME.link } : cellOpts,
        isUrlCol && String(cell).startsWith('http') ? { link: String(cell), underline: true } : {}
      );
      colX += widths[ci];
    });

    doc.save();
    doc.moveTo(tableX, rowY + rowH).lineTo(tableX + THEME.contentWidth, rowY + rowH)
      .strokeColor(THEME.border).lineWidth(0.5).stroke();
    doc.restore();

    doc.y = rowY + rowH;
  });

  resetColors(doc);
  doc.y += SPACING.sectionGap;
  return doc.y;
}

/**
 * Styled table for links or images with index, label and URL columns.
 */
function drawRecordTable(doc, type, records) {
  if (!records || records.length === 0) return doc.y;

  const isLinks = type === 'links';
  const headers = isLinks ? ['#', 'Tekst', 'URL'] : ['#', 'Alt-tekst', 'Bron'];
  const widths = [28, 155, THEME.contentWidth - 28 - 155];

  const rows = records.map((item, index) => {
    if (isLinks) {
      return [
        String(index + 1),
        String(item.text || '—').substring(0, 200),
        String(item.href || '').substring(0, 500),
      ];
    }
    return [
      String(index + 1),
      String(item.alt || '—').substring(0, 200),
      String(item.src || '').substring(0, 500),
    ];
  });

  return drawDataTable(doc, headers, rows, widths);
}

/**
 * Heading entry with level badge and visual hierarchy.
 */
function drawHeadingEntry(doc, { tag, text }) {
  const level = parseInt(String(tag || 'h2').replace(/[^0-9]/g, ''), 10) || 2;
  const fontSize = Math.max(9, 13 - level * 0.8);
  const tagLabel = String(tag || 'H2').toUpperCase();
  const content = String(text || '').substring(0, 500);
  const textWidth = THEME.contentWidth - 52;
  const textH = measureText(doc, content, textWidth, {
    font: level <= 2 ? FONTS.bold : FONTS.regular,
    size: fontSize,
  });
  const entryHeight = Math.max(28, textH + SPACING.md);

  ensureSpace(doc, entryHeight + SPACING.xs);

  const x = THEME.margin;
  const y = doc.y;

  if (Math.floor(y / entryHeight) % 2 === 0) {
    doc.save();
    doc.roundedRect(x, y, THEME.contentWidth, entryHeight, 4).fill(THEME.bgMuted);
    doc.restore();
  }

  drawBox(doc, x + SPACING.xs, y + SPACING.xs, 38, 18, { fill: THEME.bgAccent, stroke: true, radius: 3 });
  drawTextAt(doc, tagLabel, x + SPACING.xs + 4, y + SPACING.xs + 4, 32, {
    font: FONTS.bold,
    size: FONT_SIZE.caption,
    color: THEME.primary,
  });

  drawTextAt(doc, content, x + 48, y + SPACING.sm, textWidth, {
    font: level <= 2 ? FONTS.bold : FONTS.regular,
    size: fontSize,
  });

  resetColors(doc);
  doc.y = y + entryHeight + SPACING.xs;
  return doc.y;
}

/**
 * Draw screenshot with border frame, or fallback message.
 */
function drawScreenshot(doc, screenshot, hadScreenshot) {
  drawSectionTitle(doc, 'Screenshot');

  if (screenshot) {
    try {
      let base64Data = screenshot;
      if (base64Data.startsWith('data:image')) {
        base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
      }
      const imageBuffer = Buffer.from(base64Data, 'base64');

      if (imageBuffer.length > 0 && imageBuffer.length < 10 * 1024 * 1024) {
        const frameX = THEME.margin;
        const frameY = doc.y;
        const frameW = THEME.contentWidth;
        const frameH = 400;

        ensureSpace(doc, frameH + SPACING.sectionGap);
        drawBox(doc, frameX, frameY, frameW, frameH, { fill: THEME.white });

        doc.image(imageBuffer, frameX + SPACING.sm, frameY + SPACING.sm, {
          fit: [frameW - SPACING.sm * 2, frameH - SPACING.sm * 2],
          align: 'center',
          valign: 'center',
        });

        doc.y = frameY + frameH + SPACING.sectionGap;
      } else {
        throw new Error('Screenshot too large or invalid');
      }
    } catch {
      ensureSpace(doc, 40);
      drawTextAt(doc, 'Screenshot kon niet worden toegevoegd (te groot of niet beschikbaar)', THEME.margin, doc.y, THEME.contentWidth, {
        font: FONTS.oblique,
        size: FONT_SIZE.body,
        color: THEME.muted,
      }, { align: 'center' });
      doc.y += SPACING.sectionGap;
    }
  } else if (hadScreenshot) {
    ensureSpace(doc, 40);
    drawTextAt(doc, 'Screenshot was beschikbaar maar is verwijderd om payload grootte te beperken', THEME.margin, doc.y, THEME.contentWidth, {
      font: FONTS.oblique,
      size: FONT_SIZE.body,
      color: THEME.muted,
    }, { align: 'center' });
    doc.y += SPACING.sectionGap;
  }

  resetColors(doc);
  return doc.y;
}

/**
 * Draw footers on all buffered pages.
 */
function drawPageFooters(doc, brand = 'Data Scraper') {
  const pageRange = doc.bufferedPageRange();
  const startPage = pageRange.start || 0;
  const totalPages = pageRange.count || 1;

  for (let i = startPage; i < startPage + totalPages; i++) {
    doc.switchToPage(i);
    const footerY = doc.page.height - SPACING.footerY;
    const lineY = footerY - SPACING.sm;

    doc.save();
    doc.moveTo(THEME.margin, lineY).lineTo(doc.page.width - THEME.margin, lineY).stroke(THEME.border);
    doc.restore();

    drawTextAt(doc, `Pagina ${i - startPage + 1} van ${totalPages} · ${brand}`, THEME.margin, footerY, THEME.contentWidth, {
      font: FONTS.regular,
      size: FONT_SIZE.caption,
      color: THEME.muted,
    }, { align: 'center' });
  }

  resetColors(doc);
}

function countHeadings(headings) {
  if (!headings) return 0;
  if (Array.isArray(headings)) return headings.length;
  return Object.values(headings).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
}

function flattenHeadingsForPdf(headings) {
  if (!headings) return [];
  if (Array.isArray(headings)) {
    return headings.map(h => ({
      tag: h.tag || h.level || 'h2',
      text: h.text || '',
    }));
  }
  const out = [];
  Object.keys(headings).forEach(level => {
    const arr = headings[level];
    if (Array.isArray(arr)) {
      arr.forEach(h => out.push({ tag: level, text: h.text || '' }));
    }
  });
  return out;
}

module.exports = {
  createDocument,
  ensureSpace,
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
};
