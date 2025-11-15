# Proxy Functionaliteit Testen

## Stap 1: Applicatie Starten

### Terminal 1 - Backend Server:

```bash
npm start
```

### Terminal 2 - Frontend Dev Server:

```bash
npm run dev:frontend
```

Open de applicatie in je browser: `http://localhost:5173`

---

## Stap 2: Proxy Toevoegen

### Optie A: Via de UI (Aanbevolen voor testen)

1. Ga naar de **"Proxy Management"** tab in de navigatie
2. Klik op **"Nieuwe Proxy"** knop
3. Vul de proxy gegevens in:
   - **Host**: `proxy.example.com` (of je test proxy)
   - **Port**: `8080` (of je proxy poort)
   - **Protocol**: `http` of `https`
   - **Username**: (optioneel)
   - **Password**: (optioneel)
4. Klik op **"Proxy Toevoegen"**

### Optie B: Via Environment Variables

Maak een `.env` bestand in de root directory:

```bash
PROXY_ENABLED=true
PROXIES='[{"host":"proxy.example.com","port":8080,"username":"user","password":"pass","protocol":"http"}]'
```

Of voor meerdere proxies:

```bash
PROXIES='[{"host":"proxy1.example.com","port":8080,"protocol":"http"},{"host":"proxy2.example.com","port":8080,"protocol":"http"}]'
```

---

## Stap 3: Test Scenarios

### Test 1: Proxy Health Check

1. Ga naar **"Proxy Management"** tab
2. Klik op **"Health Check"** knop
3. Wacht enkele seconden
4. Controleer de resultaten:
   - ✅ Gezonde proxies hebben een groene indicator
   - ❌ Ongezonde proxies hebben een rode indicator
   - Response times worden getoond
   - Success rates worden bijgewerkt

**Verwachte output in console:**

```
Checking health of 2 proxies...
Health check complete: 2/2 proxies healthy
```

### Test 2: Proxy Rotatie Testen

1. Voeg minimaal 2 proxies toe
2. Ga naar **"Scrapen"** tab
3. Scrape een website meerdere keren (bijv. `https://example.com`)
4. Check de console logs - je zou moeten zien:
   ```
   Using proxy: http://proxy1.example.com:8080
   Using proxy: http://proxy2.example.com:8080
   Using proxy: http://proxy1.example.com:8080
   ```
5. Ga terug naar **"Proxy Management"** tab
6. Controleer dat beide proxies requests hebben ontvangen

### Test 3: Failover Testen

1. Voeg 2 proxies toe (1 werkend, 1 niet-werkend)
2. Scrape een website
3. Check de console - je zou moeten zien:
   ```
   Using proxy: http://bad-proxy.com:8080
   Request failed with proxy http://bad-proxy.com:8080, trying next proxy...
   Using proxy: http://good-proxy.com:8080
   ```
4. De scraper zou automatisch moeten overschakelen naar de werkende proxy

### Test 4: Proxy Statistieken

1. Voeg proxies toe en gebruik ze voor scraping
2. Ga naar **"Proxy Management"** tab
3. Bekijk de statistieken:
   - **Totaal Proxies**: Aantal geconfigureerde proxies
   - **Gezond**: Aantal werkende proxies
   - **Niet Gezond**: Aantal niet-werkende proxies
   - **Succes Rate**: Percentage succesvolle requests
4. Klik op een proxy in de lijst om details te zien:
   - Totaal aantal requests
   - Succesvolle requests
   - Response time
   - Laatste health check tijd

---

## Stap 4: Console Logs Controleren

### Wat te zoeken in de console:

**Bij het starten van de server:**

```
Proxy support enabled with 2 proxies
```

**Bij scraping met proxy:**

```
Using proxy: http://proxy.example.com:8080
```

**Bij health check:**

```
Checking health of 2 proxies...
Health check complete: 2/2 proxies healthy
```

**Bij proxy falen:**

```
Request failed with proxy http://bad-proxy.com:8080, trying next proxy...
```

**Bij Puppeteer met proxy:**

```
Using proxy: http://proxy.example.com:8080
Proxy authentication configured
```

---

## Stap 5: Test met Publieke Proxy Services

### Optionele Test Proxies (voor testen alleen):

⚠️ **Let op**: Gebruik alleen voor testen, niet voor productie!

**Gratis proxy lijsten** (kan onbetrouwbaar zijn):

- https://www.proxy-list.download/
- https://free-proxy-list.net/

**Voorbeeld test proxy configuratie:**

```json
{
  "host": "185.199.229.156",
  "port": 7492,
  "protocol": "http"
}
```

---

## Stap 6: Verificatie Checklist

- [ ] Proxy Management tab is zichtbaar
- [ ] Kan proxy toevoegen via UI
- [ ] Proxy verschijnt in de lijst
- [ ] Health check werkt
- [ ] Proxy wordt gebruikt bij scraping (zie console logs)
- [ ] Proxy rotatie werkt (verschillende proxies worden gebruikt)
- [ ] Failover werkt (bij falen wordt volgende proxy geprobeerd)
- [ ] Statistieken worden bijgewerkt
- [ ] Proxy kan worden verwijderd
- [ ] Reset functionaliteit werkt

---

## Troubleshooting

### Proxy wordt niet gebruikt

**Check:**

1. Is `PROXY_ENABLED=true` in config of environment?
2. Zijn er proxies geconfigureerd?
3. Zijn de proxies gezond? (check health status)
4. Check console logs voor errors

### Health check faalt

**Mogelijke oorzaken:**

- Proxy is niet bereikbaar
- Proxy vereist authenticatie maar credentials zijn niet opgegeven
- Firewall blokkeert de verbinding
- Proxy is te traag (timeout > 10 seconden)

### Proxy werkt niet bij scraping

**Check:**

1. Is de proxy gezond volgens health check?
2. Werkt de proxy met andere tools?
3. Check console logs voor specifieke errors
4. Probeer een andere proxy

---

## Geavanceerde Tests

### Test met Meerdere Proxies

```bash
# Voeg 5 proxies toe via UI of config
# Scrape 10 websites
# Controleer dat alle proxies worden gebruikt (rotatie)
```

### Test Failover Performance

```bash
# Voeg 3 proxies toe (2 werkend, 1 niet-werkend)
# Scrape een website
# Controleer dat alleen werkende proxies worden gebruikt
# Controleer dat niet-werkende proxy wordt overgeslagen
```

### Test Health Monitoring

```bash
# Voeg proxy toe
# Wacht 5 minuten
# Controleer dat automatische health check heeft gedraaid
# Check de "Laatst gecontroleerd" tijd in de UI
```

---

## API Endpoints voor Testen

Je kunt ook direct de API endpoints testen:

### Get Proxy Stats

```bash
curl http://localhost:3001/api/proxy/stats
```

### Check Proxy Health

```bash
curl http://localhost:3001/api/proxy/health
```

### Add Proxy

```bash
curl -X POST http://localhost:3001/api/proxy/add \
  -H "Content-Type: application/json" \
  -d '{"proxy":{"host":"proxy.example.com","port":8080,"protocol":"http"}}'
```

---

## Tips

1. **Start klein**: Test eerst met 1 proxy voordat je meerdere toevoegt
2. **Check logs**: De console logs geven veel informatie over wat er gebeurt
3. **Health checks**: Gebruik de health check functionaliteit regelmatig
4. **Monitor stats**: Houd de success rates in de gaten om problemen te detecteren
5. **Test failover**: Zorg dat failover werkt voordat je het in productie gebruikt
