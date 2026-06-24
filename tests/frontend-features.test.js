/**
 * Smoke test: all feature barrel exports resolve after refactors.
 */
describe('feature barrel exports', () => {
  const features = [
    { path: '../src/components/features/scrape/index.js', exports: ['ScrapeForm'] },
    { path: '../src/components/features/crawl/index.js', exports: ['CrawlForm'] },
    { path: '../src/components/features/bulk/index.js', exports: ['BulkScrapeForm'] },
    { path: '../src/components/features/custom-selector/index.js', exports: ['CustomSelector'] },
    { path: '../src/components/features/results/index.js', exports: ['ScrapeResultsExtended'] },
    {
      path: '../src/components/features/analytics/index.js',
      exports: ['AnalyticsDashboard', 'DataVisualization'],
    },
    {
      path: '../src/components/features/history/index.js',
      exports: ['HistoryManager', 'ChangeDetection'],
    },
    { path: '../src/components/features/seo/index.js', exports: ['SEOAnalysis'] },
    { path: '../src/components/features/insights/index.js', exports: ['AIInsights'] },
    { path: '../src/components/features/proxy/index.js', exports: ['ProxyManager'] },
    { path: '../src/components/features/settings/index.js', exports: ['LanguageSettings'] },
  ];

  it.each(features)('resolves $path', async ({ path: modulePath, exports: names }) => {
    const mod = await import(modulePath);
    for (const name of names) {
      expect(mod[name], `${name} should be exported`).toBeDefined();
      expect(typeof mod[name]).toBe('function');
    }
  });
});
