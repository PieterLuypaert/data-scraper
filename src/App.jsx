import { useState, useEffect } from "react";
import { ScrapeResultsExtended } from "@/components/features/results";
import { Sidebar } from "./components/layout/Sidebar";
import { ContentRouter } from "./components/layout/ContentRouter";
import { Menu } from "lucide-react";

function App() {
  const [scrapedData, setScrapedData] = useState(null);
  const [crawlData, setCrawlData] = useState(null); // Store full crawl data with all pages
  const [activeTab, setActiveTab] = useState("scrape");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebar_collapsed") === "true"
  );
  const [expandedGroups, setExpandedGroups] = useState({
    collect: true,
    analyze: true,
    manage: true,
  });
  const [currentUrl, setCurrentUrl] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default
    return localStorage.getItem('app_language') || 'nl';
  });

  // Persist the desktop sidebar collapsed state across sessions.
  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

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

  const selectTab = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };
  const toggleGroup = (key) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

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
        <Sidebar
          activeTab={activeTab}
          onSelectTab={selectTab}
          expandedGroups={expandedGroups}
          onToggleGroup={toggleGroup}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

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
            <ContentRouter
              activeTab={activeTab}
              scrapedData={scrapedData}
              setCrawlData={setCrawlData}
              onScrapeSuccess={handleScrapeSuccess}
              onBulkComplete={handleBulkComplete}
              onSelectHistoryItem={handleSelectHistoryItem}
              onSelectTab={selectTab}
            />

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
