import { useState } from 'react';
import { Button } from './ui/button';
import { InfoBadge } from './ui/tooltip';
import { scrapeWebsite } from '@/api/scraper';
import { validateUrl } from '@/utils/validation';
import { saveToHistory, updateAnalytics } from '@/utils/storage';
import { Loader2, Camera, HelpCircle, ChevronDown, Globe, ArrowRight } from 'lucide-react';
import { PageShell, PageHeader } from './ui/page-shell';
import { useToast } from './ui/toast';

export function ScrapeForm({ onScrapeSuccess, onScrapeError, compact = false }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [forcePuppeteer, setForcePuppeteer] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { toast, update, dismiss } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateUrl(url);
    if (!validation.isValid) {
      toast({ variant: 'error', title: 'Ongeldige URL', description: validation.error });
      return;
    }

    setLoading(true);
    const loadingId = toast({
      variant: 'loading',
      title: 'Bezig met scrapen…',
      description: validation.normalizedUrl,
    });
    try {
      const data = await scrapeWebsite(validation.normalizedUrl, forcePuppeteer);

      // Save to history and update analytics
      saveToHistory(data, validation.normalizedUrl);
      updateAnalytics(true, validation.normalizedUrl);

      onScrapeSuccess(data);
      setUrl('');
      setHelpOpen(false);
      update(loadingId, {
        variant: 'success',
        title: 'Scrape voltooid',
        description: `Data opgehaald van ${validation.normalizedUrl}`,
      });
    } catch (err) {
      console.error('ScrapeForm error:', err);
      const errorMessage = err.message || 'Er is een fout opgetreden';
      updateAnalytics(false, validation.normalizedUrl);
      onScrapeError?.(errorMessage);
      dismiss(loadingId);
      toast({ variant: 'error', title: 'Scrapen mislukt', description: errorMessage });
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
    <PageShell size="narrow" centered>
      {compact ? (
        <p className="mb-1 text-sm font-medium text-gray-500">
          Scrape nog een website
        </p>
      ) : (
        <PageHeader
          align="center"
          title="Start met"
          highlight="scrapen"
          description="Plak een URL en haal in één klik links, afbeeldingen, tekst, meta tags en meer op."
          className="mb-0"
        />
      )}

      {/* URL bar */}
      <form onSubmit={handleSubmit} className={`w-full max-w-2xl ${compact ? 'mt-2' : 'mt-8'}`}>
        <label htmlFor="scrape-url" className="sr-only">
          Website URL
        </label>
        <div
          className={`group flex items-center gap-2 rounded-2xl border bg-white p-2 shadow-elevated transition-all ${
            loading ? 'border-indigo-200' : 'border-gray-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/15'
          }`}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-focus-within:bg-indigo-50 group-focus-within:text-indigo-500">
            <Globe className="h-5 w-5" />
          </div>
          <input
            id="scrape-url"
            type="text"
            placeholder="https://voorbeeld.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoComplete="off"
            className="h-11 min-w-0 flex-1 bg-transparent px-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
          />
          <Button type="submit" size="lg" disabled={loading} className="flex-shrink-0">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Laden...
              </>
            ) : (
              <>
                Scrapen
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Options row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <input
              type="checkbox"
              checked={forcePuppeteer}
              onChange={(e) => setForcePuppeteer(e.target.checked)}
              disabled={loading}
              className="rounded accent-indigo-600"
            />
            <Camera className="h-4 w-4" />
            <span>Altijd screenshot maken</span>
            <InfoBadge tooltip="Gebruikt Puppeteer (headless browser) voor JavaScript-heavy sites. Langzamer maar geeft screenshots en werkt met dynamische content." />
          </label>

          <button
            type="button"
            onClick={() => setHelpOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
          >
            <HelpCircle className="h-4 w-4" />
            Hoe werkt dit?
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                helpOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {helpOpen && (
          <p className="mx-auto mt-3 max-w-prose text-sm leading-relaxed text-gray-500">
            Voer een URL in om een enkele webpagina te scrapen. De scraper extraheert
            automatisch links, afbeeldingen, tekst, meta tags en meer. Gebruik{' '}
            <strong className="font-semibold text-gray-600">Crawlen</strong> voor meerdere
            pagina's of <strong className="font-semibold text-gray-600">Bulk Scrapen</strong>{' '}
            voor meerdere URLs tegelijk.
          </p>
        )}
      </form>
    </PageShell>
  );
}

