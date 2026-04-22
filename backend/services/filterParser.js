/**
 * Extract filters from user messages for property search.
 * Supports English and Urdu/Hinglish keywords.
 * 
 * @param {string} message - User message
 * @returns {Object} Detected filters
 */
const extractFilters = (message) => {
  const filters = {};
  const msg = message.toLowerCase();

  // 1. BEDROOMS
  const bedroomMatch = msg.match(/(\d+)\s*(bedroom|bed|bhk|kamre|kamra|do kamre|teen kamre|char kamre)/i);
  if (bedroomMatch) {
    filters.bedrooms = parseInt(bedroomMatch[1]);
  } else if (msg.includes('do kamre')) filters.bedrooms = 2;
  else if (msg.includes('teen kamre')) filters.bedrooms = 3;
  else if (msg.includes('ek kamra')) filters.bedrooms = 1;

  // 2. CITY
  const cities = ["faisalabad", "lahore", "karachi", "islamabad", "rawalpindi", "multan", "peshawar", "gujranwala", "sialkot"];
  cities.forEach(city => {
    const cityRegex = new RegExp(`\\b${city}\\b`, 'i');
    if (cityRegex.test(msg)) {
      filters.city = city.charAt(0).toUpperCase() + city.slice(1);
    }
  });

  // 3. MAX PRICE
  const priceMatch = msg.match(/(under|below|max|budget|tak|se kam)\s*(pkr|rs\.)?\s*(\d+\s*k|\d+)/i);
  if (priceMatch) {
    let val = priceMatch[3].toLowerCase().replace(/\s/g, '');
    if (val.endsWith('k')) {
      filters.maxPrice = parseInt(val) * 1000;
    } else {
      filters.maxPrice = parseInt(val);
    }
  }
  // Urdu specific price keywords
  if (msg.includes('hazar')) {
    const hazarMatch = msg.match(/(\d+)\s*hazar/);
    if (hazarMatch) filters.maxPrice = parseInt(hazarMatch[1]) * 1000;
  }

  // 4. TYPE
  const types = ["flat", "apartment", "house", "room", "portion", "studio", "plot", "shop", "office", "ghar", "makaan"];
  types.forEach(type => {
    if (msg.includes(type)) {
      if (type === 'ghar' || type === 'makaan') filters.type = 'house';
      else filters.type = type;
    }
  });

  // 5. PURPOSE
  if (msg.includes('rent') || msg.includes('kiraye') || msg.includes('kiraya')) filters.purpose = 'rent';
  if (msg.includes('buy') || msg.includes('khareedna') || msg.includes('sale')) filters.purpose = 'buy';

  // 6. FURNISHING
  if (msg.includes('furnished') && !msg.includes('unfurnished') && !msg.includes('semi')) filters.furnishing = 'furnished';
  if (msg.includes('semi-furnished') || msg.includes('semi furnished')) filters.furnishing = 'semi-furnished';
  if (msg.includes('unfurnished')) filters.furnishing = 'unfurnished';

  return filters;
};

/**
 * Merges current filters with filters extracted from recent conversation history.
 * 
 * @param {Array} history - Array of {role: string, content: string}
 * @param {Object} currentFilters - Filters from the latest message
 */
const mergeConversationFilters = (history, currentFilters) => {
  const merged = { ...currentFilters };
  const recentUserMessages = history
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content);
  
  for (const msg of recentUserMessages) {
    const pastFilters = extractFilters(msg);
    // Only fill in missing fields, don't overwrite current message's filters
    Object.keys(pastFilters).forEach(key => {
      if (!merged[key] && pastFilters[key]) {
        merged[key] = pastFilters[key];
      }
    });
  }
  return merged;
};

module.exports = { extractFilters, mergeConversationFilters };

