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
    <div className="relative min-h-screen bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.45]" />
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            Web Scraping Studio
          </div>
          <div className="mb-4 flex items-center justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gradient-brand md:text-5xl">
              {t("app.title")}
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-gray-500 md:text-base">
            {t("app.description")}
          </p>
        </header>

        {/* Tabs */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 shadow-elevated backdrop-blur-xl">
          <div
            className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-gray-100 bg-gray-50/60 p-2"
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
              const isActive = activeTab === tab.id;
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
                    className={`group flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 md:px-4 ${
                      isActive
                        ? "bg-white text-indigo-700 shadow-soft ring-1 ring-indigo-100"
                        : "text-gray-500 hover:bg-white/70 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 transition-colors md:h-[18px] md:w-[18px] ${
                        isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="hidden text-xs sm:inline md:text-sm">
                      {isLargeScreen ? label : (shortLabel || label)}
                    </span>
                  </button>
                </Tooltip>
              );
            })}
          </div>

          <div key={activeTab} className="animate-fade-in-up p-6 md:p-8">
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
        <footer className="mt-14 flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="h-px w-8 bg-gray-200" />
          <p>Developed by Pieter Luypaert</p>
          <span className="h-px w-8 bg-gray-200" />
        </footer>
      </div>
    </div>
  );
}

export default App;
