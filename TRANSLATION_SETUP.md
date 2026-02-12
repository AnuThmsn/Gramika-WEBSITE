# LibreTranslate (Self-hosted) Setup Guide

## Overview
This application now supports dynamic language translation using LibreTranslate — a free, open-source translation engine you can self-host. Self-hosting avoids per-character costs and keeps translation data private.

## Why LibreTranslate?
- Cost: Free when self-hosted (you control the server)
- Privacy: Translations stay on your server
- Easy to run locally or on a VPS (Docker or Python)

## Options to Run LibreTranslate

### Option A — Quick Python install (for dev / local testing)
Install:
```bash
pip install libretranslate
```
Run:
```bash
libretranslate
```
This will start a server on `http://localhost:5000` by default. Example request:
```bash
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{"q":"Hello world","source":"en","target":"ml"}'
```

### Option B — Docker (recommended for production)
```bash
# map the container port 5000 to a different host port to avoid colliding
# with this Node app which commonly runs on host port 5000.
docker run -ti -p 5001:5000 libretranslate/libretranslate
```
Now the service is available at `http://<your-server>:5001`.

### Optional: Hosted/Public Instances
There are public LibreTranslate instances (e.g., libretranslate.com) but many require an API key or paid plan for production use. Self-hosting is recommended for predictable cost and privacy.

## Integration Details (what changed)

- Backend now calls a configurable LibreTranslate server.
- You can configure the URL via env: `LIBRETRANSLATE_URL` (default `http://localhost:5000`).
- If a hosted instance requires a key, set `LIBRETRANSLATE_API_KEY`.
- Frontend uses batch translation to reduce requests and caches results.

## Environment variables

Add to `server/.env` (example). Note the default used by the app is `http://localhost:5001` to avoid collisions with the Node server running on port 5000:

```env
# URL of your LibreTranslate server (e.g. http://localhost:5001)
LIBRETRANSLATE_URL=http://localhost:5001

# Optional: API key for a hosted LibreTranslate provider
LIBRETRANSLATE_API_KEY=
```

## API Endpoints (unchanged)

The app exposes the same translation endpoints on the backend:

POST /api/translate
POST /api/translate/batch

Request/response shapes remain as before. The backend forwards requests to your LibreTranslate server.

## Example: calling LibreTranslate from JS (frontend)

```javascript
const res = await fetch("http://your-server-ip:5000/translate", {
  method: "POST",
  body: JSON.stringify({ q: "How are you?", source: "en", target: "ml" }),
  headers: { "Content-Type": "application/json" }
});
const data = await res.json();
console.log(data.translatedText);
```

## Translation Service Usage (React)

```javascript
import { translateText, translateBatch } from '../services/translationService';

// Single translation
const translated = await translateText('Hello', 'ml');

// Batch translation (recommended)
const texts = ['BUY', 'ABOUT', 'CART'];
const translated = await translateBatch(texts, 'ml');
```

## Next Steps & Recommendations

1. Deploy LibreTranslate on a small VPS (eg. $5/month) using Docker for reliability.
2. Restrict access to the LibreTranslate instance (API key, firewall) if it's public-facing.
3. Use the batch endpoint and caching (already implemented) to minimize load and latency.

## File Structure

```
server/
├── utils/
│   └── translator.js          # LibreTranslate wrapper
└── routes/
    └── translate.js           # Translation endpoints (used by frontend)

src/
├── services/
│   └── translationService.js  # Frontend translation service
└── components/
    └── Header.jsx             # Uses translation service
```

## Security Notes

- Keep your LibreTranslate instance behind a firewall or restrict access if you host it publicly.
- If using a hosted provider, set `LIBRETRANSLATE_API_KEY` and keep it private.

If you want, I can generate a one-click script to install LibreTranslate on Ubuntu (Docker), or provide a Docker Compose snippet to run it alongside this app.
