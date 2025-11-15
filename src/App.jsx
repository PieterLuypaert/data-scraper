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
    { id: "scrape", label: "Scrapen", shortLabel: "Scrapen", icon: Globe },
    { id: "crawl", label: "Crawlen", shortLabel: "Crawlen", icon: Network },
    { id: "custom", label: "Custom Selectors", shortLabel: "Custom", icon: Code },
    { id: "bulk", label: "Bulk Scrapen", shortLabel: "Bulk", icon: FileDown },
    { id: "history", label: "Geschiedenis", shortLabel: "Historie", icon: History },
    { id: "changes", label: "Change Detection", shortLabel: "Changes", icon: GitCompare },
    { id: "seo", label: "SEO Analysis", shortLabel: "SEO", icon: Search },
    { id: "visualization", label: "Data Visualization", shortLabel: "Visual", icon: TrendingUp },
    { id: "analytics", label: "Analytics", shortLabel: "Stats", icon: BarChart3 },
    { id: "proxy", label: "Proxy Management", shortLabel: "Proxy", icon: Server },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 md:p-8">
      <div className="container mx-auto py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Web Scraper
          </h1>
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
                <button
                  key={tab.id}
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
                  // Show summary or first page
                  if (data.pages && data.pages.length > 0) {
                    handleScrapeSuccess(data.pages[0]);
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
        {scrapedData && (activeTab === "scrape" || activeTab === "custom") && (
          <div id="results" className="mt-8">
            <ScrapeResultsExtended data={scrapedData} />
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
