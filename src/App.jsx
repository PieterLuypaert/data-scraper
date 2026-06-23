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
import { t } from "./i18n";
import { cn } from "@/lib/utils";
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
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

function App() {
  const [scrapedData, setScrapedData] = useState(null);
  const [crawlData, setCrawlData] = useState(null); // Store full crawl data with all pages
  const [activeTab, setActiveTab] = useState("scrape");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default
    return localStorage.getItem('app_language') || 'nl';
  });

  // Listen for language changes (re-renders so t() picks up the new language)
  useEffect(() => {
    const handleLanguageChange = (e) => {
      setCurrentLanguage(e.detail.language);
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

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

  const navGroups = [
    { key: "collect", ids: ["scrape", "crawl", "custom", "bulk"] },
    { key: "analyze", ids: ["seo", "visualization", "insights", "analytics"] },
    { key: "manage", ids: ["history", "changes", "proxy", "settings"] },
  ];
  const tabById = (id) => tabs.find((tt) => tt.id === id);
  const selectTab = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  // Capabilities shown on the landing (scrape) page so it's visually clear
  // what each part of the app does.
  const featureIds = [
    "crawl",
    "custom",
    "bulk",
    "seo",
    "visualization",
    "insights",
  ];

  const CapabilitiesGrid = () => (
    <div className="mx-auto mt-8 w-full max-w-5xl md:mt-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-200" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {t("app.discoverMore")}
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-200" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {featureIds.map((id) => {
          const tab = tabById(id);
          if (!tab) return null;
          const Icon = tab.icon;
          return (
            <button
              key={id}
              onClick={() => selectTab(id)}
              className="group flex items-start gap-3 rounded-xl border border-gray-200/80 bg-white/70 p-3.5 text-left shadow-soft backdrop-blur transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-elevated"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  <span className="truncate">{tab.getLabel()}</span>
                  <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 -translate-x-1 text-indigo-500 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                  {tab.getTooltip()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const sidebarPanelClass =
    "relative flex flex-col overflow-hidden border-indigo-200/40 bg-white/55 backdrop-blur-2xl";

  const SidebarAmbient = () => (
    <div className="pointer-events-none absolute inset-0 -z-0">
      <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-violet-400/15 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 via-transparent to-violet-50/20" />
    </div>
  );

  const SidebarFooter = () => (
    <div className="relative border-t border-indigo-200/40 bg-white/25 px-6 py-4 text-xs text-gray-400">
      <p className="truncate">Developed by Pieter Luypaert</p>
    </div>
  );

  const SidebarNav = () => (
    <nav className="flex flex-col gap-6">
      {navGroups.map((group) => (
        <div key={group.key}>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-indigo-400/90">
            {t(`tabGroups.${group.key}`)}
          </p>
          <div className="flex flex-col gap-1">
            {group.ids.map((id) => {
              const tab = tabById(id);
              if (!tab) return null;
              const Icon = tab.icon;
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => selectTab(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-white/95 text-indigo-800 shadow-soft ring-1 ring-indigo-200/80"
                      : "text-gray-600 hover:bg-white/55 hover:text-indigo-700 hover:shadow-sm hover:ring-1 hover:ring-indigo-100/70"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100/80 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[17px] w-[17px]",
                        isActive ? "text-white" : "text-current"
                      )}
                    />
                  </span>
                  <span className={cn("truncate", isActive && "font-bold")}>
                    {tab.getLabel()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.45]" />
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background" />
      </div>

      <div className="flex h-screen">
        {/* Sidebar (desktop) */}
        <aside
          className={`sticky top-0 hidden h-screen w-72 flex-shrink-0 border-r lg:flex ${sidebarPanelClass}`}
        >
          {SidebarAmbient()}
          <div className="relative px-6 pt-7 pb-5">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/60 px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </span>
              Web Scraping Studio
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gradient-brand">
              {t("app.title")}
            </h1>
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500">
              {t("app.description")}
            </p>
          </div>
          <div className="relative flex-1 overflow-y-auto pretty-scroll px-3 pb-6">
            {SidebarNav()}
          </div>
          {SidebarFooter()}
        </aside>

        {/* Mobile slide-over sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className={`absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col shadow-elevated animate-fade-in-up ${sidebarPanelClass}`}
            >
              {SidebarAmbient()}
              <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
                <div className="min-w-0">
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/60 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    </span>
                    Web Scraping Studio
                  </div>
                  <h1 className="truncate text-xl font-extrabold tracking-tight text-gradient-brand">
                    {t("app.title")}
                  </h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/70 hover:text-indigo-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative flex-1 overflow-y-auto pretty-scroll px-3 pb-6">
                {SidebarNav()}
              </div>
              {SidebarFooter()}
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-indigo-200/40 bg-background/80 px-4 py-3 backdrop-blur-xl md:px-8 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <main
            className={`mx-auto flex w-full max-w-[1600px] min-h-0 flex-1 flex-col px-4 md:px-8 ${
              activeTab === "scrape" && !scrapedData
                ? "overflow-hidden py-4 md:py-6"
                : "overflow-y-auto pretty-scroll py-6 md:py-8"
            }`}
          >
            <div key={activeTab} className="animate-fade-in-up flex flex-1 flex-col">
            {activeTab === "scrape" && (
              <div className="flex w-full flex-1 flex-col">
                <div className="flex w-full flex-1 flex-col items-center justify-center">
                  <ScrapeForm
                    onScrapeSuccess={(data) => handleScrapeSuccess(data)}
                  />
                  {!scrapedData && CapabilitiesGrid()}
                </div>
              </div>
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

            {/* Results */}
            {scrapedData && (activeTab === "scrape" || activeTab === "custom" || activeTab === "crawl") && (
              <div id="results" className="mt-8">
                <ScrapeResultsExtended data={scrapedData} crawlData={crawlData} />
              </div>
            )}

            {/* Footer (mobile — desktop credit lives in the sidebar) */}
            <footer className="mt-14 flex items-center justify-center gap-2 text-sm text-gray-400 lg:hidden">
              <span className="h-px w-8 bg-gray-200" />
              <p>Developed by Pieter Luypaert</p>
              <span className="h-px w-8 bg-gray-200" />
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
