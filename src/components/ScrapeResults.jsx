import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { copyToClipboard } from '@/utils/clipboard';
import { exportToJSON, exportToCSV, exportLinksToCSV, exportImagesToCSV } from '@/utils/export';
import { SearchAndFilter } from './SearchAndFilter';

export function ScrapeResults({ data }) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    showLinks: true,
    showImages: true,
    showText: true,
    showMeta: true,
    showHeadings: true,
  });
  const [sortBy, setSortBy] = useState('none');

  if (!data) return null;

  // Search function
  const matchesSearch = (text) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return text?.toLowerCase().includes(query);
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = { ...data };

    // Filter links
    if (data.links && filters.showLinks) {
      result.links = data.links.filter(
        (link) =>
          matchesSearch(link.text) ||
          matchesSearch(link.href)
      );
    } else if (!filters.showLinks) {
      result.links = [];
    }

    // Filter images
    if (data.images && filters.showImages) {
      result.images = data.images.filter(
        (img) =>
          matchesSearch(img.alt) ||
          matchesSearch(img.src)
      );
    } else if (!filters.showImages) {
      result.images = [];
    }

    // Filter headings
    if (data.headings && filters.showHeadings) {
      result.headings = {
        h1: data.headings.h1?.filter((h) => matchesSearch(h)) || [],
        h2: data.headings.h2?.filter((h) => matchesSearch(h)) || [],
        h3: data.headings.h3?.filter((h) => matchesSearch(h)) || [],
      };
    } else if (!filters.showHeadings) {
      result.headings = { h1: [], h2: [], h3: [] };
    }

    // Filter meta tags
    if (data.metaTags && filters.showMeta) {
      const filteredMeta = {};
      Object.entries(data.metaTags).forEach(([key, value]) => {
        if (matchesSearch(key) || matchesSearch(value)) {
          filteredMeta[key] = value;
        }
      });
      result.metaTags = filteredMeta;
    } else if (!filters.showMeta) {
      result.metaTags = {};
    }

    // Filter text preview
    if (!filters.showText) {
      result.textPreview = '';
    } else if (searchQuery && data.textPreview) {
      // Highlight search results in text
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      result.textPreview = data.textPreview.replace(regex, '<mark>$1</mark>');
    }

    return result;
  }, [data, searchQuery, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    let result = { ...filteredData };

    if (sortBy === 'title-asc') {
      // Already sorted by title
    } else if (sortBy === 'title-desc') {
      // Reverse title order (not applicable for single item)
    } else if (sortBy === 'links-asc' || sortBy === 'links-desc') {
      // Sort links by text
      if (result.links) {
        result.links = [...result.links].sort((a, b) => {
          const aText = (a.text || '').toLowerCase();
          const bText = (b.text || '').toLowerCase();
          return sortBy === 'links-asc'
            ? aText.localeCompare(bText)
            : bText.localeCompare(aText);
        });
      }
    } else if (sortBy === 'images-asc' || sortBy === 'images-desc') {
      // Sort images by alt text
      if (result.images) {
        result.images = [...result.images].sort((a, b) => {
          const aAlt = (a.alt || '').toLowerCase();
          const bAlt = (b.alt || '').toLowerCase();
          return sortBy === 'images-asc'
            ? aAlt.localeCompare(bAlt)
            : bAlt.localeCompare(aAlt);
        });
      }
    }

    return result;
  }, [filteredData, sortBy]);

  const handleCopy = async () => {
    try {
      await copyToClipboard(JSON.stringify(sortedData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(sortedData, `scrape-${Date.now()}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(sortedData, `scrape-${Date.now()}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportLinks = () => {
    if (sortedData.links && sortedData.links.length > 0) {
      try {
        exportLinksToCSV(sortedData.links, `links-${Date.now()}`);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert('Geen links om te exporteren');
    }
  };

  const handleExportImages = () => {
    if (sortedData.images && sortedData.images.length > 0) {
      try {
        exportImagesToCSV(sortedData.images, `images-${Date.now()}`);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert('Geen afbeeldingen om te exporteren');
    }
  };

  const highlightText = (text) => {
    if (!searchQuery || !text) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 mt-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Scraped Data</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Gekopieerd!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Kopieer
              </>
            )}
          </Button>
          <Button onClick={handleExportJSON} variant="outline" size="sm">
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </Button>
          {sortedData.links && sortedData.links.length > 0 && (
            <Button onClick={handleExportLinks} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Links CSV
            </Button>
          )}
          {sortedData.images && sortedData.images.length > 0 && (
            <Button onClick={handleExportImages} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Images CSV
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Component */}
      <SearchAndFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        onSort={setSortBy}
        initialFilters={filters}
      />

      {/* Title - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Titel</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            dangerouslySetInnerHTML={{
              __html: highlightText(sortedData.title || 'Geen titel'),
            }}
          />
        </CardContent>
      </Card>

      {/* URL - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>URL</CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href={sortedData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-gray-600 hover:underline break-all"
            dangerouslySetInnerHTML={{
              __html: highlightText(sortedData.url),
            }}
          />
        </CardContent>
      </Card>

      {/* Meta Tags */}
      {filters.showMeta &&
        Object.keys(sortedData.metaTags || {}).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Meta Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(sortedData.metaTags).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <strong
                      className="text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(key),
                      }}
                    />
                    :{' '}
                    <span
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(value),
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Headings */}
      {filters.showHeadings &&
        (sortedData.headings?.h1?.length > 0 ||
          sortedData.headings?.h2?.length > 0 ||
          sortedData.headings?.h3?.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Headings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedData.headings.h1?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">H1 Headings:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {sortedData.headings.h1.map((h, i) => (
                        <li
                          key={i}
                          dangerouslySetInnerHTML={{
                            __html: highlightText(h),
                          }}
                        />
                      ))}
                    </ul>
                  </div>
                )}
                {sortedData.headings.h2?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">H2 Headings:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {sortedData.headings.h2.map((h, i) => (
                        <li
                          key={i}
                          dangerouslySetInnerHTML={{
                            __html: highlightText(h),
                          }}
                        />
                      ))}
                    </ul>
                  </div>
                )}
                {sortedData.headings.h3?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">H3 Headings:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {sortedData.headings.h3.map((h, i) => (
                        <li
                          key={i}
                          dangerouslySetInnerHTML={{
                            __html: highlightText(h),
                          }}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Links */}
      {filters.showLinks && sortedData.links && sortedData.links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>
              {sortedData.links.length} link(s) gevonden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedData.links.map((link, i) => (
                <div
                  key={i}
                  className="p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-gray-600 hover:underline break-all"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(link.text || link.href),
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {filters.showImages &&
        sortedData.images &&
        sortedData.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Afbeeldingen</CardTitle>
              <CardDescription>
                {sortedData.images.length} afbeelding(en) gevonden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedData.images.map((img, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded border border-gray-200"
                  >
                    <p className="mb-2 text-gray-900">
                      <strong>Alt:</strong>{' '}
                      <span
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(img.alt || 'Geen alt tekst'),
                        }}
                      />
                    </p>
                    <a
                      href={img.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-gray-600 hover:underline break-all text-sm block mb-2"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(img.src),
                      }}
                    />
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="max-w-xs max-h-48 rounded border border-gray-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Text Preview */}
      {filters.showText && sortedData.textPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Tekst Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              className="bg-gray-50 border border-gray-200 p-4 rounded overflow-auto max-h-64 text-sm text-gray-900"
              dangerouslySetInnerHTML={{
                __html: highlightText(sortedData.textPreview),
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Raw JSON - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Raw JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded border border-gray-800 overflow-auto max-h-96 text-sm">
            {JSON.stringify(sortedData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* No results message */}
      {searchQuery &&
        !sortedData.links?.length &&
        !sortedData.images?.length &&
        !Object.keys(sortedData.metaTags || {}).length &&
        !sortedData.headings?.h1?.length &&
        !sortedData.headings?.h2?.length &&
        !sortedData.headings?.h3?.length &&
        !sortedData.textPreview && (
          <Card>
            <CardContent className="p-6 text-center text-gray-600">
              Geen resultaten gevonden voor "{searchQuery}"
            </CardContent>
          </Card>
        )}
    </div>
  );
}
