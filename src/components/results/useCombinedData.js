import { useMemo } from 'react';

/**
 * When the result is a multi-page crawl, merge images/links from all pages into
 * a single dataset (tagging each item with its source page). Otherwise returns
 * the original single-page data unchanged.
 */
export function useCombinedData(data, crawlData) {
  return useMemo(() => {
    // Check if this is a crawl result (either via crawlData or data.crawlInfo)
    const isCrawlResult = (crawlData && crawlData.pages && Array.isArray(crawlData.pages) && crawlData.pages.length > 1) ||
                          (data.crawlInfo && data.crawlInfo.totalPages > 1);

    // Check if we have crawl data with multiple pages
    if (isCrawlResult && crawlData && crawlData.pages && Array.isArray(crawlData.pages) && crawlData.pages.length > 1) {
      console.log(`[Crawl] Combining data from ${crawlData.pages.length} pages`);
      console.log(`[Crawl] crawlData:`, crawlData);

      // Combine all images from all pages
      const allImages = [];
      let totalImagesFromPages = 0;
      crawlData.pages.forEach((page, pageIndex) => {
        if (page.images && Array.isArray(page.images)) {
          totalImagesFromPages += page.images.length;
          if (page.images.length > 0) {
            page.images.forEach(img => {
              allImages.push({
                ...img,
                _pageNumber: pageIndex + 1,
                _pageUrl: page.url,
              });
            });
          }
        }
      });

      // Combine all links from all pages
      const allLinks = [];
      let totalLinksFromPages = 0;
      crawlData.pages.forEach((page, pageIndex) => {
        if (page.links && Array.isArray(page.links)) {
          totalLinksFromPages += page.links.length;
          if (page.links.length > 0) {
            page.links.forEach(link => {
              allLinks.push({
                ...link,
                _pageNumber: pageIndex + 1,
                _pageUrl: page.url,
              });
            });
          }
        }
      });

      console.log(`[Crawl] Found ${totalImagesFromPages} total images across pages`);
      console.log(`[Crawl] Combined ${allImages.length} images and ${allLinks.length} links from ${crawlData.pages.length} pages`);

      // Return data with combined arrays
      return {
        ...data,
        images: allImages.length > 0 ? allImages : (data.images || []),
        links: allLinks.length > 0 ? allLinks : (data.links || []),
      };
    } else {
      console.log(`[Crawl] No crawl data or single page. crawlData:`, crawlData);
      console.log(`[Crawl] Using data.images:`, data.images?.length || 0);
    }

    // No crawl data or single page - return original data
    return data;
  }, [data, crawlData]);
}
