import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Camera, Maximize2, Download, X, BarChart3 } from 'lucide-react';

export function OverviewSections({ data, highlightText, showFullScreenshot, setShowFullScreenshot }) {
  return (
    <>
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

      {/* Screenshot */}
      {data.screenshot && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-4 w-4" />
              Screenshot
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={data.screenshot}
                  alt="Page screenshot"
                  className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowFullScreenshot(true)}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullScreenshot(true)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Volledig
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = data.screenshot;
                    link.download = `screenshot-${data.url?.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Screenshot
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Screenshot Modal */}
      {showFullScreenshot && data.screenshot && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullScreenshot(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullScreenshot(false)}
              className="absolute top-4 right-4 bg-white z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={data.screenshot}
              alt="Full page screenshot"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

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
    </>
  );
}
