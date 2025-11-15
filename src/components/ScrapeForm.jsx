import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, InfoBadge } from './ui/tooltip';
import { HelpText } from './ui/help-text';
import { scrapeWebsite } from '@/api/scraper';
import { validateUrl } from '@/utils/validation';
import { saveToHistory, updateAnalytics } from '@/utils/storage';
import { Loader2, Camera, Info } from 'lucide-react';

export function ScrapeForm({ onScrapeSuccess, onScrapeError }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forcePuppeteer, setForcePuppeteer] = useState(false);

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
      const data = await scrapeWebsite(validation.normalizedUrl, forcePuppeteer);
      
      // Save to history and update analytics
      saveToHistory(data, validation.normalizedUrl);
      updateAnalytics(true, validation.normalizedUrl);
      
      onScrapeSuccess(data);
      setUrl('');
    } catch (err) {
      console.error('ScrapeForm error:', err);
      const errorMessage = err.message || 'Er is een fout opgetreden';
      updateAnalytics(false, validation.normalizedUrl);
      setError(errorMessage);
      onScrapeError?.(errorMessage);
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
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <HelpText type="info" title="Hoe werkt dit?">
        Voer een URL in om een enkele webpagina te scrapen. De scraper extraheert automatisch links, afbeeldingen, tekst, meta tags en meer. 
        Gebruik <strong>Crawlen</strong> voor meerdere pagina's of <strong>Bulk Scrapen</strong> voor meerdere URLs tegelijk.
      </HelpText>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="scrape-url" className="text-sm font-medium text-gray-700">
              Website URL
            </label>
            <InfoBadge tooltip="Voer een volledige URL in, bijvoorbeeld: https://example.com" />
          </div>
          <div className="flex gap-2">
            <Input
              id="scrape-url"
              type="text"
              placeholder="https://voorbeeld.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Tooltip content="Start het scrapen van de website">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Laden...
                  </>
                ) : (
                  'Scrapen'
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={forcePuppeteer}
              onChange={(e) => setForcePuppeteer(e.target.checked)}
              disabled={loading}
              className="rounded"
            />
            <Camera className="h-4 w-4" />
            <span>Altijd screenshot maken</span>
            <InfoBadge tooltip="Gebruikt Puppeteer (headless browser) voor JavaScript-heavy sites. Langzamer maar geeft screenshots en werkt met dynamische content." />
          </label>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}

