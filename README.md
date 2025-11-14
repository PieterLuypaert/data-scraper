# Web Scraper Applicatie

Een uitgebreide web scraping applicatie met een moderne React frontend en Shadcn UI. Scrape websites grondig en krijg gedetailleerde, gestructureerde data. De applicatie ondersteunt zowel statische websites als JavaScript-heavy sites met automatische detectie en gebruik van Puppeteer.

## Features

- **Grondige Scraping**: Extract alle mogelijke data van websites
- **Website Crawling**: Scrape automatisch alle pagina's van een website door links te volgen
- **JavaScript Support**: Automatische detectie en scraping van JavaScript-heavy sites (bol.com, Amazon, etc.)
- **Custom CSS Selectors**: Specificeer je eigen CSS selectors voor gerichte scraping
- **Bulk Operations**: Scrape meerdere URLs tegelijk, batch export, bulk delete
- **Change Detection**: Vergelijk scrapes om veranderingen te detecten
- **Geschiedenis Management**: Opslaan en beheren van eerdere scrapes
- **Analytics Dashboard**: Statistieken over scraping activiteit
- **Export Functionaliteit**: Export naar JSON en CSV
- **Zoeken & Filteren**: Zoek en filter door gescrapede data
- **Sorteren**: Sorteer resultaten op verschillende criteria
- **Modern UI**: React + Shadcn UI met Tailwind CSS
- **Responsive Design**: Werkt op alle apparaten

## Project Structuur

```text
data-scraper/
├── server.js                    # Main Express server entry point
├── server/
│   ├── config/
│   │   └── index.js            # Configuration (ports, timeouts, etc.)
│   ├── utils/
│   │   ├── helpers.js          # Helper functions (URL conversion, attributes)
│   │   └── compare.js          # Change detection logic
│   ├── scrapers/
│   │   ├── puppeteerScraper.js # Puppeteer scraping for JS-heavy sites
│   │   ├── cheerioScraper.js   # Cheerio/Axios scraping for simple sites
│   │   ├── crawler.js          # Website crawler (follows links)
│   │   ├── dataExtractors.js   # Main data extraction orchestrator
│   │   └── extractors/
│   │       ├── basicExtractors.js      # Basic info, meta tags, headings
│   │       ├── linkExtractor.js       # Links extraction
│   │       ├── imageExtractor.js       # Images extraction
│   │       ├── contentExtractors.js    # Paragraphs, lists, tables, forms
│   │       ├── mediaExtractors.js      # Videos, audio, iframes, scripts
│   │       ├── metaExtractors.js       # Data attributes, classes, IDs
│   │       └── analysisExtractors.js   # Contact info, e-commerce, sentiment
│   └── routes/
│       ├── scrape.js           # Main scrape endpoint handler
│       ├── custom.js           # Custom CSS selector endpoint
│       ├── crawl.js            # Website crawler endpoint
│       └── compare.js          # Change detection endpoint
├── src/
│   ├── api/
│   │   └── scraper.js          # Frontend API calls
│   ├── components/
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── ScrapeForm.jsx      # Single URL scraping form
│   │   ├── CrawlForm.jsx       # Website crawler form
│   │   ├── CustomSelector.jsx  # Custom CSS selector UI
│   │   ├── ScrapeResultsExtended.jsx  # Detailed results display
│   │   ├── BulkScrapeForm.jsx  # Bulk scraping component
│   │   ├── AnalyticsDashboard.jsx  # Analytics dashboard
│   │   ├── HistoryManager.jsx  # History management
│   │   ├── ChangeDetection.jsx  # Change detection UI
│   │   └── SearchAndFilter.jsx  # Search and filter component
│   ├── utils/
│   │   ├── validation.js       # URL validation
│   │   ├── clipboard.js        # Clipboard utilities
│   │   ├── storage.js          # localStorage utilities
│   │   ├── export.js           # Export functionality
│   │   ├── changeDetection.js  # Frontend change detection
│   │   ├── contactExtraction.js  # Contact info extraction
│   │   ├── contentAnalysis.js  # Content analysis utilities
│   │   ├── languageDetection.js  # Language detection
│   │   └── sentimentAnalysis.js  # Sentiment analysis
│   ├── App.jsx                 # Main React component
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── package.json
└── vite.config.js              # Vite configuration
```

## Installatie

1. Installeer de dependencies:

```bash
npm install
```

## Development

Voor development moet je twee terminals gebruiken:

**Terminal 1 - Backend server:**

```bash
npm start
```

Dit start de Express server op `http://localhost:3001`

**Terminal 2 - Frontend dev server:**

```bash
npm run dev:frontend
```

Dit start de Vite dev server op `http://localhost:5173`

