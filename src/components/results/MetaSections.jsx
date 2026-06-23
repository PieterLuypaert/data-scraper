import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function MetaSections({ data, filters, highlightText }) {
  return (
    <>
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
    </>
  );
}
