import { useState, useEffect } from "react";
import { ScrapeForm } from "./components/ScrapeForm";
import { ScrapeResults } from "./components/ScrapeResults";
import { ScrapeResultsExtended } from "./components/ScrapeResultsExtended";
import { BulkScrapeForm } from "./components/BulkScrapeForm";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { HistoryManager } from "./components/HistoryManager";
import { ChangeDetection } from "./components/ChangeDetection";
import { CustomSelector } from "./components/CustomSelector";
import { CrawlForm } from "./components/CrawlForm";
import { SEOAnalysis } from "./components/SEOAnalysis";
import { DataVisualization } from "./components/DataVisualization";
import { ProxyManager } from "./components/ProxyManager";
import { Button } from "./components/ui/button";
import { Tooltip } from "./components/ui/tooltip";
import {
  Globe,
  BarChart3,
  History,
  FileDown,
  GitCompare,
  Code,
  Network,
  Search,
  TrendingUp,
  Server,
} from "lucide-react";

function App() {
  const [scrapedData, setScrapedData] = useState(null);
  const [crawlData, setCrawlData] = useState(null); // Store full crawl data with all pages
  const [activeTab, setActiveTab] = useState("scrape");
  const [currentUrl, setCurrentUrl] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll active tab into view when it changes
  useEffect(() => {
    const activeButton = document.querySelector(`[data-tab-id="${activeTab}"]`);
    if (activeButton) {
      setTimeout(() => {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 100);
    }
  }, [activeTab]);

  const handleScrapeSuccess = (data, url) => {
    setScrapedData(data);
    setCurrentUrl(url || data.url);
    // Only reset crawlData if this is explicitly NOT a crawl result
    // Keep crawlData if it exists and this might be related to a crawl
    if (!data.crawlInfo && (!data.pages || !Array.isArray(data.pages) || data.pages.length <= 1)) {
      setCrawlData(null);
    }
    setTimeout(() => {
      const resultsElement = document.getElementById("results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleBulkComplete = (results) => {
    // Show first successful result or show summary
    const firstSuccess = results.find((r) => r.success);
    if (firstSuccess) {
      setScrapedData(firstSuccess.data);
      setCurrentUrl(firstSuccess.url);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setScrapedData(item.data);
    setCurrentUrl(item.url);
    setActiveTab("scrape");
    setTimeout(() => {
      const resultsElement = document.getElementById("results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const tabs = [
    { 
      id: "scrape", 
      label: "Scrapen", 
      shortLabel: "Scrapen", 
      icon: Globe,
      tooltip: "Scrape een enkele webpagina. Extraheert links, afbeeldingen, tekst en meer."
    },
    { 
      id: "crawl", 
      label: "Crawlen", 
      shortLabel: "Crawlen", 
      icon: Network,
      tooltip: "Crawl een hele website. Volgt automatisch links en scrape meerdere pagina's."
    },
    { 
      id: "custom", 
      label: "Custom Selectors", 
      shortLabel: "Custom", 
      icon: Code,
      tooltip: "Gebruik CSS selectors om specifieke elementen te extraheren. Voor gevorderde gebruikers."
    },
    { 
      id: "bulk", 
      label: "Bulk Scrapen", 
      shortLabel: "Bulk", 
      icon: FileDown,
      tooltip: "Scrape meerdere URLs tegelijk. Handig voor het vergelijken van verschillende sites."
    },
    { 
      id: "history", 
      label: "Geschiedenis", 
      shortLabel: "Historie", 
      icon: History,
      tooltip: "Bekijk en beheer je eerdere scrapes. Exporteer of verwijder items."
    },
    { 
      id: "changes", 
      label: "Change Detection", 
      shortLabel: "Changes", 
      icon: GitCompare,
      tooltip: "Vergelijk twee scrapes en zie wat er is veranderd op een website."
    },
    { 
      id: "seo", 
      label: "SEO Analysis", 
      shortLabel: "SEO", 
      icon: Search,
      tooltip: "Analyseer SEO aspecten van een gescrapede pagina. Vereist eerst een scrape."
    },
    { 
      id: "visualization", 
      label: "Data Visualization", 
      shortLabel: "Visual", 
      icon: TrendingUp,
      tooltip: "Visualiseer scraped data met grafieken en diagrammen. Vereist eerst een scrape."
    },
    { 
      id: "analytics", 
      label: "Analytics", 
      shortLabel: "Stats", 
      icon: BarChart3,
      tooltip: "Bekijk statistieken over al je scrapes. Success rates, meest gescrapede sites, etc."
    },
    { 
      id: "proxy", 
      label: "Proxy Management", 
      shortLabel: "Proxy", 
      icon: Server,
      tooltip: "Beheer proxies voor rotatie en anti-bot bypass. Voeg proxies toe en monitor gezondheid."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 md:p-8">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
            Web Scraper
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Scrape websites, extract data, analyseer content en exporteer naar Excel/PDF. 
            Kies een tab hieronder om te beginnen.
          </p>
        </header>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
          <div 
            className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tooltip key={tab.id} content={tab.tooltip} position="bottom">
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Scroll active tab into view
                      const button = document.querySelector(`[data-tab-id="${tab.id}"]`);
                      if (button) {
                        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }
                    }}
                    data-tab-id={tab.id}
                    title={tab.label}
                    className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-2 sm:px-3 md:px-4 lg:px-5 py-3 md:py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-gray-900 border-b-2 border-gray-900 bg-gray-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <span className="hidden sm:inline text-xs md:text-sm lg:text-base">
                      {isLargeScreen ? tab.label : (tab.shortLabel || tab.label)}
                    </span>
                  </button>
                </Tooltip>
              );
            })}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === "scrape" && (
              <ScrapeForm
                onScrapeSuccess={(data) => handleScrapeSuccess(data)}
              />
            )}
            {activeTab === "crawl" && (
              <CrawlForm
                onCrawlSuccess={(data) => {
                  // Store full crawl data with all pages for export
                  setCrawlData(data);
                  // Show summary or first page for display
                  if (data.pages && data.pages.length > 0) {
                    // Merge crawl summary statistics into first page data for display
                    const firstPage = { ...data.pages[0] };
                    if (data.summary) {
                      // Use crawl summary statistics (totals across all pages)
                      firstPage.statistics = {
                        ...firstPage.statistics,
                        // Override with crawl summary totals
                        totalLinks: data.summary.totalLinks || 0,
                        totalImages: data.summary.totalImages || 0,
                        totalHeadings: data.summary.totalHeadings || 0,
                        totalParagraphs: data.summary.totalParagraphs || 0,
                        totalTables: data.summary.totalTables || 0,
                        totalForms: data.summary.totalForms || 0,
                        totalButtons: data.summary.totalButtons || 0,
                        totalVideos: data.summary.totalVideos || 0,
                        totalScripts: data.summary.totalScripts || 0,
                        totalStylesheets: data.summary.totalStylesheets || 0,
                        // Keep other statistics from first page if not in summary
                        totalAudios: firstPage.statistics?.totalAudios || 0,
                        totalIframes: firstPage.statistics?.totalIframes || 0,
                        totalSVGs: firstPage.statistics?.totalSVGs || 0,
                        totalCanvases: firstPage.statistics?.totalCanvases || 0,
                        totalDataAttributes: firstPage.statistics?.totalDataAttributes || 0,
                        totalComments: firstPage.statistics?.totalComments || 0,
                      };
                      // Add crawl info
                      firstPage.crawlInfo = {
                        totalPages: data.totalPages,
                        startUrl: data.startUrl,
                      };
                    }
                    handleScrapeSuccess(firstPage);
                  } else {
                    handleScrapeSuccess(data);
                  }
                }}
              />
            )}
            {activeTab === "custom" && (
              <CustomSelector
                onScrapeSuccess={(data, url) => {
                  handleScrapeSuccess(data, url);
                }}
              />
            )}
            {activeTab === "bulk" && (
              <BulkScrapeForm onScrapeComplete={handleBulkComplete} />
            )}
            {activeTab === "history" && (
              <HistoryManager onSelectHistoryItem={handleSelectHistoryItem} />
            )}
            {activeTab === "changes" && <ChangeDetection />}
            {activeTab === "seo" && <SEOAnalysis data={scrapedData} />}
            {activeTab === "visualization" && (
              <DataVisualization scrapedData={scrapedData} />
            )}
            {activeTab === "analytics" && <AnalyticsDashboard />}
            {activeTab === "proxy" && <ProxyManager />}
          </div>
        </div>

        {/* Results */}
        {scrapedData && (activeTab === "scrape" || activeTab === "custom" || activeTab === "crawl") && (
          <div id="results" className="mt-8">
            <ScrapeResultsExtended data={scrapedData} crawlData={crawlData} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>Developed by Pieter Luypaert</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