Open `http://localhost:5173` in je browser voor development.

## Productie Build

1. Build de React app:

```bash
npm run build
```

1. Start de server in productie mode:

```bash
NODE_ENV=production npm start
```

De server serveert dan zowel de API als de React app op `http://localhost:3001`

## Gebruik

### Normale Scraping

1. Ga naar de "Scrapen" tab
2. Voer een URL in (bijvoorbeeld: `https://example.com`)
3. Klik op "Send" om de website te scrapen
4. Bekijk de gedetailleerde resultaten

De applicatie detecteert automatisch of een site JavaScript-rendering nodig heeft (zoals bol.com, Amazon) en gebruikt dan Puppeteer. Voor simpele sites wordt Cheerio gebruikt.

### Website Crawling

1. Ga naar de "Crawlen" tab
2. Voer een start URL in (bijvoorbeeld: `https://example.com`)
3. Optioneel: pas de crawl opties aan:
   - Max Pagina's: Maximum aantal pagina's om te scrapen (standaard: 50)
   - Max Diepte: Hoe diep te crawlen vanaf start URL (standaard: 3)
   - Vertraging: Wachttijd tussen requests in milliseconden (standaard: 1000ms)
   - Alleen zelfde domein: Alleen links binnen hetzelfde domein volgen
   - Inclusief subdomeinen: Ook subdomeinen toestaan
   - Volg externe links: Ook links naar andere websites volgen
4. Klik op "Start Crawl"
5. De crawler scrapet automatisch alle gevonden pagina's

### Custom CSS Selectors

1. Ga naar de "Custom Selectors" tab
2. Voer een URL in
3. Voeg selectors toe:
   - Gebruik de "Selector Toevoegen" knop om handmatig selectors toe te voegen
   - Of gebruik een template selector (bijvoorbeeld "Afbeeldingen", "Meta Description", "Product Namen")
4. Optioneel: test individuele selectors met de "Test" knop
5. Klik op "Scrape met Selectors" om alle selectors uit te voeren
6. Bekijk de resultaten per selector

### Bulk Scraping

1. Ga naar de "Bulk Scrapen" tab
2. Voeg meerdere URLs toe met de "URL Toevoegen" knop
3. Klik op "Start Bulk Scraping"
4. Bekijk de progress en resultaten per URL
5. Export alle resultaten in bulk

### Change Detection

1. Ga naar de "Change Detection" tab
2. Selecteer een oude scrape uit de geschiedenis
3. Scrape dezelfde URL opnieuw
4. Bekijk de gedetecteerde veranderingen:
   - Toegevoegde links, images, headings
   - Verwijderde elementen
   - Gewijzigde content
   - Statistieken over veranderingen

### Geschiedenis

1. Ga naar de "Geschiedenis" tab
2. Bekijk alle eerdere scrapes
3. Selecteer items voor bulk export of verwijdering
4. Klik op een item om de resultaten te bekijken
5. Gebruik "Bulk Verwijderen" om meerdere items tegelijk te verwijderen

### Analytics

1. Ga naar de "Analytics" tab
2. Bekijk statistieken over je scraping activiteit:
   - Totaal aantal scrapes
   - Succes percentage
   - Meest gescrapede websites
   - Dagelijkse statistieken
   - Tijdlijn van activiteit

## Wat wordt er gescraped?

De applicatie scrapet alle beschikbare data van een website:

### Basis Informatie

- Titel, beschrijving, taal, charset
- Finale URL (na redirects)
- Timestamp van scraping

### Meta Tags

- Alle meta tags (name, property, itemprop, http-equiv)
- Open Graph tags
- Twitter Card tags
- JSON-LD structured data
- Microdata (itemscope/itemprop)

### Content Structuur

- Alle headings (H1-H6) met attributen
- Alle paragrafen met attributen
- Alle lijsten (ul/ol) met items
- Alle tabellen met headers en rijen
- Volledige tekst content

### Media

- Alle afbeeldingen (src, alt, srcset, width, height, loading, etc.)
- Lazy-loaded images (data-src, data-lazy-src, etc.)
- Background images uit CSS
- Alle video's (src, poster, controls, autoplay, etc.)
- Alle audio bestanden
- Alle iframes
- Alle SVG elementen
- Alle canvas elementen
- Favicons

### Interactieve Elementen

- Alle links met details (href, title, rel, target, download, etc.)
- Alle forms met:
  - Inputs (alle types met attributen)
  - Selects met opties
  - Textareas
  - Buttons
- Alle standalone buttons

### Scripts & Styles

- Alle scripts (external en inline)
- Alle stylesheets (external en inline)
- Type en content lengte

