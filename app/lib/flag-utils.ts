/**
 * Utility function to get flag image URL
 * Uses flagcdn.com CDN for country flag PNG images
 * Converts 3-letter ISO codes to 2-letter ISO codes required by flagcdn.com
 */

// Mapping from 3-letter ISO 3166-1 alpha-3 codes to 2-letter ISO 3166-1 alpha-2 codes
const threeLetterToTwoLetter: Record<string, string> = {
  'MEX': 'mx', 'CAN': 'ca', 'USA': 'us', 'ARG': 'ar', 'BRA': 'br',
  'CHI': 'cl', 'PAR': 'py', 'PER': 'pe', 'URU': 'uy', 'COL': 'co',
  'ECU': 'ec', 'VEN': 've', 'BOL': 'bo', 'ENG': 'gb-eng', 'FRA': 'fr',
  'GER': 'de', 'ESP': 'es', 'ITA': 'it', 'NED': 'nl', 'BEL': 'be',
  'POR': 'pt', 'POL': 'pl', 'CZE': 'cz', 'RUS': 'ru', 'UKR': 'ua',
  'TUR': 'tr', 'GRE': 'gr', 'MAR': 'ma', 'EGY': 'eg', 'NGA': 'ng',
  'SEN': 'sn', 'RSA': 'za', 'TUN': 'tn', 'ALG': 'dz', 'GHA': 'gh',
  'CIV': 'ci', 'COD': 'cd', 'JPN': 'jp', 'KOR': 'kr', 'AUS': 'au',
  'CHN': 'cn', 'SAU': 'sa', 'IRI': 'ir', 'IRQ': 'iq', 'JOR': 'jo',
  'UZB': 'uz', 'QAT': 'qa', 'SUI': 'ch', 'BIH': 'ba', 'SCO': 'gb-sct',
  'SWE': 'se', 'NOR': 'no', 'AUT': 'at', 'CRO': 'hr', 'NZL': 'nz',
  'HAI': 'ht', 'PAN': 'pa', 'CUW': 'cw', 'CPV': 'cv',
};

export function getFlagImageUrl(countryCode: string): string {
  const twoLetterCode = threeLetterToTwoLetter[countryCode.toUpperCase()] || countryCode.toLowerCase();
  return `https://flagcdn.com/w320/${twoLetterCode}.png`;
}
