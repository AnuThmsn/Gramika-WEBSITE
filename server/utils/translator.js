const axios = require('axios');

/**
 * LibreTranslate-backed translator utility.
 * By default this will call a LibreTranslate server at the URL defined
 * by the environment variable `LIBRETRANSLATE_URL` (default: http://localhost:5000).
 *
 * Advantages:
 * - Can self-host (free) via Docker or Python package
 * - Keeps data private on your server
 *
 * Optional: If you want to use a hosted instance that requires an API key,
 * set `LIBRETRANSLATE_API_KEY` in the environment — the key will be sent as
 * the `api_key` field in the request body.
 */

const LIBRE_URL = process.env.LIBRETRANSLATE_URL || 'http://localhost:5001';

// If the app's PORT conflicts with the default libretranslate host:port,
// warn the developer. Our Node server commonly runs on port 5000 which
// would cause requests to hit this app instead of a LibreTranslate instance.
try {
  const nodePort = process.env.PORT || '5000';
  const parsed = new URL(LIBRE_URL);
  const librePort = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
  if (String(librePort) === String(nodePort)) {
    console.warn(`Warning: LIBRETRANSLATE_URL (${LIBRE_URL}) uses same port as Node server (${nodePort}).`);
    console.warn('If you are running LibreTranslate locally, run it on a different host/port (e.g., host:5001) or set LIBRETRANSLATE_URL accordingly.');
  }
} catch (e) {
  // ignore URL parse errors
}

async function translateText(text, targetLanguage = 'ml') {
  if (!text) return text;
  if (targetLanguage === 'en') return text;

  try {
    const payload = {
      q: text,
      source: 'en',
      target: targetLanguage,
      format: 'text'
    };
    if (process.env.LIBRETRANSLATE_API_KEY) payload.api_key = process.env.LIBRETRANSLATE_API_KEY;

    const targetUrl = `${LIBRE_URL.replace(/\/$/, '')}/translate`;
    const res = await axios.post(targetUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    // LibreTranslate returns { translatedText: '...' } for single q
    if (res.data && typeof res.data.translatedText === 'string') {
      return res.data.translatedText;
    }

    // Fallback: if API returns array of translations, take first
    if (res.data && Array.isArray(res.data) && res.data[0] && res.data[0].translatedText) {
      return res.data[0].translatedText;
    }

    return text;
  } catch (err) {
    console.error('LibreTranslate error:', err.message || err);
    return text;
  }
}

async function translateBatch(texts, targetLanguage = 'ml') {
  if (!Array.isArray(texts) || texts.length === 0) return texts;
  if (targetLanguage === 'en') return texts;

  try {
    const payload = {
      q: texts,
      source: 'en',
      target: targetLanguage,
      format: 'text'
    };
    if (process.env.LIBRETRANSLATE_API_KEY) payload.api_key = process.env.LIBRETRANSLATE_API_KEY;

    const targetUrl = `${LIBRE_URL.replace(/\/$/, '')}/translate`;
    const res = await axios.post(targetUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    });

    // LibreTranslate may return an array of translations when q is an array
    // Each item: { translatedText }
    if (res.data && Array.isArray(res.data)) {
      return res.data.map(item => item.translatedText || '');
    }

    // Some instances return { translatedText } even for array inputs — handle that
    if (res.data && res.data.translatedText && texts.length === 1) {
      return [res.data.translatedText];
    }

    return texts;
  } catch (err) {
    console.error('LibreTranslate batch error:', err.message || err);
    return texts;
  }
}

module.exports = { translateText, translateBatch };
