import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { crawlWebsite } from '@/api/scraper';
import { validateUrl } from '@/utils/validation';
import { Loader2, Globe, Settings, Info } from 'lucide-react';

export function CrawlForm({ onCrawlSuccess, onCrawlError }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    maxPages: 50,
    maxDepth: 3,
    sameDomain: true,
    includeSubdomains: false,
    delay: 1000,
    followExternalLinks: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateUrl(url);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const data = await crawlWebsite(validation.normalizedUrl, options);
      
      onCrawlSuccess(data);
      setUrl('');
    } catch (err) {
      console.error('CrawlForm error:', err);
      const errorMessage = err.message || 'Er is een fout opgetreden';
      setError(errorMessage);
      onCrawlError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Crawl Website (Alle Pagina's)
        </CardTitle>
        <CardDescription>
          Scrape alle pagina's van een website door automatisch links te volgen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="https://voorbeeld.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Crawlen...
                </>
              ) : (
                'Start Crawl'
              )}
            </Button>
          </div>

          {/* Options Toggle */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOptions(!showOptions)}
            >
              <Settings className="mr-2 h-4 w-4" />
              {showOptions ? 'Verberg' : 'Toon'} Opties
            </Button>
          </div>

          {/* Advanced Options */}
          {showOptions && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Pas deze instellingen aan om te bepalen hoeveel pagina's worden gescraped en hoe diep de crawler gaat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Pagina's
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={options.maxPages}
                    onChange={(e) => setOptions({ ...options, maxPages: parseInt(e.target.value) || 50 })}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum aantal pagina's om te scrapen
                    {options.maxPages > 100 && (
                      <span className="block mt-1 text-yellow-600 font-medium">
                        ⚠ Grote crawl: Dit kan lang duren en veel geheugen gebruiken
                      </span>
                    )}
                    {options.maxPages > 500 && (
                      <span className="block mt-1 text-orange-600 font-medium">
                        ⚠⚠ Zeer grote crawl: Export kan lang duren of falen bij zeer grote datasets
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Diepte
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={options.maxDepth}
                    onChange={(e) => setOptions({ ...options, maxDepth: parseInt(e.target.value) || 3 })}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Hoe diep te crawlen vanaf start URL</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vertraging (ms)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="5000"
                    step="100"
                    value={options.delay}
                    onChange={(e) => setOptions({ ...options, delay: parseInt(e.target.value) || 1000 })}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Wachttijd tussen requests</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.sameDomain}
                    onChange={(e) => setOptions({ ...options, sameDomain: e.target.checked })}
                    disabled={loading}
                    className="rounded"
                  />
                  <span className="text-sm">Alleen zelfde domein</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeSubdomains}
                    onChange={(e) => setOptions({ ...options, includeSubdomains: e.target.checked })}
                    disabled={loading}
                    className="rounded"
                  />
                  <span className="text-sm">Inclusief subdomeinen</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.followExternalLinks}
                    onChange={(e) => setOptions({ ...options, followExternalLinks: e.target.checked })}
                    disabled={loading}
                    className="rounded"
                  />
                  <span className="text-sm">Volg externe links</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

