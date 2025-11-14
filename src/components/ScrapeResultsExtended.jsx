import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check, Download, FileJson, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 mt-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
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

      {/* Statistics Overview */}
      {data.statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Statistieken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(data.statistics).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basis Informatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Titel:</strong> <span dangerouslySetInnerHTML={{ __html: highlightText(data.title) }} /></div>
          {data.description && <div><strong>Beschrijving:</strong> <span dangerouslySetInnerHTML={{ __html: highlightText(data.description) }} /></div>}
          <div><strong>URL:</strong> <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline break-all" dangerouslySetInnerHTML={{ __html: highlightText(data.url) }} /></div>
          {data.lang && <div><strong>Taal:</strong> {data.lang}</div>}
          {data.charset && <div><strong>Charset:</strong> {data.charset}</div>}
        </CardContent>
      </Card>

      {/* Meta Tags */}
      {filters.showMeta && Object.keys(data.metaTags || {}).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Meta Tags ({Object.keys(data.metaTags).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(data.metaTags).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <strong className="text-gray-900" dangerouslySetInnerHTML={{ __html: highlightText(key) }} />: 
                  <span className="text-gray-700 ml-2" dangerouslySetInnerHTML={{ __html: highlightText(value) }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Open Graph Tags */}
      {filters.showMeta && Object.keys(data.openGraphTags || {}).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Open Graph Tags ({Object.keys(data.openGraphTags).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(data.openGraphTags).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <strong className="text-gray-900">{key}</strong>: <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Twitter Tags */}
      {filters.showMeta && Object.keys(data.twitterTags || {}).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Twitter Tags ({Object.keys(data.twitterTags).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(data.twitterTags).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <strong className="text-gray-900">{key}</strong>: <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schema/JSON-LD */}
      {data.schemaTags && data.schemaTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Structured Data (JSON-LD) ({data.schemaTags.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(data.schemaTags, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Headings - All Levels */}
      {filters.showHeadings && data.headings && (
        <Card>
          <CardHeader>
            <CardTitle>Headings</CardTitle>
          </CardHeader>
          <CardContent>
            {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(tag => {
              const headings = data.headings[tag] || [];
              if (headings.length === 0) return null;
              return (
                <div key={tag} className="mb-4">
                  <h4 className="font-semibold mb-2 text-gray-900">{tag.toUpperCase()} ({headings.length})</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {headings.map((h, i) => (
                      <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText(typeof h === 'string' ? h : h.text) }} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Paragraphs */}
      {filters.showText && data.paragraphs && data.paragraphs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Paragrafen ({data.paragraphs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.paragraphs.map((p, i) => (
                <p key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightText(typeof p === 'string' ? p : p.text) }} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lists */}
      {filters.showText && data.lists && (
        <Card>
          <CardHeader>
            <CardTitle>Lijsten</CardTitle>
          </CardHeader>
          <CardContent>
            {data.lists.unordered && data.lists.unordered.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Unordered Lists ({data.lists.unordered.length})</h4>
                {data.lists.unordered.map((list, i) => (
                  <div key={i} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <ul className="list-disc list-inside space-y-1">
                      {list.items.map((item, j) => (
                        <li key={j} dangerouslySetInnerHTML={{ __html: highlightText(typeof item === 'string' ? item : item.text) }} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {data.lists.ordered && data.lists.ordered.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Ordered Lists ({data.lists.ordered.length})</h4>
                {data.lists.ordered.map((list, i) => (
                  <div key={i} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <ol className="list-decimal list-inside space-y-1">
                      {list.items.map((item, j) => (
                        <li key={j} dangerouslySetInnerHTML={{ __html: highlightText(typeof item === 'string' ? item : item.text) }} />
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
          <CardHeader>
            <CardTitle>Tabellen ({data.tables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.tables.map((table, i) => (
                <div key={i} className="border border-gray-200 rounded overflow-hidden">
                  {table.caption && <div className="bg-gray-100 p-2 font-semibold">{table.caption}</div>}
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
          <CardHeader>
            <CardTitle>Links ({data.links.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.links.map((link, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <a href={link.href || link} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-600 hover:underline break-all" dangerouslySetInnerHTML={{ __html: highlightText(typeof link === 'string' ? link : (link.text || link.href)) }} />
                  {typeof link === 'object' && link.title && <div className="text-xs text-gray-600 mt-1">Title: {link.title}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {filters.showImages && data.images && data.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Afbeeldingen ({data.images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.images.map((img, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="mb-2"><strong>Alt:</strong> <span dangerouslySetInnerHTML={{ __html: highlightText(typeof img === 'string' ? '' : (img.alt || 'Geen alt tekst')) }} /></p>
                  <a href={typeof img === 'string' ? img : img.src} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-600 hover:underline break-all text-sm block mb-2" dangerouslySetInnerHTML={{ __html: highlightText(typeof img === 'string' ? img : img.src) }} />
                  {typeof img === 'object' && img.src && <img src={img.src} alt={img.alt} className="max-w-xs max-h-48 rounded border border-gray-300" onError={(e) => e.target.style.display = 'none'} />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Videos */}
      {filters.showVideos && data.videos && data.videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Video's ({data.videos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
          <CardHeader>
            <CardTitle>Forms ({data.forms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.forms.map((form, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="mb-3">
                    <strong>Action:</strong> {form.action || 'N/A'} | <strong>Method:</strong> {form.method || 'get'}
                  </div>
                  {form.inputs.length > 0 && <div className="mb-2"><strong>Inputs:</strong> {form.inputs.length}</div>}
                  {form.selects.length > 0 && <div className="mb-2"><strong>Selects:</strong> {form.selects.length}</div>}
                  {form.textareas.length > 0 && <div className="mb-2"><strong>Textareas:</strong> {form.textareas.length}</div>}
                  {form.buttons.length > 0 && <div><strong>Buttons:</strong> {form.buttons.length}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scripts */}
      {filters.showScripts && data.scripts && data.scripts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scripts ({data.scripts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {data.scripts.map((script, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200">
                  {script.src ? (
                    <div><strong>External:</strong> <a href={script.src} target="_blank" className="text-gray-900 hover:underline break-all">{script.src}</a></div>
                  ) : (
                    <div><strong>Inline:</strong> {script.contentLength} characters</div>
                  )}
                  {script.type && <div className="text-xs text-gray-600">Type: {script.type}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Element Counts */}
      {data.elementCounts && Object.keys(data.elementCounts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Element Tellen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
              {Object.entries(data.elementCounts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (
                <div key={tag} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <strong className="text-gray-900">{tag}:</strong> <span className="text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Text */}
      {filters.showText && data.fullText && (
        <Card>
          <CardHeader>
            <CardTitle>Volledige Tekst</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 border border-gray-200 p-4 rounded overflow-auto max-h-96 text-sm text-gray-900 whitespace-pre-wrap">
              {data.fullText}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Raw JSON */}
      <Card>
        <CardHeader>
          <CardTitle>Raw JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded border border-gray-800 overflow-auto max-h-96 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

