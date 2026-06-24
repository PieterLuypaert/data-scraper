export const SELECTOR_TEMPLATES = [
  {
    name: 'Afbeeldingen',
    selector: 'img',
    description: 'Vind alle afbeeldingen op de pagina'
  },
  {
    name: 'Alle Links',
    selector: 'a[href]',
    description: 'Vind alle links op de pagina'
  },
  {
    name: 'Headings',
    selector: 'h1, h2, h3, h4, h5, h6',
    description: 'Vind alle headings'
  },
  {
    name: 'Paragrafen',
    selector: 'p',
    description: 'Vind alle paragrafen'
  },
  {
    name: 'Meta Description',
    selector: 'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]',
    description: 'Vind meta description (alle varianten)'
  },
  {
    name: 'Meta Tags',
    selector: 'meta',
    description: 'Vind alle meta tags'
  },
  {
    name: 'Product Namen',
    selector: '.product-title, .product-name, h2.product, [class*="product"] h2, [class*="product-title"], [class*="product-name"], .item-title, .item-name',
    description: 'Vind productnamen op e-commerce sites'
  },
  {
    name: 'Prijzen',
    selector: '.price, .product-price, [class*="price"], [data-price], .cost, .amount, [class*="cost"], [class*="amount"]',
    description: 'Vind prijzen op e-commerce sites'
  },
  {
    name: 'Product Afbeeldingen',
    selector: 'img[class*="product"], img[alt*="product"], .product img, [class*="product"] img, .item img, [class*="item"] img, img[data-product], img.product-image, img.product-img',
    description: 'Vind productafbeeldingen (specifiek)'
  },
  {
    name: 'Product Links',
    selector: 'a[href*="/product"], a[href*="/item"], a[href*="/p/"], .product-link, a.product, [class*="product"] a',
    description: 'Vind product links'
  },
  {
    name: 'Beschrijvingen',
    selector: '.product-description, .description, [class*="desc"], .summary, .excerpt, [class*="summary"]',
    description: 'Vind productbeschrijvingen'
  },
  {
    name: 'Buttons',
    selector: 'button, [type="button"], [type="submit"], .btn, [class*="button"]',
    description: 'Vind alle buttons'
  },
  {
    name: 'Forms',
    selector: 'form',
    description: 'Vind alle formulieren'
  },
  {
    name: 'Tabellen',
    selector: 'table',
    description: 'Vind alle tabellen'
  }
];
