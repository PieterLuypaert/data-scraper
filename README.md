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
- **SEO Analysis Tool**: Volledige SEO analyse met score, issues, warnings en aanbevelingen
- **Data Visualization**: Interactieve charts, word clouds en link graphs voor data analyse
- **Screenshot Capture**: Automatische screenshot capture bij scraping (met Puppeteer)
- **Export Functionaliteit**: Export naar JSON, CSV, Excel en PDF met automatische formatting
- **Zoeken & Filteren**: Zoek en filter door gescrapede data
- **Sorteren**: Sorteer resultaten op verschillende criteria
- **Proxy Support**: Roterende proxies voor anti-bot bypass met health monitoring en automatische failover
- **Modern UI**: React + Shadcn UI met Tailwind CSS
- **Responsive Design**: Werkt op alle apparaten
- **Verbeterde UI/UX**: Tooltips, contextuele hints, help-teksten en empty states voor betere gebruikerservaring

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
│   │       └── analysisExtractors.js   # Contact info, e-commerce, sentiment, SEO analysis
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
│   │   ├── SEOAnalysis.jsx  # SEO analysis component
│   │   ├── DataVisualization.jsx  # Data visualization with charts
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

1. Ga naar de "Scrapen" tab (hover over tabs voor uitleg)
2. Lees de help-tekst bovenaan voor context
3. Voer een URL in (bijvoorbeeld: `https://example.com`)
4. Gebruik de info badges (?) voor uitleg bij velden
5. Klik op "Scrapen" om de website te scrapen
6. Bekijk de gedetailleerde resultaten

De applicatie detecteert automatisch of een site JavaScript-rendering nodig heeft (zoals bol.com, Amazon) en gebruikt dan Puppeteer. Voor simpele sites wordt Cheerio gebruikt.

**Tip**: Hover over knoppen en velden voor tooltips met extra informatie.

### Website Crawling

1. Ga naar de "Crawlen" tab (hover voor uitleg over crawling)
2. Lees de tip bovenaan voor best practices
3. Voer een start URL in (bijvoorbeeld: `https://example.com`)
4. Optioneel: pas de crawl opties aan (gebruik info badges voor uitleg):
   - Max Pagina's: Maximum aantal pagina's om te scrapen (standaard: 50)
     - Info badge legt uit: hogere waarden = langere wachttijd
   - Max Diepte: Hoe diep te crawlen vanaf start URL (standaard: 3)
     - Info badge legt uit: diepte 1 = alleen startpagina, diepte 2 = startpagina + directe links, etc.
   - Vertraging: Wachttijd tussen requests in milliseconden (standaard: 1000ms)
     - Info badge legt uit: hogere waarden = respectvoller voor server, maar langzamer
   - Alleen zelfde domein: Alleen links binnen hetzelfde domein volgen
   - Inclusief subdomeinen: Ook subdomeinen toestaan
   - Volg externe links: Ook links naar andere websites volgen
5. Klik op "Start Crawl" (hover voor tooltip)
6. De crawler scrapet automatisch alle gevonden pagina's

**Tip**: Start met een klein aantal pagina's (10-20) om te testen. Grote crawls kunnen lang duren en veel geheugen gebruiken.

### Custom CSS Selectors

1. Ga naar de "Custom Selectors" tab (hover voor uitleg over CSS selectors)
2. Lees de help-tekst over wat CSS selectors zijn
3. Voer een URL in
4. Voeg selectors toe:
   - Gebruik de "Selector Toevoegen" knop (met tooltip) om handmatig selectors toe te voegen
   - Of gebruik een template selector (bijvoorbeeld "Afbeeldingen", "Meta Description", "Product Namen")
   - Info badges bij "Naam" en "CSS Selector" velden geven uitleg
5. Optioneel: test individuele selectors met de "Test" knop
6. Klik op "Scrape met Selectors" om alle selectors uit te voeren
7. Bekijk de resultaten per selector

**Tip**: CSS selectors zijn patronen om elementen te vinden. Bijvoorbeeld: `.product-title` voor elementen met class "product-title", of `h1` voor alle H1 headings.

### Bulk Scraping

