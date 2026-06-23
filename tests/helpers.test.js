const { needsPuppeteer } = require('../server/utils/helpers');
const { detectContentType } = require('../server/scrapers/extractors/analysisExtractors');

const JS_HEAVY = ['bol.com', 'amazon', 'coolblue'];

describe('needsPuppeteer (A3 regression)', () => {
  it('matches exact host and subdomains for full-domain entries', () => {
    expect(needsPuppeteer('https://www.bol.com', JS_HEAVY)).toBe(true);
    expect(needsPuppeteer('https://bol.com', JS_HEAVY)).toBe(true);
  });

  it('matches bare brand as a whole domain label', () => {
    expect(needsPuppeteer('https://www.amazon.nl/x', JS_HEAVY)).toBe(true);
    expect(needsPuppeteer('https://amazon.com', JS_HEAVY)).toBe(true);
  });

  it('does not match brand as a substring of another label', () => {
    expect(needsPuppeteer('https://getamazonreviews.nl', JS_HEAVY)).toBe(false);
    expect(needsPuppeteer('https://bol.com.evil.com', JS_HEAVY)).toBe(false);
    expect(needsPuppeteer('https://example.com', JS_HEAVY)).toBe(false);
  });
});

describe('detectContentType (A1 regression — prices is an array)', () => {
  it('flags e-commerce when prices array is non-empty', () => {
    const result = detectContentType('Product page', 'some text', {}, ['€ 9,99'], []);
    expect(result.isEcommerce).toBe(true);
  });

  it('does not crash and is false when no prices and no keywords', () => {
    const result = detectContentType('Hello', 'a plain blog about cats', {}, [], []);
    expect(result.isEcommerce).toBe(false);
  });
});
