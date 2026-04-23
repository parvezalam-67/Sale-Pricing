import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import axios from 'axios';

export const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware - Register IMMEDIATELY for Vercel compatibility
app.use(cors());
app.use(express.json());

// ─── Server-side cache to avoid Google Sheets CDN stale responses ────────────
// Google's published CSV URL has ~2-5 min CDN propagation delay.
// We cache the last-known-good response per GID, and expose a ?force=1 flag
// that bypasses the cache (used by the manual "Force Refresh" button in the UI).
// The background poller uses the normal 30s cache to avoid hammering Google.

interface CacheEntry { data: string; fetchedAt: number; }
const sheetCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 30_000; // 30 s — background polls reuse this

const SHEET_BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtttJgxlXlRGy84m6PfCqE-R_YmkAPujL1CkyhHhjNmPDMz5nXKVznj6ybpIn2uVjQzhoce9Yi-Jgl/pub';

async function fetchSheetFresh(gid: string): Promise<string> {
  const maxRetries = 3;
  let attempts = 0;

  const tryFetch = async (): Promise<string> => {
    attempts++;
    try {
      const response = await axios.get(SHEET_BASE_URL, {
        params: { output: 'csv', gid, single: 'true', t: Date.now() },
        timeout: 30000,
        // Aggressive cache-busting headers so Google serves a fresh copy
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/csv, application/csv, text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        // Prevent axios from reusing a cached response
        decompress: true,
      });
      return response.data as string;
    } catch (error: any) {
      if (attempts < maxRetries && (!error.response || error.response.status >= 500)) {
        await new Promise(r => setTimeout(r, 1000 * attempts));
        return tryFetch();
      }
      throw error;
    }
  };

  return tryFetch();
}

// Proxy endpoint for Google Sheets - Register IMMEDIATELY
app.get('/api/proxy-sheet', async (req, res) => {
  const gid = String(req.query.gid || '0');
  const force = req.query.force === '1'; // ?force=1 bypasses cache

  try {
    const now = Date.now();
    const cached = sheetCache[gid];
    const isFresh = cached && (now - cached.fetchedAt) < CACHE_TTL_MS;

    let data: string;

    if (!force && isFresh) {
      // Serve from cache — fast, no Google round-trip
      data = cached.data;
      res.setHeader('X-Cache', 'HIT');
    } else {
      // Fetch fresh from Google
      data = await fetchSheetFresh(gid);
      sheetCache[gid] = { data, fetchedAt: now };
      res.setHeader('X-Cache', 'MISS');
    }

    // Tell the browser never to cache this endpoint — freshness is server-controlled
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/csv');
    res.send(data);
  } catch (error: any) {
    // On error, serve stale cache rather than failing entirely
    if (sheetCache[gid]) {
      console.warn(`[proxy-sheet] Fetch failed for gid=${gid}, serving stale cache`);
      res.setHeader('X-Cache', 'STALE');
      res.setHeader('Content-Type', 'text/csv');
      res.send(sheetCache[gid].data);
    } else if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(504).json({ error: 'Gateway Timeout or Connection Failed after retries' });
    }
  }
});

// Webhook endpoint - Register IMMEDIATELY
app.post('/api/webhook/sheet-update', (req, res) => {
  console.log('Received update signal from Google Sheet');
  io.emit('sheet-updated', { timestamp: Date.now() });
  res.status(200).json({ success: true, message: 'Update signal broadcasted' });
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer().catch(err => console.error('Failed to start server:', err));
