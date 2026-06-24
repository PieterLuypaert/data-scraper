import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, Image, Video, Code } from 'lucide-react';

export function ContentSections({ data, combinedData, filters, highlightText, crawlData }) {
  return (
    <>
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
      {filters.showLinks && combinedData.links && combinedData.links.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LinkIcon className="h-4 w-4" />
              Links ({combinedData.links.length})
              {crawlData && crawlData.totalPages > 1 && (
                <span className="text-sm font-normal text-gray-500">
                  (van {crawlData.totalPages} pagina's)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {combinedData.links.map((link, i) => (
                <a
                  key={i}
                  href={typeof link === 'string' ? link : link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-sm text-gray-900 line-clamp-1" dangerouslySetInnerHTML={{ __html: highlightText(typeof link === 'string' ? link : (link.text || link.href)) }} />
                  {link._pageNumber && (
                    <div className="text-xs text-gray-500 mt-1">
                      Pagina {link._pageNumber}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {filters.showImages && combinedData.images && combinedData.images.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="h-4 w-4" />
              Afbeeldingen ({combinedData.images.length})
              {crawlData && crawlData.totalPages > 1 && (
                <span className="text-sm font-normal text-gray-500">
                  (van {crawlData.totalPages} pagina's)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
              {combinedData.images.map((img, i) => (
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
                  {img._pageNumber && (
                    <div className="text-xs text-gray-500">
                      Pagina {img._pageNumber}
                    </div>
                  )}
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
                    {video.src && <div><strong>Src:</strong> <a href={video.src} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline break-all">{video.src}</a></div>}
                    {video.poster && <div><strong>Poster:</strong> <a href={video.poster} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline break-all">{video.poster}</a></div>}
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
                    <div><strong>External:</strong> <a href={script.src} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline break-all">{script.src}</a></div>
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
    </>
  );
}
