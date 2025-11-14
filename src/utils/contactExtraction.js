/**
 * Contact information extraction utilities
 */

/**
 * Extract email addresses from text
 * @param {string} text - Text to search
 * @returns {Array<string>} Array of email addresses
 */
export function extractEmails(text) {
  if (!text) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex) || [];
  return [...new Set(emails)]; // Remove duplicates
}

/**
 * Extract phone numbers from text
 * @param {string} text - Text to search
 * @returns {Array<string>} Array of phone numbers
 */
export function extractPhoneNumbers(text) {
  if (!text) return [];
  
  // Various phone number patterns
  const patterns = [
    /\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // International format
    /0\d{1,2}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g, // Dutch format
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/g, // US format
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g // General format
  ];

  const phones = new Set();
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      // Filter out numbers that are too short or too long
      const digits = match.replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 15) {
        phones.add(match.trim());
      }
    });
  });

  return Array.from(phones);
}

/**
 * Extract social media links
 * @param {Array} links - Array of link objects
 * @returns {Object} Object with social media links grouped by platform
 */
export function extractSocialMediaLinks(links) {
  const socialMedia = {
    facebook: [],
    twitter: [],
    linkedin: [],
    instagram: [],
    youtube: [],
    github: [],
    other: []
  };

  if (!links || !Array.isArray(links)) return socialMedia;

  links.forEach(link => {
    const url = typeof link === 'string' ? link : (link.href || link);
    if (!url) return;

    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('facebook.com')) {
      socialMedia.facebook.push(link);
    } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      socialMedia.twitter.push(link);
    } else if (urlLower.includes('linkedin.com')) {
      socialMedia.linkedin.push(link);
    } else if (urlLower.includes('instagram.com')) {
      socialMedia.instagram.push(link);
    } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      socialMedia.youtube.push(link);
    } else if (urlLower.includes('github.com')) {
      socialMedia.github.push(link);
    } else if (
      urlLower.includes('pinterest.com') ||
      urlLower.includes('tiktok.com') ||
      urlLower.includes('snapchat.com') ||
      urlLower.includes('reddit.com')
    ) {
      socialMedia.other.push(link);
    }
  });

  return socialMedia;
}

/**
 * Extract addresses from text
 * @param {string} text - Text to search
 * @returns {Array<string>} Array of potential addresses
 */
export function extractAddresses(text) {
  if (!text) return [];
  
  // Simple address pattern (street number + street name + city)
  const addressPattern = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Place|Pl)[\s,]+[A-Za-z\s]+(?:,\s*)?[A-Z]{2}\s+\d{5}/gi;
  const addresses = text.match(addressPattern) || [];
  
  return addresses.map(addr => addr.trim()).filter(Boolean);
}

/**
 * Extract all contact information from scraped data
 * @param {Object} data - Scraped data object
 * @returns {Object} Contact information object
 */
export function extractAllContactInfo(data) {
  const allText = [
    data.title || '',
    data.description || '',
    data.textPreview || '',
    data.fullText || '',
    ...(data.links || []).map(l => typeof l === 'string' ? l : (l.text || l.href || '')),
    ...(data.paragraphs || []).map(p => typeof p === 'string' ? p : (p.text || '')),
    ...Object.values(data.metaTags || {}),
    ...Object.values(data.openGraphTags || {}),
    ...Object.values(data.twitterTags || {})
  ].join(' ');

  return {
    emails: extractEmails(allText),
    phoneNumbers: extractPhoneNumbers(allText),
    addresses: extractAddresses(allText),
    socialMedia: extractSocialMediaLinks(data.links || [])
  };
}

