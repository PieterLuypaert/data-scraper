const axios = require('axios');
const { safeLookup } = require('./ssrfGuard');
const config = require('../config');

// Per-origin robots.txt cache. Fetching robots.txt on every scrape would be
// wasteful, so we keep parsed rules for a while.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map();

/**
 * Turn a robots.txt path pattern into a prefix-matching RegExp.
 * Supports `*` (any sequence) and `$` (end-of-URL anchor) per the de-facto spec.
 */
function patternToRegex(pattern) {
  let re = '';
  for (const ch of pattern) {
    if (ch === '*') re += '.*';
    else if (ch === '$') re += '$';
    else re += ch.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + re);
}

/**
 * Parse robots.txt text into rule groups keyed by user-agent token.
 * @returns {Map<string, Array<{type:'allow'|'disallow', path:string, re:RegExp}>>}
 */
function parseRobots(text) {
  const groups = new Map();
  let currentAgents = [];
  let expectingRules = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;

    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === 'user-agent') {
      // A user-agent line after rules starts a new group.
      if (expectingRules) {
        currentAgents = [];
        expectingRules = false;
      }
      currentAgents.push(value.toLowerCase());
      if (!groups.has(value.toLowerCase())) groups.set(value.toLowerCase(), []);
    } else if (field === 'allow' || field === 'disallow') {
      expectingRules = true;
      for (const agent of currentAgents) {
        // An empty Disallow means "allow everything" — represented as no rule.
        if (field === 'disallow' && value === '') continue;
        groups.get(agent).push({
          type: field,
          path: value,
          re: patternToRegex(value),
        });
      }
    }
  }
  return groups;
}

/** Pick the rule list that applies to us (our token first, else `*`). */
function rulesForAgent(groups) {
  const token = (config.ROBOTS_USER_AGENT || 'datascraper').toLowerCase();
  return groups.get(token) || groups.get('*') || [];
}

async function fetchRules(origin) {
  const cached = cache.get(origin);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rules;
  }

  let rules = [];
  try {
    const res = await axios.get(`${origin}/robots.txt`, {
      timeout: 8000,
      lookup: safeLookup,
      maxRedirects: 3,
      // 4xx/5xx shouldn't throw — a missing robots.txt means "allow all".
      validateStatus: (s) => s >= 200 && s < 500,
      headers: { 'User-Agent': config.USER_AGENT },
      responseType: 'text',
    });
    if (res.status >= 200 && res.status < 300 && typeof res.data === 'string') {
      rules = rulesForAgent(parseRobots(res.data));
    }
  } catch {
    // Network error / no robots.txt → treat as allowed.
    rules = [];
  }

  cache.set(origin, { rules, fetchedAt: Date.now() });
  return rules;
}

/**
 * Check whether `url` may be scraped according to the site's robots.txt.
 * Fails open (allowed) when robots.txt is missing or unreachable.
 * @returns {Promise<{allowed: boolean, rule?: string}>}
 */
async function isAllowed(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: true };
  }
  const origin = `${parsed.protocol}//${parsed.host}`;
  const path = parsed.pathname + parsed.search;

  const rules = await fetchRules(origin);
  if (rules.length === 0) return { allowed: true };

  // Most specific (longest pattern) matching rule wins; Allow beats Disallow on ties.
  let best = null;
  for (const rule of rules) {
    if (!rule.re.test(path)) continue;
    if (
      !best ||
      rule.path.length > best.path.length ||
      (rule.path.length === best.path.length && rule.type === 'allow')
    ) {
      best = rule;
    }
  }

  if (best && best.type === 'disallow') {
    return { allowed: false, rule: best.path };
  }
  return { allowed: true };
}

module.exports = { isAllowed, _parseRobots: parseRobots };
