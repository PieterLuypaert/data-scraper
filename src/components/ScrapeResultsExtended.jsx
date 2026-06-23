import { useState } from 'react';
import { copyToClipboard } from '@/utils/clipboard';
import { highlightSafe } from '@/lib/utils';
import { exportToJSON, exportToCSV, exportToExcel, exportToPDF } from '@/utils/export';
import { SearchAndFilter } from './SearchAndFilter';
import { useCombinedData } from './results/useCombinedData';
import { CustomResultsView } from './results/CustomResultsView';
import { ResultsHeader } from './results/ResultsHeader';
import { OverviewSections } from './results/OverviewSections';
import { AnalysisSections } from './results/AnalysisSections';
import { MetaSections } from './results/MetaSections';
import { ContentSections } from './results/ContentSections';
import { RawJsonSection } from './results/RawJsonSection';

export function ScrapeResultsExtended({ data, crawlData }) {
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
      alert(err.message);
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(data, `scrape-detailed-${Date.now()}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(data, `scrape-detailed-${Date.now()}`);
    } catch (err) {
      alert(err.message);
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
    } catch (err) {
      alert(err.message);
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
    } catch (err) {
      alert(err.message);
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