1. Ga naar de "Bulk Scrapen" tab (hover voor uitleg)
2. Lees de help-tekst over hoe bulk scraping werkt
3. Voeg meerdere URLs toe met de "URL Toevoegen" knop (met tooltip)
4. Gebruik de info badge voor uitleg over het toevoegen van URLs
5. Klik op "Start Bulk Scraping" (hover voor tooltip met aantal URLs)
6. Bekijk de progress en resultaten per URL
7. Export alle resultaten in bulk

**Tip**: Elke URL wordt onafhankelijk gescraped. Resultaten worden automatisch opgeslagen in de geschiedenis.

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

1. Ga naar de "Geschiedenis" tab (hover voor uitleg)
2. Bekijk alle eerdere scrapes
   - Als er geen geschiedenis is, zie je een empty state met instructies
3. Selecteer items voor bulk export of verwijdering:
   - Gebruik de selecteer-knop voor individuele items
   - Of gebruik "Selecteer alle items" (met tooltip)
4. Klik op een item om de resultaten te bekijken
5. Gebruik export knoppen (met tooltips) om geselecteerde items te exporteren
6. Gebruik "Verwijder" of "Wis Alles" (met tooltips) om items te verwijderen

**Tip**: Alle gescrapede websites worden automatisch opgeslagen. Klik op een item om de details te bekijken.

### Analytics

1. Ga naar de "Analytics" tab
2. Bekijk statistieken over je scraping activiteit:
   - Totaal aantal scrapes
   - Succes percentage
   - Meest gescrapede websites
   - Dagelijkse statistieken
   - Tijdlijn van activiteit

### SEO Analysis

1. Ga naar de "SEO Analysis" tab
2. Scrape eerst een website (of selecteer uit geschiedenis)
3. Bekijk de volledige SEO analyse:
   - **SEO Score**: 0-100 score met kleurcodering
   - **Kritieke Problemen**: Issues die direct moeten worden opgelost
   - **Waarschuwingen**: Verbeterpunten voor betere SEO
   - **Aanbevelingen**: Concrete tips voor SEO optimalisatie
   - **Gedetailleerde Meta**: Title/description lengte, heading structuur, image alt tekst, links, mobile-friendliness, HTTPS, social media tags

De SEO analyse controleert:

- Title tag lengte (aanbevolen: 50-60 karakters)
- Meta description lengte (aanbevolen: 150-160 karakters)
- Heading structuur (H1, H2, H3)
- Image alt tekst percentage
- Open Graph tags
- Twitter Card tags
- Canonical URL
- Mobile-friendliness (viewport meta tag)
- HTTPS gebruik
- URL structuur (lengte en diepte)
- Schema.org structured data

### Data Visualization

1. Ga naar de "Data Visualization" tab
2. Scrape eerst een website om data te visualiseren
3. Kies uit verschillende visualisaties:
   - **Statistieken**: Bar chart en pie chart van alle elementen (links, images, headings, etc.)
   - **Word Cloud**: Meest voorkomende woorden uit de content met verschillende groottes
   - **Link Graph**: Bar chart van interne vs externe links per domein
   - **Analytics**: Line chart van dagelijkse scraping activiteit (succesvol vs gefaald)

De visualisaties zijn interactief met tooltips en responsive design.

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
- **SEO Analyse**: Volledige SEO score met issues, warnings en aanbevelingen
- **Screenshots**: Automatische screenshot capture (bij gebruik van Puppeteer)

### Statistieken

- Totaal aantal van elk element type
- Overzicht van alle elementen op de pagina
- Element counts per type

## Export Functionaliteit

### Beschikbare Export Opties

- **JSON Export**: Export volledige data als JSON
- **CSV Export**: Export volledige data als CSV
- **Excel Export**: Export naar Excel met meerdere sheets (Overview, Links, Images, Headings, Meta Tags) en automatische formatting
- **PDF Export**: Export naar PDF met screenshots, statistieken en gestructureerde content
- **Links CSV**: Export alleen links als CSV
- **Images CSV**: Export alleen afbeeldingen als CSV
- **Batch Export**: Export meerdere scrapes tegelijk (JSON/CSV/Excel)

