import { Button } from '../ui/button';
import { Copy, Check, FileJson, FileSpreadsheet, FileText as FileTextIcon } from 'lucide-react';

export function ResultsHeader({
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
    <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {crawlData && crawlData.totalPages > 1 ? `Crawl Resultaten (${crawlData.totalPages} pagina's)` : 'Gedetailleerde Scraped Data'}
        </h2>
        {data.statistics && (
          <p className="text-sm text-gray-600 mt-1">
            {data.statistics.totalLinks} links • {data.statistics.totalImages} afbeeldingen • {data.statistics.totalHeadings} headings
            {crawlData && crawlData.totalPages > 1 && (
              <span className="ml-2 text-xs text-gray-500">
                (totaal over {crawlData.totalPages} pagina's)
              </span>
            )}
          </p>
        )}
        {data.crawlInfo && (
          <p className="text-xs text-gray-500 mt-1">
            Start URL: {data.crawlInfo.startUrl} • {data.crawlInfo.totalPages} pagina's gecrawld
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onCopy} variant="outline" size="sm">
          {copied ? <><Check className="mr-2 h-4 w-4" />Gekopieerd!</> : <><Copy className="mr-2 h-4 w-4" />Kopieer</>}
        </Button>
        <Button onClick={onExportJSON} variant="outline" size="sm">
          <FileJson className="mr-2 h-4 w-4" />JSON
        </Button>
        <Button onClick={onExportCSV} variant="outline" size="sm">
          <FileSpreadsheet className="mr-2 h-4 w-4" />CSV
        </Button>
        <Button onClick={onExportExcel} variant="outline" size="sm">
          <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
        </Button>
        <Button onClick={onExportPDF} variant="outline" size="sm">
          <FileTextIcon className="mr-2 h-4 w-4" />PDF
        </Button>
      </div>
    </div>
  );
}