### Data & Attributen

- Alle data-\* attributen
- Alle classes (unieke lijst)
- Alle IDs (unieke lijst)
- Alle HTML comments

### Geavanceerde Extractie

- **Contact Informatie**: Emails, telefoonnummers, social media links
- **E-commerce Data**: Productnamen, prijzen, beschrijvingen
- **RSS & Sitemaps**: Detectie van RSS feeds en sitemaps
- **Taal Detectie**: Automatische detectie van content taal
- **Content Type**: Detectie van blog, news, e-commerce, portfolio, corporate
- **Content Analyse**: Meest voorkomende woorden, leesbaarheid, woordtelling
- **Sentiment Analyse**: Positief/negatief/neutraal sentiment detectie

### Statistieken

- Totaal aantal van elk element type
- Overzicht van alle elementen op de pagina
- Element counts per type

## Export Functionaliteit

### Beschikbare Export Opties

- **JSON Export**: Export volledige data als JSON
- **CSV Export**: Export volledige data als CSV
- **Links CSV**: Export alleen links als CSV
- **Images CSV**: Export alleen afbeeldingen als CSV
- **Batch Export**: Export meerdere scrapes tegelijk (JSON/CSV)

### Export Gebruik

1. In de resultaten: gebruik de export knoppen bovenaan
2. In geschiedenis: selecteer items en gebruik "Export JSON" of "Export CSV"

## Zoeken & Filteren

### Zoeken

- Zoek in alle gescrapede data
- Zoekresultaten worden gehighlight
- Real-time zoeken tijdens het typen

### Filteren

- Filter op type: Links, Afbeeldingen, Tekst, Meta Tags, Headings, Tabellen, Forms, Video's, Scripts
- Elke sectie kan individueel worden getoond/verborgen
- Reset filters knop

### Sorteren

- Titel A-Z / Z-A
- Meeste/Minste links
- Meeste/Minste afbeeldingen
- Datum (nieuwste/oudste)

## Technologie

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Scraping**:
  - Cheerio voor HTML parsing (statische sites)
  - Puppeteer voor JavaScript-rendering (dynamische sites)
  - Axios voor HTTP requests
- **Analyse**: Natural, Compromise, Sentiment libraries

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite 7
- **UI Library**: Shadcn UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: localStorage voor geschiedenis en analytics

## Code Organisatie

De code is modulair georganiseerd voor onderhoudbaarheid:

### Backend Structuur

#### Configuratie

- `server/config/index.js` - Alle configuratie (ports, timeouts, browser settings)

#### Utilities

- `server/utils/helpers.js` - Helper functies (URL conversion, attribute extraction)
- `server/utils/compare.js` - Change detection logica

#### Scrapers

- `server/scrapers/puppeteerScraper.js` - Puppeteer scraping met anti-bot detectie
- `server/scrapers/cheerioScraper.js` - Eenvoudige Cheerio/Axios scraping
- `server/scrapers/crawler.js` - Website crawler die links volgt
- `server/scrapers/dataExtractors.js` - Hoofd extractor die alle extractors aanroept

#### Data Extractors

- `server/scrapers/extractors/basicExtractors.js` - Basis info, meta tags, headings
- `server/scrapers/extractors/linkExtractor.js` - Links extractie
- `server/scrapers/extractors/imageExtractor.js` - Images extractie (inclusief lazy loading)
- `server/scrapers/extractors/contentExtractors.js` - Paragraphs, lists, tables, forms, buttons
- `server/scrapers/extractors/mediaExtractors.js` - Videos, audio, iframes, scripts, stylesheets
- `server/scrapers/extractors/metaExtractors.js` - Data attributes, classes, IDs, comments, favicons
- `server/scrapers/extractors/analysisExtractors.js` - Contact info, e-commerce, taal, sentiment, content analyse

#### Routes

- `server/routes/scrape.js` - Main scrape endpoint handler
- `server/routes/custom.js` - Custom CSS selector endpoint handler
- `server/routes/crawl.js` - Website crawler endpoint handler
- `server/routes/compare.js` - Change detection endpoint handler

### Frontend Structuur

#### API

- `src/api/scraper.js` - API calls voor scraping, crawling, custom selectors

#### Utils

- `src/utils/validation.js` - URL validatie
- `src/utils/clipboard.js` - Clipboard utilities
- `src/utils/storage.js` - localStorage voor geschiedenis en analytics
- `src/utils/export.js` - Export functionaliteit (JSON/CSV)
- `src/utils/changeDetection.js` - Frontend change detection
- `src/utils/contactExtraction.js` - Contact info extractie
- `src/utils/contentAnalysis.js` - Content analyse utilities
- `src/utils/languageDetection.js` - Taal detectie
- `src/utils/sentimentAnalysis.js` - Sentiment analyse