### Export Gebruik

1. In de resultaten: gebruik de export knoppen bovenaan (JSON, CSV, Excel, PDF)
   - Hover over elke knop voor een tooltip met uitleg
   - Voor crawl resultaten: tooltips geven aan dat alle pagina's worden geëxporteerd
2. In geschiedenis: selecteer items en gebruik "Export JSON", "Export CSV" of "Export Excel"
   - Elke export knop heeft een tooltip met uitleg

**Tip**: Excel en PDF exports voor crawls bevatten meerdere sheets/pagina's met alle data van alle pagina's.

### Excel Export Features

- **Meerdere Sheets**: Data wordt georganiseerd in verschillende sheets:
  - Overview: Basis informatie en statistieken
  - Links: Alle links met tekst, URL, title, target, rel
  - Images: Alle afbeeldingen met alt tekst, source, afmetingen
  - Headings: Alle headings met level, tekst, ID, class
  - Meta Tags: Alle meta tags met name en content
- **Automatische Formatting**: Headers worden automatisch geformatteerd
- **Batch Export**: Meerdere scrapes in één Excel bestand met summary sheet

### PDF Export Features

- **Screenshots**: Screenshots worden automatisch toegevoegd aan het PDF
- **Gestructureerde Content**: Data wordt georganiseerd in secties:
  - Overview met basis informatie
  - Statistics met aantallen
  - Screenshot (indien beschikbaar)
  - Links lijst (eerste 50)
  - Images lijst (eerste 20)
  - Headings hiërarchie
- **Professionele Styling**: Automatische paginering en footer
- **Klikbare Links**: Links in het PDF zijn klikbaar

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

## UI/UX Features

De applicatie bevat uitgebreide UI/UX verbeteringen voor een betere gebruikerservaring:

### Tooltips

- **Tab Tooltips**: Hover over elke tab in de navigatie voor een korte uitleg van wat die tab doet
- **Knop Tooltips**: Hover over knoppen (zoals export, verwijder, etc.) voor uitleg
- **Contextuele Tooltips**: Tooltips verschijnen automatisch bij hover over belangrijke elementen

### Info Badges

- **Info Icons (?)** naast labels en velden voor extra uitleg
- Klik of hover over de badge voor gedetailleerde informatie
- Helpt gebruikers begrijpen wat elk veld doet

### Help Teksten

- **Contextuele Help**: Help-teksten bovenaan formulieren met uitleg over functionaliteit
- **Tips**: Gele tip-boxen met best practices en aanbevelingen
- **Waarschuwingen**: Oranje waarschuwingen voor belangrijke informatie

### Empty States

- **Instructieve Empty States**: Wanneer er geen data is, zie je duidelijke instructies
- **Actie Suggesties**: Empty states suggereren wat je kunt doen om te beginnen
- **Visuele Icons**: Icons maken het duidelijk wat er ontbreekt

### Visuele Feedback

- **Duidelijke Labels**: Alle formuliervelden hebben beschrijvende labels
- **Placeholder Teksten**: Placeholders geven voorbeelden van verwachte input
- **Status Indicators**: Duidelijke visuele feedback voor loading, success, errors
- **Progress Bars**: Visuele progress indicators voor lange operaties

### Navigatie

- **Beschrijvende Header**: Header bevat een korte beschrijving van de applicatie
- **Tab Uitleg**: Elke tab heeft een tooltip met uitleg
- **Visuele Hiërarchie**: Duidelijke visuele hiërarchie maakt navigatie intuïtief

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
- **Charts**: Recharts voor data visualisatie
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
- `server/scrapers/extractors/analysisExtractors.js` - Contact info, e-commerce, taal, sentiment, content analyse, SEO analysis

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

