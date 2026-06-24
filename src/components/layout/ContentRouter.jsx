import { ScrapeForm } from "@/components/features/scrape";
import { BulkScrapeForm } from "@/components/features/bulk";
import { AnalyticsDashboard, DataVisualization } from "@/components/features/analytics";
import { HistoryManager, ChangeDetection } from "@/components/features/history";
import { CustomSelector } from "@/components/features/custom-selector";
import { CrawlForm } from "@/components/features/crawl";
import { SEOAnalysis } from "@/components/features/seo";
import { ProxyManager } from "@/components/features/proxy";
import { AIInsights } from "@/components/features/insights";
import { LanguageSettings } from "@/components/features/settings";
import { CapabilitiesGrid } from "./CapabilitiesGrid";

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
      {activeTab === "seo" && <SEOAnalysis data={scrapedData} />}
      {activeTab === "visualization" && (
        <DataVisualization scrapedData={scrapedData} />
      )}
      {activeTab === "insights" && <AIInsights data={scrapedData} />}
      {activeTab === "analytics" && <AnalyticsDashboard />}
      {activeTab === "proxy" && <ProxyManager />}
      {activeTab === "settings" && <LanguageSettings />}
    </div>
  );
}
