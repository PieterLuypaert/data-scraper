import { useState } from "react";
import { ScrapeForm } from "./components/ScrapeForm";
import { ScrapeResults } from "./components/ScrapeResults";

function App() {
  const [scrapedData, setScrapedData] = useState(null);

  const handleScrapeSuccess = (data) => {
    setScrapedData(data);
    setTimeout(() => {
      const resultsElement = document.getElementById("results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 md:p-8">
      <div className="container mx-auto py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Web Scraper
          </h1>
        </header>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-8">
          <ScrapeForm onScrapeSuccess={handleScrapeSuccess} />
        </div>

        <div id="results" className="mt-8">
          {scrapedData && <ScrapeResults data={scrapedData} />}
        </div>
      </div>
    </div>
  );
}

export default App;
