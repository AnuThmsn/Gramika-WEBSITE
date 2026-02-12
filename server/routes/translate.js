const express = require('express');
const router = express.Router();
const { translateText, translateBatch } = require('../utils/translator');

/**
 * Translate a single text string
 * POST /api/translate
 * Body: { text: "string", language: "ml" | "en" }
 */
router.post('/', async (req, res) => {
  try {
    const { text, language = 'ml' } = req.body;

    if (!text) {
      return res.status(400).json({ msg: 'Text is required' });
    }

    const translated = await translateText(text, language);
    return res.json({ original: text, translated, language });
  } catch (error) {
    console.error('Translation route error:', error);
    return res.status(500).json({ msg: 'Translation failed' });
  }
});

/**
 * Translate multiple texts in batch
 * POST /api/translate/batch
 * Body: { texts: ["string1", "string2"], language: "ml" | "en" }
 */
router.post('/batch', async (req, res) => {
  try {
    const { texts, language = 'ml' } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ msg: 'Texts array is required' });
    }

    const translated = await translateBatch(texts, language);
    return res.json({ originals: texts, translated, language });
  } catch (error) {
    console.error('Batch translation route error:', error);
    return res.status(500).json({ msg: 'Batch translation failed' });
  }
});

module.exports = router;
