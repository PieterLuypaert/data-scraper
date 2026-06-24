import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ResultsView({ results }) {
  return (
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
  );
}
