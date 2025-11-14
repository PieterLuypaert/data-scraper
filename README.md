# Web Scraper Applicatie

Een web scraping applicatie met een moderne React frontend en Shadcn UI. Voer een URL in en krijg gestructureerde data van de website.

## Features

- 🌐 Scrape data van elke website
- 📄 Extract titel, meta tags, headings, links en afbeeldingen
- 🎨 Modern React UI met Shadcn components
- 📋 Kopieer resultaten naar clipboard
- ⚡ Snelle en efficiënte scraping met Cheerio
- 🚀 React + Vite voor snelle development

## Project Structuur

```
data-scraper/
├── src/
│   ├── api/           # API calls (scraper.js)
│   ├── components/    # React components
│   │   ├── ui/        # Shadcn UI components
│   │   ├── ScrapeForm.jsx
│   │   └── ScrapeResults.jsx
│   ├── utils/         # Utility functions (validation, clipboard)
│   ├── App.jsx        # Main React component
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles
├── server.js          # Express backend
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

1. Start beide servers (zie Development hierboven)
2. Open `http://localhost:5173` in je browser
3. Voer een URL in (bijvoorbeeld: `https://example.com`)
4. Klik op "Send" om de website te scrapen
5. Bekijk de gestructureerde data in de resultaten

## Wat wordt er gescraped?

- **Titel**: De pagina titel
- **Meta Tags**: Alle meta tags (description, keywords, etc.)
- **Headings**: H1, H2 en H3 headings
- **Links**: Alle links op de pagina (max 50)
- **Afbeeldingen**: Alle afbeeldingen met alt tekst (max 20)
- **Tekst Preview**: Eerste 1000 karakters van de pagina tekst
- **Raw JSON**: Volledige data in JSON formaat

## Technologie

- **Backend**: Node.js met Express
- **Scraping**: Cheerio (HTML parsing) en Axios (HTTP requests)
- **Frontend**: React 19 + Vite
- **UI**: Shadcn UI + Tailwind CSS
- **Icons**: Lucide React

## Code Organisatie

De code is opgesplitst in modules:

- `src/api/scraper.js` - API calls voor scraping
- `src/utils/validation.js` - URL validatie
- `src/utils/clipboard.js` - Clipboard utilities
- `src/components/ScrapeForm.jsx` - Form component
- `src/components/ScrapeResults.jsx` - Results display component

## Opmerkingen

- Sommige websites kunnen anti-scraping maatregelen hebben
- De scraping kan even duren afhankelijk van de website
- Zorg ervoor dat je toestemming hebt om websites te scrapen
- Cheerio werkt alleen voor statische HTML (geen JavaScript-rendering)
