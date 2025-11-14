import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Minus, Edit, CheckCircle, XCircle } from 'lucide-react';
import { compareScrapes, getChangeSummary } from '@/utils/changeDetection';
import { getHistory } from '@/utils/storage';

export function ChangeDetection() {
  const [oldScrapeId, setOldScrapeId] = useState('');
  const [newScrapeId, setNewScrapeId] = useState('');
  const [changes, setChanges] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const history = getHistory();

  const handleCompare = () => {
    setError('');
    setLoading(true);

    try {
      const oldScrape = history.find(h => h.id === oldScrapeId);
      const newScrape = history.find(h => h.id === newScrapeId);

      if (!oldScrape || !newScrape) {
        setError('Beide scrapes moeten geselecteerd zijn');
        setLoading(false);
        return;
      }

      const comparison = compareScrapes(oldScrape.data, newScrape.data);
      setChanges(comparison);
    } catch (err) {
      setError(err.message || 'Er is een fout opgetreden bij het vergelijken');
    } finally {
      setLoading(false);
    }
  };

  if (!history || history.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Je hebt minimaal 2 scrapes nodig om te vergelijken.</p>
        </CardContent>
      </Card>
    );
  }

  const summary = changes ? getChangeSummary(changes) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vergelijk Scrapes</CardTitle>
          <CardDescription>Selecteer twee scrapes om te vergelijken</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Oude Scrape</label>
              <select
                value={oldScrapeId}
                onChange={(e) => setOldScrapeId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
              >
                <option value="">Selecteer scrape...</option>
                {history.map(scrape => (
                  <option key={scrape.id} value={scrape.id}>
                    {scrape.data?.title || scrape.url} - {new Date(scrape.timestamp).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nieuwe Scrape</label>
              <select
                value={newScrapeId}
                onChange={(e) => setNewScrapeId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900"
              >
                <option value="">Selecteer scrape...</option>
                {history.map(scrape => (
                  <option key={scrape.id} value={scrape.id}>
                    {scrape.data?.title || scrape.url} - {new Date(scrape.timestamp).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={handleCompare} disabled={loading || !oldScrapeId || !newScrapeId}>
            {loading ? 'Vergelijken...' : 'Vergelijk'}
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {summary && changes && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Samenvatting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="text-sm text-gray-600">Totaal Wijzigingen</div>
                  <div className="text-2xl font-bold text-gray-900">{summary.totalChanges}</div>
                </div>
                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <div className="text-sm text-gray-600">Toegevoegd</div>
                  <div className="text-2xl font-bold text-green-900">{summary.additions}</div>
                </div>
                <div className="p-4 bg-red-50 rounded border border-red-200">
                  <div className="text-sm text-gray-600">Verwijderd</div>
                  <div className="text-2xl font-bold text-red-900">{summary.removals}</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                  <div className="text-sm text-gray-600">Gewijzigd</div>
                  <div className="text-2xl font-bold text-yellow-900">{summary.modifications}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Added Items */}
          {Object.keys(changes.added).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  Toegevoegd
                </CardTitle>
              </CardHeader>
              <CardContent>
                {changes.added.links && changes.added.links.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Nieuwe Links ({changes.added.links.length})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {changes.added.links.map((link, i) => (
                        <div key={i} className="p-2 bg-green-50 rounded border border-green-200">
                          <a href={typeof link === 'string' ? link : link.href} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline break-all">
                            {typeof link === 'string' ? link : (link.text || link.href)}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {changes.added.images && changes.added.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Nieuwe Afbeeldingen ({changes.added.images.length})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {changes.added.images.map((img, i) => (
                        <div key={i} className="p-2 bg-green-50 rounded border border-green-200">
                          <a href={typeof img === 'string' ? img : img.src} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline break-all text-sm">
                            {typeof img === 'string' ? img : img.src}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Removed Items */}
          {Object.keys(changes.removed).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-red-600" />
                  Verwijderd
                </CardTitle>
              </CardHeader>
              <CardContent>
                {changes.removed.links && changes.removed.links.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Verwijderde Links ({changes.removed.links.length})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {changes.removed.links.map((link, i) => (
                        <div key={i} className="p-2 bg-red-50 rounded border border-red-200">
                          <span className="text-gray-900 line-through break-all">
                            {typeof link === 'string' ? link : (link.text || link.href)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {changes.removed.images && changes.removed.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Verwijderde Afbeeldingen ({changes.removed.images.length})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {changes.removed.images.map((img, i) => (
                        <div key={i} className="p-2 bg-red-50 rounded border border-red-200">
                          <span className="text-gray-900 line-through break-all text-sm">
                            {typeof img === 'string' ? img : img.src}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Modified Items */}
          {Object.keys(changes.modified).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-yellow-600" />
                  Gewijzigd
                </CardTitle>
              </CardHeader>
              <CardContent>
                {changes.modified.title && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Titel</h4>
                    <div className="space-y-2">
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <div className="text-xs text-gray-600 mb-1">Oud:</div>
                        <div className="text-gray-900 line-through">{changes.modified.title.old}</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">Nieuw:</div>
                        <div className="text-gray-900">{changes.modified.title.new}</div>
                      </div>
                    </div>
                  </div>
                )}
                {changes.modified.text && (
                  <div>
                    <h4 className="font-semibold mb-2">Tekst</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Oude Lengte:</div>
                        <div className="text-gray-900">{changes.modified.text.oldLength} karakters</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Nieuwe Lengte:</div>
                        <div className="text-gray-900">{changes.modified.text.newLength} karakters</div>
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Gelijkenis:</div>
                      <div className="text-gray-900">{(changes.modified.text.similarity * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

