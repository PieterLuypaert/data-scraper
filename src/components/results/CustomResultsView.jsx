import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tooltip } from '../ui/tooltip';
import { Alert, AlertDescription } from '../ui/alert';
import { Copy, Check, FileJson, FileSpreadsheet, FileText as FileTextIcon } from 'lucide-react';

export function CustomResultsView({
  data,
  crawlData,
  copied,
  onCopy,
  onExportJSON,
  onExportCSV,
  onExportExcel,
  onExportPDF,
}) {
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
          <Tooltip content="Kopieer alle data naar clipboard als JSON">
            <Button onClick={onCopy} variant="outline" size="sm">
              {copied ? <><Check className="mr-2 h-4 w-4" />Gekopieerd!</> : <><Copy className="mr-2 h-4 w-4" />Kopieer</>}
            </Button>
          </Tooltip>
          <Tooltip content="Exporteer naar JSON bestand">
            <Button onClick={onExportJSON} variant="outline" size="sm">
              <FileJson className="mr-2 h-4 w-4" />JSON
            </Button>
          </Tooltip>
          <Tooltip content="Exporteer naar CSV bestand">
            <Button onClick={onExportCSV} variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />CSV
            </Button>
          </Tooltip>
          <Tooltip content={crawlData && crawlData.totalPages > 1 ? "Exporteer alle pagina's naar Excel met meerdere sheets" : "Exporteer naar Excel met formatting en meerdere sheets"}>
            <Button onClick={onExportExcel} variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
            </Button>
          </Tooltip>
          <Tooltip content={crawlData && crawlData.totalPages > 1 ? "Exporteer alle pagina's naar PDF rapport" : "Exporteer naar PDF met screenshots en formatting"}>
            <Button onClick={onExportPDF} variant="outline" size="sm">
              <FileTextIcon className="mr-2 h-4 w-4" />PDF
            </Button>
          </Tooltip>
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
