import { lazy, Suspense } from "react";
import { ScrapeForm } from "@/components/features/scrape";
import { BulkScrapeForm } from "@/components/features/bulk";
import { HistoryManager, ChangeDetection } from "@/components/features/history";
import { CustomSelector } from "@/components/features/custom-selector";
import { CrawlForm } from "@/components/features/crawl";
import { LanguageSettings } from "@/components/features/settings";
import { CapabilitiesGrid } from "./CapabilitiesGrid";

const AnalyticsDashboard = lazy(() =>
  import("@/components/features/analytics").then((m) => ({ default: m.AnalyticsDashboard }))
);
const DataVisualization = lazy(() =>
  import("@/components/features/analytics").then((m) => ({ default: m.DataVisualization }))
);
const SEOAnalysis = lazy(() =>
  import("@/components/features/seo").then((m) => ({ default: m.SEOAnalysis }))
);
const ProxyManager = lazy(() =>
  import("@/components/features/proxy").then((m) => ({ default: m.ProxyManager }))
);
const AIInsights = lazy(() =>
  import("@/components/features/insights").then((m) => ({ default: m.AIInsights }))
);

function TabFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-16 text-sm text-gray-500">
      Laden…
    </div>
  );
}

function LazyTab({ children }) {
  return <Suspense fallback={<TabFallback />}>{children}</Suspense>;
}

/**
 * Renders the feature panel for the active tab. Layout shell (sidebar, top bar,
 * results) lives in App; this component only owns the per-tab switch.
 */
export function ContentRouter({
  activeTab,
  scrapedData,
  setCrawlData,
  onScrapeSuccess,
  onBulkComplete,
  onSelectHistoryItem,
  onSelectTab,
}) {
  return (
    <div key={activeTab} className="animate-fade-in-up flex flex-1 flex-col">
      {activeTab === "scrape" && (
        <div className="flex w-full flex-1 flex-col">
          <div
            className={
              scrapedData
                ? "flex w-full flex-col items-center"
                : "flex w-full flex-1 flex-col items-center justify-center"
            }
          >
            <ScrapeForm
              compact={!!scrapedData}
              onScrapeSuccess={(data) => onScrapeSuccess(data)}
            />
            {!scrapedData && <CapabilitiesGrid onSelectTab={onSelectTab} />}
          </div>
        </div>
      )}
      {activeTab === "crawl" && (
        <CrawlForm
          onCrawlSuccess={(data) => {
            setCrawlData(data);
            if (data.pages && data.pages.length > 0) {
              const firstPage = { ...data.pages[0] };
              if (data.summary) {
                firstPage.statistics = {
                  ...firstPage.statistics,
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
                  totalAudios: firstPage.statistics?.totalAudios || 0,
                  totalIframes: firstPage.statistics?.totalIframes || 0,
                  totalSVGs: firstPage.statistics?.totalSVGs || 0,
                  totalCanvases: firstPage.statistics?.totalCanvases || 0,
                  totalDataAttributes: firstPage.statistics?.totalDataAttributes || 0,
                  totalComments: firstPage.statistics?.totalComments || 0,
                };
                firstPage.crawlInfo = {
                  totalPages: data.totalPages,
                  startUrl: data.startUrl,
                };
              }
              onScrapeSuccess(firstPage);
            } else {
              onScrapeSuccess(data);
            }
          }}
        />
      )}
      {activeTab === "custom" && (
        <CustomSelector
          onScrapeSuccess={(data, url) => {
            onScrapeSuccess(data, url);
          }}
        />
      )}
      {activeTab === "bulk" && (
        <BulkScrapeForm onScrapeComplete={onBulkComplete} />
      )}
      {activeTab === "history" && (
        <HistoryManager onSelectHistoryItem={onSelectHistoryItem} />
      )}
      {activeTab === "changes" && <ChangeDetection />}
      {activeTab === "seo" && (
        <LazyTab>
          <SEOAnalysis data={scrapedData} />
        </LazyTab>
      )}
      {activeTab === "visualization" && (
        <LazyTab>
          <DataVisualization scrapedData={scrapedData} />
        </LazyTab>
      )}
      {activeTab === "insights" && (
        <LazyTab>
          <AIInsights data={scrapedData} />
        </LazyTab>
      )}
      {activeTab === "analytics" && (
        <LazyTab>
          <AnalyticsDashboard />
        </LazyTab>
      )}
      {activeTab === "proxy" && (
        <LazyTab>
          <ProxyManager />
        </LazyTab>
      )}
      {activeTab === "settings" && <LanguageSettings />}
    </div>
  );
}
