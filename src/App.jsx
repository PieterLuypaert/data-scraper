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
import { AIInsights } from "./components/AIInsights";
import { LanguageSettings } from "./components/LanguageSettings";
import { Button } from "./components/ui/button";
import { Tooltip } from "./components/ui/tooltip";
import { t } from "./i18n";
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
  Brain,
  Languages,
} from "lucide-react";

function App() {
  const [scrapedData, setScrapedData] = useState(null);
  const [crawlData, setCrawlData] = useState(null); // Store full crawl data with all pages
  const [activeTab, setActiveTab] = useState("scrape");
  const [currentUrl, setCurrentUrl] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default
    return localStorage.getItem('app_language') || 'nl';
  });

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (e) => {
      setCurrentLanguage(e.detail.language);
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
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

  // Define tabs with translations (will update when language changes)
  const tabs = [
    { 
      id: "scrape", 
      getLabel: () => t("tabs.scrape"), 
      getShortLabel: () => t("tabs.scrape"), 
      icon: Globe,
      getTooltip: () => t("tooltips.scrape")
    },
    { 
      id: "crawl", 
      getLabel: () => t("tabs.crawl"), 
      getShortLabel: () => t("tabs.crawl"), 
      icon: Network,
      getTooltip: () => t("tooltips.crawl")
    },
    { 
      id: "custom", 
      getLabel: () => t("tabs.custom"), 
      getShortLabel: () => t("tabs.custom"), 
      icon: Code,
      getTooltip: () => t("tooltips.custom")
    },
    { 
      id: "bulk", 
      getLabel: () => t("tabs.bulk"), 
      getShortLabel: () => t("tabs.bulk"), 
      icon: FileDown,
      getTooltip: () => t("tooltips.bulk")
    },
    { 
      id: "history", 
      getLabel: () => t("tabs.history"), 
      getShortLabel: () => t("tabs.history"), 
      icon: History,
      getTooltip: () => t("tooltips.history")
    },
    { 
      id: "changes", 
      getLabel: () => t("tabs.changes"), 
      getShortLabel: () => t("tabs.changes"), 
      icon: GitCompare,
      getTooltip: () => t("tooltips.changes")
    },
    { 
      id: "seo", 
      getLabel: () => t("tabs.seo"), 
      getShortLabel: () => t("tabs.seo"), 
      icon: Search,
      getTooltip: () => t("tooltips.seo")
    },
    { 
      id: "visualization", 
      getLabel: () => t("tabs.visualization"), 
      getShortLabel: () => t("tabs.visualization"), 
      icon: TrendingUp,
      getTooltip: () => t("tooltips.visualization")
    },
    { 
      id: "insights", 
      getLabel: () => t("tabs.insights"), 
      getShortLabel: () => t("tabs.insights"), 
      icon: Brain,
      getTooltip: () => t("tooltips.insights")
    },
    { 
      id: "analytics", 
      getLabel: () => t("tabs.analytics"), 
      getShortLabel: () => t("tabs.analytics"), 
      icon: BarChart3,
      getTooltip: () => t("tooltips.analytics")
    },
    { 
      id: "proxy", 
      getLabel: () => t("tabs.proxy"), 
      getShortLabel: () => t("tabs.proxy"), 
      icon: Server,
      getTooltip: () => t("tooltips.proxy")
    },
    { 
      id: "settings", 
      getLabel: () => t("tabs.settings"), 
      getShortLabel: () => t("tabs.settings"), 
      icon: Languages,
      getTooltip: () => t("tooltips.settings")
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 md:p-8">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
            {t("app.title")}
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            {t("app.description")}
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
              const label = tab.getLabel();
              const shortLabel = tab.getShortLabel();
              const tooltip = tab.getTooltip();
              return (
                <Tooltip key={tab.id} content={tooltip} position="bottom">
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
                    title={label}
                    className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-2 sm:px-3 md:px-4 lg:px-5 py-3 md:py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-gray-900 border-b-2 border-gray-900 bg-gray-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <span className="hidden sm:inline text-xs md:text-sm lg:text-base">
                      {isLargeScreen ? label : (shortLabel || label)}
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
            {activeTab === "insights" && <AIInsights data={scrapedData} />}
            {activeTab === "analytics" && <AnalyticsDashboard />}
            {activeTab === "proxy" && <ProxyManager />}
            {activeTab === "settings" && <LanguageSettings />}
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
