# Web Scraper Applicatie

Een uitgebreide web scraping applicatie met een moderne React frontend en Shadcn UI. Scrape websites grondig en krijg gedetailleerde, gestructureerde data.

## Features

- **Grondige Scraping**: Extract alle mogelijke data van websites
- **Bulk Operations**: Scrape meerdere URLs tegelijk
- **Geschiedenis Management**: Opslaan en beheren van eerdere scrapes
- **Analytics Dashboard**: Statistieken over scraping activiteit
- **Export Functionaliteit**: Export naar JSON en CSV
- **Zoeken & Filteren**: Zoek en filter door gescrapede data
- **Sorteren**: Sorteer resultaten op verschillende criteria
- **Modern UI**: React + Shadcn UI met Tailwind CSS
- **Responsive Design**: Werkt op alle apparaten

## Project Structuur

```
data-scraper/
├── src/
│   ├── api/              # API calls (scraper.js)
│   ├── components/       # React components
│   │   ├── ui/          # Shadcn UI components
│   │   ├── ScrapeForm.jsx
│   │   ├── ScrapeResultsExtended.jsx
│   │   ├── BulkScrapeForm.jsx
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── HistoryManager.jsx
│   │   └── SearchAndFilter.jsx
│   ├── utils/           # Utility functions
│   │   ├── validation.js
│   │   ├── clipboard.js
│   │   ├── storage.js
│   │   └── export.js
│   ├── App.jsx          # Main React component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── server.js            # Express backend
└── package.json
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

2. Start de server in productie mode:

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

### Bulk Scraping

1. Ga naar de "Bulk Scrapen" tab
2. Voeg meerdere URLs toe met de "URL Toevoegen" knop
3. Klik op "Start Bulk Scraping"
4. Bekijk de progress en resultaten per URL

### Geschiedenis

1. Ga naar de "Geschiedenis" tab
2. Bekijk alle eerdere scrapes
3. Selecteer items voor bulk export of verwijdering
4. Klik op een item om de resultaten te bekijken

### Analytics

1. Ga naar de "Analytics" tab
2. Bekijk statistieken over je scraping activiteit
3. Zie de meest gescrapede websites
4. Bekijk dagelijkse statistieken

## Wat wordt er gescraped?

De applicatie scrapet **alle** beschikbare data van een website:

### Basis Informatie

- Titel, beschrijving, taal, charset
- Finale URL (na redirects)

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

### Statistieken

- Totaal aantal van elk element type
- Overzicht van alle elementen op de pagina

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

## Technologie

- **Backend**: Node.js met Express
- **Scraping**: Cheerio (HTML parsing) en Axios (HTTP requests)
- **Frontend**: React 19 + Vite
- **UI**: Shadcn UI + Tailwind CSS
- **Icons**: Lucide React
- **Storage**: localStorage voor geschiedenis en analytics

## Code Organisatie

De code is opgesplitst in modules:

### API

- `src/api/scraper.js` - API calls voor scraping

### Utils

- `src/utils/validation.js` - URL validatie
- `src/utils/clipboard.js` - Clipboard utilities
- `src/utils/storage.js` - localStorage voor geschiedenis en analytics
- `src/utils/export.js` - Export functionaliteit (JSON/CSV)

### Components

- `src/components/ScrapeForm.jsx` - Form component voor normale scraping
- `src/components/ScrapeResultsExtended.jsx` - Uitgebreide resultaten weergave
- `src/components/BulkScrapeForm.jsx` - Bulk scraping component
- `src/components/AnalyticsDashboard.jsx` - Analytics dashboard
- `src/components/HistoryManager.jsx` - Geschiedenis beheer
- `src/components/SearchAndFilter.jsx` - Zoeken en filteren component

## API Endpoints

### POST /api/scrape

Scrape een website en krijg gedetailleerde data terug.

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

### GET /health

Health check endpoint om te controleren of de server draait.

## Opmerkingen

- Sommige websites kunnen anti-scraping maatregelen hebben
- De scraping kan even duren afhankelijk van de website grootte
- Zorg ervoor dat je toestemming hebt om websites te scrapen
- Cheerio werkt alleen voor statische HTML (geen JavaScript-rendering)
- Geschiedenis wordt opgeslagen in localStorage (maximaal 100 items)
- Analytics worden automatisch bijgewerkt bij elke scrape

## Browser Ondersteuning

- Chrome/Edge (laatste versies)
- Firefox (laatste versies)
- Safari (laatste versies)

## Licentie

ISC
