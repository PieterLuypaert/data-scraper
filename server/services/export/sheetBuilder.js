const ExcelJS = require('exceljs');

/**
 * Flatten the headings structure into a flat array of rows. `headings` is an
 * object keyed by level ({ h1: [...], h2: [...] }); older/crawled shapes may
 * already be an array. Returns [{ level, text, id, className }].
 * @param {object|Array} headings
 * @returns {Array<{level: string, text: string, id: string, className: string}>}
 */
function flattenHeadings(headings) {
  if (!headings) return [];
  if (Array.isArray(headings)) {
    return headings.map(h => ({
      level: h.level || h.tag || '',
      text: h.text || '',
      id: h.id || '',
      className: h.className || h.class || '',
    }));
  }
  const out = [];
  Object.keys(headings).forEach(level => {
    const arr = headings[level];
    if (Array.isArray(arr)) {
      arr.forEach(h => out.push({
        level,
        text: h.text || '',
        id: h.id || '',
        className: h.className || h.class || '',
      }));
    }
  });
  return out;
}

/**
 * Build the list of sheets (name + header + rows) for a single scraped page.
 * Same sheet names and column order as before; "skip empty section" preserved.
 * @param {object} scrapedData
 * @returns {Array<{name: string, header: string[], rows: Array<Array>}>}
 */
function buildSheetDescriptors(scrapedData) {
  const headings = flattenHeadings(scrapedData.headings);
  const sheets = [];

  // Overview sheet (key/value)
  sheets.push({
    name: 'Overview',
    header: ['Property', 'Value'],
    rows: [
      ['URL', scrapedData.url || ''],
      ['Title', scrapedData.title || ''],
      ['Description', scrapedData.description || ''],
      ['Language', scrapedData.lang || scrapedData.language || ''],
      ['Timestamp', scrapedData.timestamp || new Date().toISOString()],
      ['Total Links', scrapedData.links?.length || 0],
      ['Total Images', scrapedData.images?.length || 0],
      ['Total Headings', headings.length],
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
  if (headings.length > 0) {
    sheets.push({
      name: 'Headings',
      header: ['Level', 'Text', 'ID', 'Class'],
      rows: headings.map(h => [h.level, h.text, h.id, h.className]),
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
  let base = String(rawName).replace(/[*?:\\/[\]]/g, '_').trim() || 'Sheet';
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

module.exports = {
  flattenHeadings,
  buildSheetDescriptors,
  makeUniqueSheetName,
  addSheet,
  workbookToBuffer,
};
