// Centralised puppeteer-extra + stealth setup and a reusable shared browser.
//
// Launching a fresh Chromium per scrape costs ~1-3s of pure overhead. For the
// common case (no proxy) we keep ONE browser alive and hand out a fresh page
// per request, closing only the page afterwards. Proxy scrapes still get their
// own browser because the --proxy-server arg is set at launch time and differs
// per proxy, so they can't share the pool.
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config = require('../config');

// Register stealth once, here, so it isn't added twice via multiple requires.
puppeteer.use(StealthPlugin());

let sharedBrowser = null;
let launching = null;

function baseLaunchOptions() {
  return { headless: true, ...config.PUPPETEER };
}

/**
 * Get the shared (no-proxy) browser, launching it on first use and relaunching
 * if it has crashed/disconnected. Concurrent callers await the same launch.
 * @returns {Promise<import('puppeteer').Browser>}
 */
async function getSharedBrowser() {
  if (sharedBrowser && sharedBrowser.connected) {
    return sharedBrowser;
  }
  // Stale/disconnected handle — drop it.
  sharedBrowser = null;

  if (launching) return launching;

  launching = puppeteer
    .launch(baseLaunchOptions())
    .then((browser) => {
      sharedBrowser = browser;
      // Clear our reference if Chromium dies so the next call relaunches.
      browser.on('disconnected', () => {
        if (sharedBrowser === browser) sharedBrowser = null;
      });
      launching = null;
      console.log('Shared Puppeteer browser launched');
      return browser;
    })
    .catch((err) => {
      launching = null;
      throw err;
    });

  return launching;
}

/** Close the shared browser (used on graceful shutdown). */
async function closeSharedBrowser() {
  const browser = sharedBrowser;
  sharedBrowser = null;
  if (browser) {
    try {
      await browser.close();
    } catch {
      /* already gone */
    }
  }
}

module.exports = { puppeteer, getSharedBrowser, closeSharedBrowser };
