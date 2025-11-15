import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, InfoBadge } from './ui/tooltip';
import { HelpText } from './ui/help-text';
import { Plus, Trash2, Play, CheckCircle, XCircle, Loader2, Code, FileText, DollarSign, ShoppingBag, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { validateUrl } from '@/utils/validation';

const SELECTOR_TEMPLATES = [
  {
    name: 'Afbeeldingen',
    selector: 'img',
    description: 'Vind alle afbeeldingen op de pagina'
  },
  {
    name: 'Alle Links',
    selector: 'a[href]',
    description: 'Vind alle links op de pagina'
  },
  {
    name: 'Headings',
    selector: 'h1, h2, h3, h4, h5, h6',
    description: 'Vind alle headings'
  },
  {
    name: 'Paragrafen',
    selector: 'p',
    description: 'Vind alle paragrafen'
  },
  {
    name: 'Meta Description',
    selector: 'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]',
    description: 'Vind meta description (alle varianten)'
  },
  {
    name: 'Meta Tags',
    selector: 'meta',
    description: 'Vind alle meta tags'
  },
  {
    name: 'Product Namen',
    selector: '.product-title, .product-name, h2.product, [class*="product"] h2, [class*="product-title"], [class*="product-name"], .item-title, .item-name',
    description: 'Vind productnamen op e-commerce sites'
  },
  {
    name: 'Prijzen',
    selector: '.price, .product-price, [class*="price"], [data-price], .cost, .amount, [class*="cost"], [class*="amount"]',
    description: 'Vind prijzen op e-commerce sites'
  },
  {
    name: 'Product Afbeeldingen',
    selector: 'img[class*="product"], img[alt*="product"], .product img, [class*="product"] img, .item img, [class*="item"] img, img[data-product], img.product-image, img.product-img',
    description: 'Vind productafbeeldingen (specifiek)'
  },
  {
    name: 'Product Links',
    selector: 'a[href*="/product"], a[href*="/item"], a[href*="/p/"], .product-link, a.product, [class*="product"] a',
    description: 'Vind product links'
  },
  {
    name: 'Beschrijvingen',
    selector: '.product-description, .description, [class*="desc"], .summary, .excerpt, [class*="summary"]',
    description: 'Vind productbeschrijvingen'
  },
  {
    name: 'Buttons',
    selector: 'button, [type="button"], [type="submit"], .btn, [class*="button"]',
    description: 'Vind alle buttons'
  },
  {
    name: 'Forms',
    selector: 'form',
    description: 'Vind alle formulieren'
  },
  {
    name: 'Tabellen',
    selector: 'table',
    description: 'Vind alle tabellen'
  }
];

export function CustomSelector({ onScrapeSuccess }) {
  const [url, setUrl] = useState('');
  const [selectors, setSelectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [testingSelector, setTestingSelector] = useState(null);

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
      setError('Voeg minimaal één selector toe');
      return false;
    }

    for (const sel of selectors) {
      if (!sel.selector.trim()) {
        setError('Alle selectors moeten een CSS selector hebben');
        return false;
      }
    }

    return true;
  };

  const testSelector = async (selector) => {
    if (!url.trim()) {
      setError('Voer eerst een URL in');
      return;
    }

    const validation = validateUrl(url);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setTestingSelector(selector.id);
    setError('');

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
        setError(`Selector fout: ${result.error}`);
        updateSelector(selector.id, 'testResult', {
          success: false,
          error: result.error
        });
      } else if (Array.isArray(result) && result.length === 0) {
        setError('Geen elementen gevonden met deze selector');
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
        setError(''); // Clear error on success
      } else {
        throw new Error('Onverwacht resultaat formaat');
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.');
      } else {
        setError(err.message || 'Test mislukt');
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
    setError('');
    setResults(null);

    const validation = validateUrl(url);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (!validateSelectors()) {
      return;
    }

    setLoading(true);

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
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.');
      } else {
        setError(err.message || 'Er is een fout opgetreden');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-left transition-colors"
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
            CSS selectors zijn patronen om elementen op een pagina te vinden. Bijvoorbeeld: <code className="bg-gray-100 px-1 rounded text-xs">.product-title</code> voor elementen met class "product-title", 
            of <code className="bg-gray-100 px-1 rounded text-xs">h1</code> voor alle H1 headings. Gebruik de templates hieronder of voer je eigen selector in.
          </HelpText>
          
          {selectors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Geen selectors toegevoegd. Voeg een selector toe of gebruik een template.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectors.map((selector) => (
                <div key={selector.id} className="p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-1 mb-1">
                        <label className="text-xs text-gray-600 block">Naam (optioneel)</label>
                        <InfoBadge tooltip="Een beschrijvende naam voor deze selector. Wordt gebruikt in de resultaten." />
                      </div>
                      <Input
                        type="text"
                        placeholder="Bijv: Productnamen"
                        value={selector.name}
                        onChange={(e) => updateSelector(selector.id, 'name', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="md:col-span-7">
                      <div className="flex items-center gap-1 mb-1">
                        <label className="text-xs text-gray-600 block">CSS Selector</label>
                        <InfoBadge tooltip="CSS selector patroon. Bijvoorbeeld: .class, #id, element, element.class, etc." />
                      </div>
                      <Input
                        type="text"
                        placeholder="Bijv: .product-title, h2.product"
                        value={selector.selector}
                        onChange={(e) => updateSelector(selector.id, 'selector', e.target.value)}
                        className="text-sm font-mono"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => testSelector(selector)}
                        disabled={loading || testingSelector === selector.id || !url.trim()}
                        className="h-9 w-9"
                        title="Test selector"
                      >
                        {testingSelector === selector.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeSelector(selector.id)}
                        disabled={loading}
                        className="h-9 w-9 text-red-600 hover:text-red-700"
                        title="Verwijder selector"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {selector.testResult && (
                    <div className={`mt-2 p-2 rounded text-xs flex items-center gap-2 ${
                      selector.testResult.success 
                        ? 'bg-green-50 text-green-900 border border-green-200' 
                        : 'bg-red-50 text-red-900 border border-red-200'
                    }`}>
                      {selector.testResult.success ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>{selector.testResult.count} element(en) gevonden</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>{selector.testResult.error || 'Test mislukt'}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
      {results && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Resultaten</CardTitle>
            <CardDescription>{Object.keys(results).length} selector(s) uitgevoerd</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {Object.entries(results).map(([key, value]) => (
                <div key={key} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{key}</h4>
                    {Array.isArray(value) && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {value.length} element(en)
                      </span>
                    )}
                  </div>
                  {value.error ? (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Fout: {value.error}
                    </div>
                  ) : Array.isArray(value) && value.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {value.map((item, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                          {/* Image display */}
                          {item.src && (
                            <div className="mb-2">
                              <img 
                                src={item.src} 
                                alt={item.alt || 'Image'} 
                                className="max-w-xs max-h-48 rounded border border-gray-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Text content */}
                          {item.text && (
                            <div className="font-medium text-gray-900">{item.text}</div>
                          )}
                          
                          {/* Link display */}
                          {item.href && (
                            <div>
                              <a 
                                href={item.href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline break-all text-sm"
                              >
                                {item.href}
                              </a>
                            </div>
                          )}
                          
                          {/* Meta tag display */}
                          {(item.name || item.property) && item.content && (
                            <div className="text-sm">
                              <strong>{item.name || item.property || 'Meta'}:</strong> {item.content}
                            </div>
                          )}
                          {item.charset && (
                            <div className="text-sm">
                              <strong>Charset:</strong> {item.charset}
                            </div>
                          )}
                          
                          {/* Image src if no image displayed */}
                          {item.src && !item.text && (
                            <div className="text-sm text-gray-600 break-all">
                              <strong>Src:</strong> {item.src}
                            </div>
                          )}
                          
                          {/* Alt text for images */}
                          {item.alt && item.src && (
                            <div className="text-sm text-gray-600">
                              <strong>Alt:</strong> {item.alt}
                            </div>
                          )}
                          
                          {/* HTML preview (only if not image) */}
                          {item.html && !item.src && (
                            <div className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded mt-1 line-clamp-3">
                              {item.html}
                            </div>
                          )}
                          
                          {/* Attributes */}
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              <strong>Attributen:</strong> {Object.entries(item.attributes).slice(0, 5).map(([k, v]) => `${k}="${String(v).substring(0, 50)}"`).join(', ')}
                              {Object.keys(item.attributes).length > 5 && ` ... (+${Object.keys(item.attributes).length - 5} meer)`}
                            </div>
                          )}
                          
                          {/* Tag name */}
                          {item.tagName && (
                            <div className="text-xs text-gray-400">
                              Tag: {item.tagName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Geen elementen gevonden</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

