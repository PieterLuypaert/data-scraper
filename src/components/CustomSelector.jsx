import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tooltip, InfoBadge } from './ui/tooltip';
import { HelpText } from './ui/help-text';
import { Plus, Loader2, Code } from 'lucide-react';
import { validateUrl } from '@/utils/validation';
import { PageShell, PageHeader } from './ui/page-shell';
import { useToast } from './ui/toast';
import { t } from '@/i18n';
import { SELECTOR_TEMPLATES } from './customSelector/templates';
import { SelectorRow } from './customSelector/SelectorRow';
import { ResultsView } from './customSelector/ResultsView';

export function CustomSelector({ onScrapeSuccess }) {
  const [url, setUrl] = useState('');
  const [selectors, setSelectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [testingSelector, setTestingSelector] = useState(null);
  const { toast, update, dismiss } = useToast();
  const notifyError = (description, title = 'Fout') =>
    toast({ variant: 'error', title, description });

  const addSelector = () => {
    setSelectors([...selectors, { name: '', selector: '', id: Date.now() }]);
  };

  const removeSelector = (id) => {
    setSelectors(selectors.filter(s => s.id !== id));
  };

  const updateSelector = (id, field, value) => {
    setSelectors(selectors.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const addTemplate = (template) => {
    setSelectors([...selectors, {
      name: template.name,
      selector: template.selector,
      id: Date.now()
    }]);
  };

  const validateSelectors = () => {
    if (selectors.length === 0) {
      notifyError('Voeg minimaal één selector toe');
      return false;
    }

    for (const sel of selectors) {
      if (!sel.selector.trim()) {
        notifyError('Alle selectors moeten een CSS selector hebben');
        return false;
      }
    }

    return true;
  };

  const testSelector = async (selector) => {
    if (!url.trim()) {
      notifyError('Voer eerst een URL in');
      return;
    }

    const validation = validateUrl(url);
    if (!validation.isValid) {
      notifyError(validation.error, 'Ongeldige URL');
      return;
    }

    setTestingSelector(selector.id);

    try {
      const response = await fetch('http://localhost:3001/api/scrape/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: validation.normalizedUrl,
          selectors: [{ name: selector.name || 'Test', selector: selector.selector }]
        }),
      });

      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Test mislukt');
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} ${response.statusText}. Controleer of de backend server draait op poort 3001.`);
        }
      }

      let data;
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server gaf geen JSON terug (${response.status}). Controleer of de backend server draait op poort 3001.`);
      }

      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Kon JSON niet parsen. Server gaf terug: ${text.substring(0, 100)}...`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Test mislukt');
      }

      const result = data.data[selector.name || 'Test'] || data.data[selector.selector];
      
      if (result && result.error) {
        notifyError(`Selector fout: ${result.error}`);
        updateSelector(selector.id, 'testResult', {
          success: false,
          error: result.error
        });
      } else if (Array.isArray(result) && result.length === 0) {
        notifyError('Geen elementen gevonden met deze selector');
        updateSelector(selector.id, 'testResult', {
          success: false,
          error: 'Geen elementen gevonden'
        });
      } else if (Array.isArray(result)) {
        // Update selector met success indicator
        updateSelector(selector.id, 'testResult', {
          success: true,
          count: result.length
        });
        toast({ variant: 'success', title: 'Selector werkt', description: `${result.length} element(en) gevonden` });
      } else {
        throw new Error('Onverwacht resultaat formaat');
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        notifyError('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.', 'Geen verbinding');
      } else {
        notifyError(err.message || 'Test mislukt', 'Test mislukt');
      }
      updateSelector(selector.id, 'testResult', {
        success: false,
        error: err.message || 'Test mislukt'
      });
    } finally {
      setTestingSelector(null);
    }
  };

  const handleScrape = async () => {
    setResults(null);

    const validation = validateUrl(url);
    if (!validation.isValid) {
      notifyError(validation.error, 'Ongeldige URL');
      return;
    }

    if (!validateSelectors()) {
      return;
    }

    setLoading(true);
    const loadingId = toast({
      variant: 'loading',
      title: 'Bezig met scrapen…',
      description: validation.normalizedUrl,
    });

    try {
      const response = await fetch('http://localhost:3001/api/scrape/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: validation.normalizedUrl,
          selectors: selectors.map(s => ({
            name: s.name || s.selector,
            selector: s.selector
          }))
        }),
      });

      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Scraping mislukt');
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} ${response.statusText}. Controleer of de backend server draait op poort 3001.`);
        }
      }

      let data;
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server gaf geen JSON terug (${response.status}). Controleer of de backend server draait op poort 3001.`);
      }

      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Kon JSON niet parsen. Server gaf terug: ${text.substring(0, 100)}...`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Scraping mislukt');
      }

      setResults(data.data);
      // Transform to standard format for display
      const transformedData = {
        title: `Custom Selector Results - ${validation.normalizedUrl}`,
        url: validation.normalizedUrl,
        customResults: data.data,
        timestamp: new Date().toISOString()
      };
      onScrapeSuccess?.(transformedData, validation.normalizedUrl);
      update(loadingId, {
        variant: 'success',
        title: 'Scrape voltooid',
        description: `Data opgehaald van ${validation.normalizedUrl}`,
      });
    } catch (err) {
      dismiss(loadingId);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        notifyError('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.', 'Geen verbinding');
      } else {
        notifyError(err.message || 'Er is een fout opgetreden', 'Scrapen mislukt');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell size="wide">
      <PageHeader
        title={t('tabs.custom')}
        description={t('tooltips.custom')}
      />
    <div className="space-y-6">
      {/* URL Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">URL</CardTitle>
          <CardDescription>Voer de URL in die je wilt scrapen met custom selectors</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="https://voorbeeld.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Template Selectors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Selector Templates</CardTitle>
          <CardDescription>Klik op een template om deze toe te voegen</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {SELECTOR_TEMPLATES.map((template, i) => (
              <button
                key={i}
                onClick={() => addTemplate(template)}
                className="rounded-xl border border-indigo-200/40 bg-indigo-50/30 p-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/60 hover:shadow-sm"
              >
                <div className="font-medium text-sm text-gray-900 mb-1">{template.name}</div>
                <div className="text-xs text-gray-600 line-clamp-2">{template.description}</div>
                <div className="text-xs text-gray-500 mt-2 font-mono truncate">{template.selector}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Selectors */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                Custom Selectors
                <InfoBadge tooltip="Gebruik CSS selectors (zoals .class, #id, element) om specifieke elementen van een pagina te extraheren. Voor gevorderde gebruikers." />
              </CardTitle>
              <CardDescription>Voeg CSS selectors toe om specifieke elementen te scrapen</CardDescription>
            </div>
            <Tooltip content="Voeg een nieuwe CSS selector toe">
              <Button onClick={addSelector} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Selector Toevoegen
              </Button>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <HelpText type="tip" title="Wat zijn CSS selectors?">
            CSS selectors zijn patronen om elementen op een pagina te vinden. Bijvoorbeeld: <code>.product-title</code> voor elementen met class &quot;product-title&quot;, 
            of <code>h1</code> voor alle H1 headings. Gebruik de templates hieronder of voer je eigen selector in.
          </HelpText>
          
          {selectors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Geen selectors toegevoegd. Voeg een selector toe of gebruik een template.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectors.map((selector) => (
                <SelectorRow
                  key={selector.id}
                  selector={selector}
                  loading={loading}
                  testingSelector={testingSelector}
                  url={url}
                  onUpdate={updateSelector}
                  onTest={testSelector}
                  onRemove={removeSelector}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scrape Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleScrape} 
          disabled={loading || selectors.length === 0 || !url.trim()}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Scrapen...
            </>
          ) : (
            <>
              <Code className="mr-2 h-5 w-5" />
              Start Custom Scraping
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {results && <ResultsView results={results} />}
    </div>
    </PageShell>
  );
}

