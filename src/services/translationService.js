// Translation cache to avoid redundant API calls
const translationCache = new Map();

/**
 * Get cache key for a text and language pair
 */
const getCacheKey = (text, language) => `${language}:${text}`;

/**
 * Translate text using backend Google Translate API
 */
export const translateText = async (text, language = 'ml') => {
  if (!text || language === 'en') return text;

  const cacheKey = getCacheKey(text, language);
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    });

    if (!response.ok) {
      console.error('Translation API error:', response.status);
      return text;
    }

    const data = await response.json();
    const translated = data.translated || text;
    
    // Cache the translation
    translationCache.set(cacheKey, translated);
    
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

/**
 * Translate multiple texts in batch
 */
export const translateBatch = async (texts, language = 'ml') => {
  if (!Array.isArray(texts) || texts.length === 0 || language === 'en') {
    return texts;
  }

  try {
    const response = await fetch('/api/translate/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, language })
    });

    if (!response.ok) {
      console.error('Batch translation API error:', response.status);
      return texts;
    }

    const data = await response.json();
    const translated = data.translated || texts;
    
    // Cache each translation
    translated.forEach((trans, index) => {
      const cacheKey = getCacheKey(texts[index], language);
      translationCache.set(cacheKey, trans);
    });

    return translated;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
};

/**
 * Clear translation cache (useful for debugging or memory management)
 */
export const clearTranslationCache = () => {
  translationCache.clear();
};

/**
 * Get cache size
 */
export const getCacheSize = () => {
  return translationCache.size;
};

export default {
  translateText,
  translateBatch,
  clearTranslationCache,
  getCacheSize
};
