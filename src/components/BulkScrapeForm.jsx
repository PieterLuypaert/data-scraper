import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { scrapeWebsite } from '@/api/scraper';
import { validateUrl } from '@/utils/validation';
import { Loader2, Plus, X, CheckCircle2, XCircle } from 'lucide-react';
import { saveToHistory, updateAnalytics } from '@/utils/storage';

export function BulkScrapeForm({ onScrapeComplete }) {
  const [urls, setUrls] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleBulkScrape = async () => {
    // Validate all URLs
    const validUrls = [];
    const invalidIndices = [];

    urls.forEach((url, index) => {
      const trimmed = url.trim();
      if (trimmed) {
        const validation = validateUrl(trimmed);
        if (validation.isValid) {
          validUrls.push(validation.normalizedUrl);
        } else {
          invalidIndices.push(index);
        }
      }
    });

    if (validUrls.length === 0) {
      alert('Voer minimaal één geldige URL in');
      return;
    }

    if (invalidIndices.length > 0) {
      alert(`Sommige URLs zijn ongeldig. Controleer de ingevoerde URLs.`);
    }

    setLoading(true);
    setResults([]);
    setProgress({ current: 0, total: validUrls.length });

    const scrapeResults = [];

    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      setProgress({ current: i + 1, total: validUrls.length });

      try {
        const data = await scrapeWebsite(url);
        const result = {
          url,
          success: true,
          data,
          error: null,
        };
        scrapeResults.push(result);
        
        // Save to history
        saveToHistory(data, url);
        updateAnalytics(true, url);
      } catch (error) {
        const result = {
          url,
          success: false,
          data: null,
          error: error.message,
        };
        scrapeResults.push(result);
        updateAnalytics(false, url);
      }

      // Small delay to avoid overwhelming the server
      if (i < validUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setResults(scrapeResults);
    setLoading(false);
    onScrapeComplete?.(scrapeResults);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Scraping</CardTitle>
        <CardDescription>Scrape meerdere URLs tegelijk</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                placeholder={`URL ${index + 1} (https://voorbeeld.com)`}
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              {urls.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeUrlField(index)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={addUrlField}
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            URL Toevoegen
          </Button>
          <Button
            type="button"
            onClick={handleBulkScrape}
            disabled={loading || urls.every(u => !u.trim())}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scrapen... ({progress.current}/{progress.total})
              </>
            ) : (
              'Start Bulk Scraping'
            )}
          </Button>
        </div>

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Resultaten:</h4>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium break-all">
                    {result.url}
                  </span>
                </div>
                {result.error && (
                  <p className="text-sm text-red-600 mt-1">{result.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