#### Components

- `src/components/ScrapeForm.jsx` - Form component voor normale scraping
- `src/components/CrawlForm.jsx` - Website crawler form component
- `src/components/CustomSelector.jsx` - Custom CSS selector UI met templates
- `src/components/ScrapeResultsExtended.jsx` - Uitgebreide resultaten weergave
- `src/components/BulkScrapeForm.jsx` - Bulk scraping component
- `src/components/AnalyticsDashboard.jsx` - Analytics dashboard
- `src/components/HistoryManager.jsx` - Geschiedenis beheer
- `src/components/ChangeDetection.jsx` - Change detection UI
- `src/components/SearchAndFilter.jsx` - Zoeken en filteren component

## API Endpoints

### POST /api/scrape

Scrape een enkele website en krijg gedetailleerde data terug.

**Request:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "...",
    "url": "...",
    "metaTags": {...},
    "headings": {...},
    "links": [...],
    "images": [...],
    "statistics": {...},
    ...
  }
}
```

### POST /api/crawl

Crawl een hele website en scrape alle pagina's.

**Request:**

```json
{
  "url": "https://example.com",
  "options": {
    "maxPages": 50,
    "maxDepth": 3,
    "sameDomain": true,
    "includeSubdomains": false,
    "delay": 1000,
    "followExternalLinks": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "sessionId": "crawl_1234567890_abc123",
  "message": "Crawl started..."
}
```

Gebruik `/api/crawl/result?sessionId=...` om het resultaat op te halen.

### GET /api/crawl/progress

Haal de huidige progress op van een crawl sessie.

**Query Parameters:**

- `sessionId` - De session ID van de crawl

**Response:**

```json
{
  "current": 5,
  "total": 50,
  "message": "Scraping page 5/50: https://example.com/page5",
  "currentUrl": "https://example.com/page5",
  "completed": false,
  "error": false
}
```

### GET /api/crawl/result

Haal het eindresultaat op van een crawl sessie.

**Query Parameters:**

- `sessionId` - De session ID van de crawl

**Response:**

```json
{
  "success": true,
  "data": {
    "startUrl": "https://example.com",
    "totalPages": 15,
    "pages": [...],
    "visitedUrls": [...],
    "summary": {...}
  }
}
```

### POST /api/scrape/custom

Scrape met custom CSS selectors.

**Request:**

```json
{
  "url": "https://example.com",
  "selectors": [
    {
      "name": "Product Images",
      "selector": "img.product-image"
    },
    {
      "name": "Prices",
      "selector": ".price"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "Product Images": [...],
    "Prices": [...]
  }
}
```

### POST /api/compare

Vergelijk twee scrapes om veranderingen te detecteren.

**Request:**

```json
{
  "oldData": {...},
  "newData": {...}
}
```

**Response:**

```json
{
  "success": true,
  "changes": {
    "added": {...},
    "removed": {...},
    "modified": {...},
    "statistics": {...}
  }
}
```

### GET /health

Health check endpoint om te controleren of de server draait.

**Response:**

```json
{
  "status": "ok",
  "message": "API is running"
}
```

## JavaScript-Heavy Sites

De applicatie detecteert automatisch JavaScript-heavy sites en gebruikt Puppeteer voor deze sites. Ondersteunde sites:

- bol.com
- Amazon
- Coolblue
- MediaMarkt
- Wehkamp
- Zalando

Voor andere sites wordt automatisch Cheerio gebruikt voor snellere scraping.

### Puppeteer Features

- Anti-bot detectie bypass
- Realistische browser headers en user agent
- Automatisch scrollen voor lazy-loaded content
- Cookie banner handling
- Image loading wait
- Network idle detection

## Opmerkingen

- Sommige websites kunnen anti-scraping maatregelen hebben
- De scraping kan even duren afhankelijk van de website grootte
- Crawling kan lang duren voor grote websites (afhankelijk van maxPages en delay instellingen)
- Zorg ervoor dat je toestemming hebt om websites te scrapen
- Puppeteer wordt automatisch gebruikt voor JavaScript-heavy sites
- Cheerio wordt gebruikt voor simpele statische sites
- Geschiedenis wordt opgeslagen in localStorage (maximaal 100 items)
- Analytics worden automatisch bijgewerkt bij elke scrape
- Crawl sessies worden automatisch opgeschoond na 30 seconden

## Browser Ondersteuning

- Chrome/Edge (laatste versies)
- Firefox (laatste versies)
- Safari (laatste versies)

## Developer

Developed by Pieter Luypaert

## Licentie

ISC
