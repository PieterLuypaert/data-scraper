const ExcelJS = require('exceljs');
const {
  buildSheetDescriptors,
  flattenHeadings,
  makeUniqueSheetName,
  exportToExcel,
  batchExportToExcel,
  exportCrawlToExcel,
} = require('../server/routes/export');

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    headersSent: false,
    status(c) { this.statusCode = c; return this; },
    setHeader(k, v) { this.headers[k] = v; },
    json(o) { this.body = o; this.headersSent = true; return this; },
    send(b) { this.body = b; this.headersSent = true; return this; },
  };
}

const samplePage = (n = 1) => ({
  url: `https://example.com/p${n}`,
  title: `Page ${n}`,
  lang: 'nl',
  headings: { h1: [{ text: 'Title', id: 'a', className: 'c' }], h2: [{ text: 'Sub' }] },
  links: [{ text: 'home', href: 'https://example.com' }],
  images: [{ alt: 'logo', src: 'https://example.com/a.png', width: 1, height: 2 }],
  metaTags: { description: 'd' },
});

async function readSheets(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return wb;
}

describe('flattenHeadings (A5)', () => {
  it('flattens the {h1:[...]} object shape', () => {
    const flat = flattenHeadings({ h1: [{ text: 'A', id: 'x', className: 'y' }], h2: [{ text: 'B' }] });
    expect(flat).toHaveLength(2);
    expect(flat[0]).toEqual({ level: 'h1', text: 'A', id: 'x', className: 'y' });
    expect(flat[1].level).toBe('h2');
  });

  it('handles array shape and empty input', () => {
    expect(flattenHeadings([{ tag: 'h3', text: 'C' }])[0].level).toBe('h3');
    expect(flattenHeadings(undefined)).toEqual([]);
  });
});

describe('makeUniqueSheetName', () => {
  it('sanitizes forbidden chars and truncates to 31', () => {
    const used = new Set();
    const name = makeUniqueSheetName('a/b:c*d?[e]', used);
    expect(name).not.toMatch(/[*?:\\/[\]]/);
  });

  it('deduplicates repeated names', () => {
    const used = new Set();
    const a = makeUniqueSheetName('Overview', used);
    const b = makeUniqueSheetName('Overview', used);
    expect(a).toBe('Overview');
    expect(b).not.toBe(a);
  });
});

describe('buildSheetDescriptors (A5/A6)', () => {
  it('puts lang in Overview and counts flattened headings', () => {
    const sheets = buildSheetDescriptors(samplePage());
    const overview = sheets.find(s => s.name === 'Overview');
    const langRow = overview.rows.find(r => r[0] === 'Language');
    const headRow = overview.rows.find(r => r[0] === 'Total Headings');
    expect(langRow[1]).toBe('nl');
    expect(headRow[1]).toBe(2);
    expect(sheets.find(s => s.name === 'Headings').rows).toHaveLength(2);
  });
});

describe('exportToExcel roundtrip', () => {
  it('produces a valid workbook with the expected sheets', async () => {
    const res = mockRes();
    await exportToExcel({ body: { data: samplePage() } }, res);
    expect(Buffer.isBuffer(res.body)).toBe(true);
    const wb = await readSheets(res.body);
    const names = wb.worksheets.map(w => w.name);
    expect(names).toEqual(expect.arrayContaining(['Overview', 'Links', 'Images', 'Headings', 'Meta Tags']));
    expect(wb.getWorksheet('Headings').getRow(2).values.slice(1)).toEqual(['h1', 'Title', 'a', 'c']);
  });
});

describe('batchExportToExcel (A7)', () => {
  it('emits full per-scrape sheets prefixed S{n}_', async () => {
    const res = mockRes();
    await batchExportToExcel({ body: { scrapes: [
      { id: '1', url: 'https://a.com', data: samplePage(1) },
      { id: '2', url: 'https://b.com', data: samplePage(2) },
    ] } }, res);
    const wb = await readSheets(res.body);
    const names = wb.worksheets.map(w => w.name);
    expect(names).toContain('Summary');
    expect(names.some(n => n.startsWith('S1_'))).toBe(true);
    expect(names.some(n => n.startsWith('S2_'))).toBe(true);
  });
});

describe('exportCrawlToExcel (multi-page, no duplicate-sheet crash)', () => {
  it('builds a workbook for >=2 pages with unique sheet names', async () => {
    const res = mockRes();
    await exportCrawlToExcel({ body: { data: {
      startUrl: 'https://example.com',
      totalPages: 2,
      pages: [samplePage(1), samplePage(2)],
      summary: { totalLinks: 2, totalImages: 2, totalHeadings: 4 },
    } } }, res);
    expect(Buffer.isBuffer(res.body)).toBe(true);
    const wb = await readSheets(res.body);
    const names = wb.worksheets.map(w => w.name);
    expect(new Set(names).size).toBe(names.length); // no duplicates
    expect(names.some(n => n.startsWith('P1_'))).toBe(true);
    expect(names.some(n => n.startsWith('P2_'))).toBe(true);
  });
});
