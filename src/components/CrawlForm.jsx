import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tooltip, InfoBadge } from './ui/tooltip';
import { HelpText } from './ui/help-text';
import { crawlWebsite } from '@/api/scraper';
import { validateUrl } from '@/utils/validation';
import { Loader2, Settings, Info, AlertTriangle } from 'lucide-react';
import { PageShell, PageHeader } from './ui/page-shell';
import { useToast } from './ui/toast';
import { t } from '@/i18n';

export function CrawlForm({ onCrawlSuccess, onCrawlError }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { toast, update, dismiss } = useToast();
  const [options, setOptions] = useState({
    maxPages: 50,
    maxDepth: 3,
    sameDomain: true,
    includeSubdomains: false,
    delay: 1000,
    followExternalLinks: false
  });

  // Track the in-flight crawl so we can stop polling if the component unmounts.
  const pendingCrawl = useRef(null);
  useEffect(() => () => pendingCrawl.current?.cancel?.(), []);

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
      title: 'Bezig met crawlen…',
      description: validation.normalizedUrl,
    });
    try {
      const crawl = crawlWebsite(validation.normalizedUrl, options);
      pendingCrawl.current = crawl;
      const data = await crawl;

      onCrawlSuccess(data);
      setUrl('');
      update(loadingId, {
        variant: 'success',
        title: 'Crawl voltooid',
        description: `${data?.totalPages ?? data?.pages?.length ?? 0} pagina's gecrawld`,
      });
    } catch (err) {
      console.error('CrawlForm error:', err);
      const errorMessage = err.message || 'Er is een fout opgetreden';
      onCrawlError?.(errorMessage);
      dismiss(loadingId);
      toast({ variant: 'error', title: 'Crawlen mislukt', description: errorMessage });
    } finally {
      pendingCrawl.current = null;
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <PageShell size="wide">
      <PageHeader
        title={t('tabs.crawl')}
        description={t('tooltips.crawl')}
      />
      <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <HelpText type="tip" title="Begin met een kleine crawl">
            Start met een klein aantal pagina's (10-20) om te testen. Verhoog daarna naar meer pagina's als nodig. 
            Grote crawls kunnen lang duren en veel geheugen gebruiken.
          </HelpText>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="crawl-url" className="text-sm font-medium text-gray-700">
                  Start URL
                </label>
                <InfoBadge tooltip="De crawler start vanaf deze URL en volgt links binnen hetzelfde domein" />
              </div>
              <div className="flex gap-2">
                <Input
                  id="crawl-url"
                  type="text"
                  placeholder="https://voorbeeld.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1"
                />
                <Tooltip content="Start het crawlen van de website">
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
                </Tooltip>
              </div>
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
            <div className="space-y-4 rounded-xl border border-indigo-200/40 bg-indigo-50/30 p-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Pas deze instellingen aan om te bepalen hoeveel pagina's worden gescraped en hoe diep de crawler gaat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-medium">
                      Max Pagina's
                    </label>
                    <InfoBadge tooltip="Maximum aantal pagina's dat wordt gescraped. Hogere waarden = langere wachttijd." />
                  </div>
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
                      <span className="mt-1 flex items-center gap-1.5 text-yellow-600 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        Grote crawl: Dit kan lang duren en veel geheugen gebruiken
                      </span>
                    )}
                    {options.maxPages > 500 && (
                      <span className="mt-1 flex items-center gap-1.5 text-orange-600 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        Zeer grote crawl: Export kan lang duren of falen bij zeer grote datasets
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-medium">
                      Max Diepte
                    </label>
                    <InfoBadge tooltip="Hoeveel niveaus diep de crawler gaat. Diepte 1 = alleen startpagina, diepte 2 = startpagina + directe links, etc." />
                  </div>
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
                  <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-medium">
                      Vertraging (ms)
                    </label>
                    <InfoBadge tooltip="Wachttijd tussen elke request. Hogere waarden = respectvoller voor de server, maar langzamer." />
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="5000"
                    step="100"
                    value={options.delay}
                    onChange={(e) => setOptions({ ...options, delay: parseInt(e.target.value) || 1000 })}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Wachttijd tussen requests (aanbevolen: 1000ms)</p>
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
        </form>
        </div>
      </CardContent>
    </Card>
    </PageShell>
  );
}

