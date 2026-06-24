import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InfoBadge } from '@/components/ui/tooltip';
import { Trash2, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function SelectorRow({ selector, loading, testingSelector, url, onUpdate, onTest, onRemove }) {
  return (
    <div className="p-4 bg-gray-50 rounded border border-gray-200">
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
            onChange={(e) => onUpdate(selector.id, 'name', e.target.value)}
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
            onChange={(e) => onUpdate(selector.id, 'selector', e.target.value)}
            className="text-sm font-mono"
          />
        </div>
        <div className="md:col-span-1 flex items-end gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onTest(selector)}
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
            onClick={() => onRemove(selector.id)}
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
  );
}
