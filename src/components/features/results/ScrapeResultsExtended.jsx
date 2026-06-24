import { useState } from 'react';
import { copyToClipboard } from '@/utils/clipboard';
import { highlightSafe } from '@/lib/utils';
import { exportToJSON, exportToCSV, exportToExcel, exportToPDF } from '@/utils/export';
import { SearchAndFilter } from './SearchAndFilter';
import { useCombinedData } from './useCombinedData';
import { CustomResultsView } from './CustomResultsView';
import { ResultsHeader } from './ResultsHeader';
import { OverviewSections } from './OverviewSections';
import { AnalysisSections } from './AnalysisSections';
import { MetaSections } from './MetaSections';
import { ContentSections } from './ContentSections';
import { RawJsonSection } from './RawJsonSection';
import { useToast } from '@/components/ui/toast';

export function ScrapeResultsExtended({ data, crawlData }) {
  const { toast } = useToast();
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
  const [showFullScreenshot, setShowFullScreenshot] = useState(false);

  // Combine all images/links from crawl pages if crawlData exists
  const combinedData = useCombinedData(data || {}, crawlData);

  if (!data) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const highlightText = (text) => highlightSafe(text, searchQuery);

  const handleCopy = async () => {
    try {
      await copyToClipboard(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ variant: 'error', title: 'Kopiëren mislukt', description: err.message });
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(data, `scrape-detailed-${Date.now()}`);
      toast({ variant: 'success', title: 'Geëxporteerd', description: 'JSON-bestand gedownload' });
    } catch (err) {
      toast({ variant: 'error', title: 'Export mislukt', description: err.message });
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(data, `scrape-detailed-${Date.now()}`);
      toast({ variant: 'success', title: 'Geëxporteerd', description: 'CSV-bestand gedownload' });
    } catch (err) {
      toast({ variant: 'error', title: 'Export mislukt', description: err.message });
    }
  };

  const handleExportExcel = async () => {
    try {
      // If crawlData exists with pages, export all pages
      if (crawlData && crawlData.pages && crawlData.pages.length > 1) {
        await exportToExcel(crawlData, `crawl-all-pages-${Date.now()}`);
      } else {
        await exportToExcel(data, `scrape-detailed-${Date.now()}`);
      }
      toast({ variant: 'success', title: 'Geëxporteerd', description: 'Excel-bestand gedownload' });
    } catch (err) {
      toast({ variant: 'error', title: 'Export mislukt', description: err.message });
    }
  };

  const handleExportPDF = async () => {
    try {
      // If crawlData exists with pages, export all pages
      if (crawlData && crawlData.pages && crawlData.pages.length > 1) {
        await exportToPDF(crawlData, `crawl-all-pages-${Date.now()}`);
      } else {
        await exportToPDF(data, `scrape-detailed-${Date.now()}`);
      }
      toast({ variant: 'success', title: 'Geëxporteerd', description: 'PDF-bestand gedownload' });
    } catch (err) {
      toast({ variant: 'error', title: 'Export mislukt', description: err.message });
    }
  };

  const exportHandlers = {
    copied,
    onCopy: handleCopy,
    onExportJSON: handleExportJSON,
    onExportCSV: handleExportCSV,
    onExportExcel: handleExportExcel,
    onExportPDF: handleExportPDF,
  };

  // Custom Selector Results View
  if (data.customResults) {
    return <CustomResultsView data={data} crawlData={crawlData} {...exportHandlers} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 mt-4">
      {/* Header with Export Actions */}
      <ResultsHeader data={data} crawlData={crawlData} {...exportHandlers} />

      {/* Search and Filter */}
      <SearchAndFilter
        onSearch={setSearchQuery}
        onFilter={setFilters}
        onSort={setSortBy}
        initialFilters={filters}
      />

      <OverviewSections
        data={data}
        highlightText={highlightText}
        showFullScreenshot={showFullScreenshot}
        setShowFullScreenshot={setShowFullScreenshot}
      />

      <AnalysisSections data={data} />

      <MetaSections data={data} filters={filters} highlightText={highlightText} />

      <ContentSections
        data={data}
        combinedData={combinedData}
        filters={filters}
        highlightText={highlightText}
        crawlData={crawlData}
      />

      <RawJsonSection data={data} expandedSections={expandedSections} toggleSection={toggleSection} />
    </div>
  );
}