- `src/components/ScrapeForm.jsx` - Form component voor normale scraping met help-teksten en tooltips
- `src/components/CrawlForm.jsx` - Website crawler form component met contextuele hints
- `src/components/CustomSelector.jsx` - Custom CSS selector UI met templates en uitleg
- `src/components/ScrapeResultsExtended.jsx` - Uitgebreide resultaten weergave met export tooltips
- `src/components/BulkScrapeForm.jsx` - Bulk scraping component met help-teksten
- `src/components/AnalyticsDashboard.jsx` - Analytics dashboard
- `src/components/HistoryManager.jsx` - Geschiedenis beheer met empty states en tooltips
- `src/components/ChangeDetection.jsx` - Change detection UI
- `src/components/SEOAnalysis.jsx` - SEO analysis component met score en aanbevelingen
- `src/components/DataVisualization.jsx` - Data visualization met charts, word clouds en link graphs
- `src/components/SearchAndFilter.jsx` - Zoeken en filteren component
- `src/components/ui/tooltip.jsx` - Tooltip component voor hover uitleg
- `src/components/ui/help-text.jsx` - Help tekst en empty state componenten

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
- Screenshot capture (full-page of viewport)
- Dynamische content loading

## Proxy Support

De applicatie ondersteunt proxy rotatie voor anti-bot bypass met de volgende features:

### Features

- **Proxy Rotatie**: Automatische rotatie tussen geconfigureerde proxies
- **Health Monitoring**: Automatische health checks om gezonde proxies te identificeren
- **Automatische Failover**: Bij falen van een proxy wordt automatisch de volgende proxy geprobeerd
- **Proxy Management UI**: Voeg proxies toe, verwijder ze, en monitor hun status via de UI
- **Statistieken**: Bekijk success rates, response times en health status per proxy

### Proxy Configuratie

Proxies kunnen worden geconfigureerd via:

1. **Environment Variables**:
   ```bash
   PROXY_ENABLED=true
   PROXIES='[{"host":"proxy.example.com","port":8080,"username":"user","password":"pass","protocol":"http"}]'
   ```

2. **Via de UI**: Ga naar de "Proxy Management" tab om proxies toe te voegen en te beheren

### Proxy Formaten

Proxies kunnen worden toegevoegd in twee formaten:

**Format 1 - Object:**
```json
{
  "host": "proxy.example.com",
  "port": 8080,
  "username": "user",
  "password": "pass",
  "protocol": "http"
}
```

**Format 2 - URL String:**
```
http://user:pass@proxy.example.com:8080
```

### Health Monitoring

- Automatische health checks elke 5 minuten (configureerbaar)
- Proxies worden gemarkeerd als ongezond na 3 opeenvolgende fouten
- Health check URL: `https://www.google.com` (configureerbaar)
- Response time tracking per proxy

### Failover

- Bij falen van een request wordt automatisch de volgende gezonde proxy geprobeerd
- Maximaal 3 retries met verschillende proxies
- Alleen gezonde proxies worden gebruikt voor nieuwe requests

## Opmerkingen

- Sommige websites kunnen anti-scraping maatregelen hebben
- De scraping kan even duren afhankelijk van de website grootte
- Crawling kan lang duren voor grote websites (afhankelijk van maxPages en delay instellingen)
- Zorg ervoor dat je toestemming hebt om websites te scrapen
- Puppeteer wordt automatisch gebruikt voor JavaScript-heavy sites
- Cheerio wordt gebruikt voor simpele statische sites
- Screenshots worden automatisch gemaakt bij Puppeteer scraping (optioneel forceren met checkbox)
- Screenshots worden niet opgeslagen in localStorage (te groot), maar wel getoond in resultaten
- Geschiedenis wordt opgeslagen in localStorage (maximaal 100 items, automatisch verlaagd bij screenshots)
- Analytics worden automatisch bijgewerkt bij elke scrape
- Crawl sessies worden automatisch opgeschoond na 30 seconden
- SEO analyse wordt automatisch uitgevoerd bij elke scrape
- Proxy support is optioneel en kan worden ingeschakeld via configuratie
- UI/UX features zoals tooltips, help-teksten en empty states maken de applicatie gebruiksvriendelijker
- Hover over elementen voor extra informatie en contextuele hints

## Browser Ondersteuning

- Chrome/Edge (laatste versies)
- Firefox (laatste versies)
- Safari (laatste versies)

## Developer

Developed by Pieter Luypaert

## Licentie

ISC
