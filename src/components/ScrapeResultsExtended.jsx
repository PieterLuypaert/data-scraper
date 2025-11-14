import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check, Download, FileJson, FileSpreadsheet, Globe, Mail, Phone, Link as LinkIcon, Image, Video, FileText, Code, BarChart3, TrendingUp, Languages, ShoppingCart, Rss, MapPin } from 'lucide-react';
import { copyToClipboard } from '@/utils/clipboard';
import { exportToJSON, exportToCSV } from '@/utils/export';
import { SearchAndFilter } from './SearchAndFilter';

export function ScrapeResultsExtended({ data }) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    showLinks: true,
    showImages: true,
    showText: true,
    showMeta: true,
    showHeadings: true,
    showTables: true,
    showForms: true,
    showVideos: true,
    showScripts: true,
  });
  const [sortBy, setSortBy] = useState('none');
  const [expandedSections, setExpandedSections] = useState({});

  if (!data) return null;

  // Check if this is custom selector results
  const isCustomResults = data.customResults && !data.title?.includes('Custom Selector');

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const matchesSearch = (text) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return String(text || '').toLowerCase().includes(query);
  };

  const highlightText = (text) => {
    if (!searchQuery || !text) return String(text || '');
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return String(text).replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(data, `scrape-detailed-${Date.now()}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(data, `scrape-detailed-${Date.now()}`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Custom Selector Results View
  if (data.customResults) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4 mt-4">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Custom Selector Resultaten</h2>
            {data.url && (
              <p className="text-sm text-gray-600 mt-1">
                URL: <a href={data.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{data.url}</a>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              {copied ? <><Check className="mr-2 h-4 w-4" />Gekopieerd!</> : <><Copy className="mr-2 h-4 w-4" />Kopieer</>}
            </Button>
            <Button onClick={handleExportJSON} variant="outline" size="sm">
              <FileJson className="mr-2 h-4 w-4" />JSON
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />CSV
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(data.customResults).map(([key, value]) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{key}</CardTitle>
                {Array.isArray(value) && (
                  <CardDescription>{value.length} element(en) gevonden</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {value.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>Fout: {value.error}</AlertDescription>
                  </Alert>
                ) : Array.isArray(value) && value.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {value.map((item, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                        {item.text && (
                          <div className="font-medium text-gray-900 mb-2">{item.text}</div>
                        )}
                        {item.html && (
                          <div className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded mb-2 line-clamp-3">
                            {item.html}
                          </div>
                        )}
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <div className="text-xs text-gray-500">
                            <strong>Attributen:</strong> {Object.entries(item.attributes).map(([k, v]) => `${k}="${v}"`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Geen elementen gevonden</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 mt-4">
      {/* Header with Export Actions */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gedetailleerde Scraped Data</h2>
          {data.statistics && (
            <p className="text-sm text-gray-600 mt-1">
              {data.statistics.totalLinks} links • {data.statistics.totalImages} afbeeldingen • {data.statistics.totalHeadings} headings
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? <><Check className="mr-2 h-4 w-4" />Gekopieerd!</> : <><Copy className="mr-2 h-4 w-4" />Kopieer</>}
          </Button>
          <Button onClick={handleExportJSON} variant="outline" size="sm">
            <FileJson className="mr-2 h-4 w-4" />JSON
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />CSV
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        onSort={setSortBy}
        initialFilters={filters}
      />

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-4 w-4" />
            Basis Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div>
            <div className="text-xs text-gray-600 mb-1">Titel</div>
            <div className="text-sm font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText(data.title) }} />
          </div>
          {data.description && (
            <div>
              <div className="text-xs text-gray-600 mb-1">Beschrijving</div>
              <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText(data.description) }} />
            </div>
          )}
          <div>
            <div className="text-xs text-gray-600 mb-1">URL</div>
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-900 hover:underline break-all" dangerouslySetInnerHTML={{ __html: highlightText(data.url) }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-200">
            {data.lang && (
              <div>
                <div className="text-xs text-gray-600">Taal</div>
                <div className="text-sm font-medium text-gray-900">{data.lang}</div>
              </div>
            )}
            {data.charset && (
              <div>
                <div className="text-xs text-gray-600">Charset</div>
                <div className="text-sm font-medium text-gray-900">{data.charset}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {data.statistics && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-4 w-4" />
              Statistieken
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(data.statistics).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment Analysis */}
      {data.sentiment && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4" />
              Sentiment Analyse
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className={`px-4 py-3 rounded-lg text-center ${
                data.sentiment.sentiment === 'positive' ? 'bg-green-100 text-green-900' :
                data.sentiment.sentiment === 'negative' ? 'bg-red-100 text-red-900' :
                'bg-gray-100 text-gray-900'
              }`}>
                <div className="text-sm font-medium mb-1">
                  {data.sentiment.sentiment === 'positive' ? 'Positief' :
                   data.sentiment.sentiment === 'negative' ? 'Negatief' :
                   'Neutraal'}
                </div>
                <div className="text-2xl font-bold">{data.sentiment.score}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-green-50 rounded border border-green-200 text-center">
                  <div className="text-xs text-gray-600">Positieve Woorden</div>
                  <div className="text-lg font-bold text-gray-900">{data.sentiment.positive}</div>
                </div>
                <div className="p-2 bg-red-50 rounded border border-red-200 text-center">
                  <div className="text-xs text-gray-600">Negatieve Woorden</div>
                  <div className="text-lg font-bold text-gray-900">{data.sentiment.negative}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Detection */}
      {data.languageDetection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-4 w-4" />
              Taal Detectie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{data.languageDetection.language}</div>
              <div className="text-sm text-gray-600">Code: {data.languageDetection.code}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-900 h-2 rounded-full" 
                  style={{ width: `${data.languageDetection.confidence}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">Vertrouwen: {data.languageDetection.confidence}%</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Type */}
      {data.contentType && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4" />
              Content Type
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900">{data.contentType.primaryType}</div>
              <div className="flex flex-wrap gap-2">
                {data.contentType.isBlog && <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded text-xs">Blog</span>}
                {data.contentType.isNews && <span className="px-2 py-1 bg-purple-100 text-purple-900 rounded text-xs">News</span>}
                {data.contentType.isEcommerce && <span className="px-2 py-1 bg-green-100 text-green-900 rounded text-xs">E-commerce</span>}
                {data.contentType.isPortfolio && <span className="px-2 py-1 bg-yellow-100 text-yellow-900 rounded text-xs">Portfolio</span>}
                {data.contentType.isCorporate && <span className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs">Corporate</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {data.contactInfo && (data.contactInfo.emails?.length > 0 || data.contactInfo.phoneNumbers?.length > 0 || Object.keys(data.contactInfo.socialMedia || {}).length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-4 w-4" />
              Contact Informatie
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.contactInfo.emails && data.contactInfo.emails.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email ({data.contactInfo.emails.length})
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {data.contactInfo.emails.map((email, i) => (
                      <a key={i} href={`mailto:${email}`} className="block text-sm text-gray-900 hover:underline break-all">
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {data.contactInfo.phoneNumbers && data.contactInfo.phoneNumbers.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Telefoon ({data.contactInfo.phoneNumbers.length})
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {data.contactInfo.phoneNumbers.map((phone, i) => (
                      <a key={i} href={`tel:${phone}`} className="block text-sm text-gray-900 hover:underline">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {data.contactInfo.socialMedia && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-2">Social Media Links</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {data.contactInfo.socialMedia.facebook?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">Facebook:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.facebook.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.twitter?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">Twitter:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.twitter.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.linkedin?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">LinkedIn:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.linkedin.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.instagram?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">Instagram:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.instagram.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.youtube?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">YouTube:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.youtube.length} links</span>
                    </div>
                  )}
                  {data.contactInfo.socialMedia.github?.length > 0 && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <strong className="text-sm">GitHub:</strong> <span className="text-sm text-gray-700">{data.contactInfo.socialMedia.github.length} links</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* E-commerce Data */}
      {data.ecommerce && data.ecommerce.prices && data.ecommerce.prices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-4 w-4" />
              E-commerce Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900">{data.ecommerce.priceCount} Prijzen</div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {data.ecommerce.prices.map((price, i) => (
                  <span key={i} className="px-2 py-1 bg-green-100 text-green-900 rounded text-sm font-medium">
                    {price}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RSS & Sitemap */}
      {(data.rssFeeds?.length > 0 || data.sitemaps?.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rss className="h-4 w-4" />
              RSS Feeds & Sitemaps
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.rssFeeds && data.rssFeeds.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">RSS Feeds ({data.rssFeeds.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {data.rssFeeds.map((feed, i) => (
                    <a key={i} href={feed} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-900 hover:underline break-all">
                      {feed}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {data.sitemaps && data.sitemaps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Sitemaps ({data.sitemaps.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {data.sitemaps.map((sitemap, i) => (
                    <a key={i} href={sitemap} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-900 hover:underline break-all">
                      {sitemap}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Analysis */}
      {data.contentAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Content Analyse</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Woorden</div>
                  <div className="text-lg font-bold text-gray-900">{data.contentAnalysis.wordCount}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Karakters</div>
                  <div className="text-lg font-bold text-gray-900">{data.contentAnalysis.characterCount}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Zinnen</div>
                  <div className="text-lg font-bold text-gray-900">{data.contentAnalysis.readability?.sentences || 0}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Lees Tijd</div>
                  <div className="text-lg font-bold text-gray-900">{data.contentAnalysis.readability?.estimatedReadingTime || 0} min</div>
                </div>
              </div>
              {data.contentAnalysis.mostCommonWords && data.contentAnalysis.mostCommonWords.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2">Meest Voorkomende Woorden ({data.contentAnalysis.mostCommonWords.length})</div>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {data.contentAnalysis.mostCommonWords.map((item, i) => (
                      <div key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        <span className="font-medium text-gray-900">{item.word}</span>
                        <span className="text-gray-600 ml-1">({item.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta Tags */}
      {filters.showMeta && Object.keys(data.metaTags || {}).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Meta Tags ({Object.keys(data.metaTags).length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {Object.entries(data.metaTags).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <strong className="text-xs text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText(key) }} />: 
                  <span className="text-xs text-gray-700 ml-2" dangerouslySetInnerHTML={{ __html: highlightText(value) }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Open Graph Tags */}
      {filters.showMeta && Object.keys(data.openGraphTags || {}).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Open Graph Tags ({Object.keys(data.openGraphTags).length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {Object.entries(data.openGraphTags).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <strong className="text-xs text-gray-900">{key}</strong>: <span className="text-xs text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Twitter Tags */}
      {filters.showMeta && Object.keys(data.twitterTags || {}).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Twitter Tags ({Object.keys(data.twitterTags).length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {Object.entries(data.twitterTags).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <strong className="text-xs text-gray-900">{key}</strong>: <span className="text-xs text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schema/JSON-LD */}
      {data.schemaTags && data.schemaTags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Structured Data (JSON-LD) ({data.schemaTags.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(data.schemaTags, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Headings */}
      {filters.showHeadings && data.headings && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Headings</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(tag => {
                const headings = data.headings[tag] || [];
                if (headings.length === 0) return null;
                return (
                  <div key={tag} className="mb-2">
                    <h4 className="text-sm font-semibold mb-1.5 text-gray-900">{tag.toUpperCase()} ({headings.length})</h4>
                    <ul className="space-y-1">
                      {headings.map((h, i) => (
                        <li key={i} className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText(typeof h === 'string' ? h : h.text) }} />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paragraphs */}
      {filters.showText && data.paragraphs && data.paragraphs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Paragrafen ({data.paragraphs.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.paragraphs.map((p, i) => (
                <p key={i} className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText(typeof p === 'string' ? p : p.text) }} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lists */}
      {filters.showText && data.lists && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lijsten</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.lists.unordered && data.lists.unordered.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Unordered Lists ({data.lists.unordered.length})</h4>
                {data.lists.unordered.map((list, i) => (
                  <div key={i} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <ul className="list-disc list-inside space-y-1">
                      {list.items.map((item, j) => (
                        <li key={j} className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText(typeof item === 'string' ? item : item.text) }} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {data.lists.ordered && data.lists.ordered.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Ordered Lists ({data.lists.ordered.length})</h4>
                {data.lists.ordered.map((list, i) => (
                  <div key={i} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <ol className="list-decimal list-inside space-y-1">
                      {list.items.map((item, j) => (
                        <li key={j} className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText(typeof item === 'string' ? item : item.text) }} />
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tables */}
      {filters.showTables && data.tables && data.tables.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tabellen ({data.tables.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.tables.map((table, i) => (
                <div key={i} className="border border-gray-200 rounded overflow-hidden">
                  {table.caption && <div className="bg-gray-100 p-2 font-semibold text-sm">{table.caption}</div>}
                  <table className="w-full text-sm">
                    {table.headers.length > 0 && (
                      <thead className="bg-gray-50">
                        <tr>
                          {table.headers.map((header, j) => (
                            <th key={j} className="p-2 text-left border-b border-gray-200">{header}</th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {table.rows.map((row, j) => (
                        <tr key={j} className="border-b border-gray-200">
                          {row.map((cell, k) => (
                            <td key={k} className="p-2" dangerouslySetInnerHTML={{ __html: highlightText(cell) }} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {filters.showLinks && data.links && data.links.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LinkIcon className="h-4 w-4" />
              Links ({data.links.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {data.links.map((link, i) => (
                <a 
                  key={i} 
                  href={typeof link === 'string' ? link : link.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-sm text-gray-900 line-clamp-1" dangerouslySetInnerHTML={{ __html: highlightText(typeof link === 'string' ? link : (link.text || link.href)) }} />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {filters.showImages && data.images && data.images.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="h-4 w-4" />
              Afbeeldingen ({data.images.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
              {data.images.map((img, i) => (
                <div key={i} className="space-y-2">
                  <div className="relative aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden">
                    <img 
                      src={typeof img === 'string' ? img : img.src} 
                      alt={typeof img === 'string' ? '' : img.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                  {(typeof img === 'object' && img.alt) && (
                    <div className="text-xs text-gray-600 line-clamp-2">{img.alt}</div>
                  )}
                  <a 
                    href={typeof img === 'string' ? img : img.src} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block text-xs text-gray-900 hover:underline break-all"
                  >
                    {typeof img === 'string' ? img : img.src}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Videos */}
      {filters.showVideos && data.videos && data.videos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-4 w-4" />
              Video's ({data.videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.videos.map((video, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="space-y-1 text-sm">
                    {video.src && <div><strong>Src:</strong> <a href={video.src} target="_blank" className="text-gray-900 hover:underline break-all">{video.src}</a></div>}
                    {video.poster && <div><strong>Poster:</strong> <a href={video.poster} target="_blank" className="text-gray-900 hover:underline break-all">{video.poster}</a></div>}
                    {video.width && <div><strong>Width:</strong> {video.width}</div>}
                    {video.height && <div><strong>Height:</strong> {video.height}</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forms */}
      {filters.showForms && data.forms && data.forms.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Forms ({data.forms.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.forms.map((form, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="mb-3">
                    <strong className="text-sm">Action:</strong> {form.action || 'N/A'} | <strong className="text-sm">Method:</strong> {form.method || 'get'}
                  </div>
                  {form.inputs.length > 0 && <div className="mb-2 text-sm"><strong>Inputs:</strong> {form.inputs.length}</div>}
                  {form.selects.length > 0 && <div className="mb-2 text-sm"><strong>Selects:</strong> {form.selects.length}</div>}
                  {form.textareas.length > 0 && <div className="mb-2 text-sm"><strong>Textareas:</strong> {form.textareas.length}</div>}
                  {form.buttons.length > 0 && <div className="text-sm"><strong>Buttons:</strong> {form.buttons.length}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scripts */}
      {filters.showScripts && data.scripts && data.scripts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-4 w-4" />
              Scripts ({data.scripts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
              {data.scripts.map((script, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200">
                  {script.src ? (
                    <div><strong>External:</strong> <a href={script.src} target="_blank" className="text-gray-900 hover:underline break-all">{script.src}</a></div>
                  ) : (
                    <div><strong>Inline:</strong> {script.contentLength} characters</div>
                  )}
                  {script.type && <div className="text-xs text-gray-600 mt-1">Type: {script.type}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Text */}
      {filters.showText && data.fullText && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Volledige Tekst</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <pre className="bg-gray-50 border border-gray-200 p-3 rounded overflow-auto max-h-96 text-sm text-gray-900 whitespace-pre-wrap">
              {data.fullText}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Raw JSON */}
      <Card>
        <CardHeader className="pb-3">
          <Button 
            variant="ghost" 
            onClick={() => toggleSection('details')}
            className="w-full justify-between p-0 h-auto"
          >
            <CardTitle className="text-lg">Raw JSON</CardTitle>
            <span className="text-sm text-gray-600">
              {expandedSections.details ? 'Verberg' : 'Toon'} Details
            </span>
          </Button>
        </CardHeader>
        {expandedSections.details && (
          <CardContent className="pt-0">
            <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
