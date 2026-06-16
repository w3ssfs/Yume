import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

const http = axios.create({ baseURL: BASE_URL, timeout: 12000 });

// ─── Cache ──────────────────────────────────────────────────────────────────
const CACHE_TTL = 1000 * 60 * 15; // 15 min
const cache     = new Map();
const pending   = new Map();

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL) { cache.delete(key); return null; }
  return item.data;
}
function setCache(key, data) { cache.set(key, { data, ts: Date.now() }); }

// ─── Rate-limit: burst window (3 req/window, window = 500ms) ────────────────
// Jikan allows ~3 req/s. Instead of serialising ALL calls with a 400ms gap
// (which made 6 calls take 2.4s before any response), we track how many
// requests have fired in the current 500ms window and only pause when we've
// hit 3 in the same window. This lets the first 3 requests fire immediately
// (covering most homepage loads) while still preventing 429s.
const WINDOW_MS   = 500;
const MAX_PER_WIN = 3;
let windowStart   = 0;
let windowCount   = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rateLimited(fn) {
  const now = Date.now();
  if (now - windowStart >= WINDOW_MS) {
    // New window: reset
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= MAX_PER_WIN) {
    // Wait until the current window expires
    const wait = WINDOW_MS - (now - windowStart) + 10;
    await sleep(wait);
    windowStart = Date.now();
    windowCount = 0;
  }
  windowCount++;
  return fn();
}

// ─── Core fetch (cache → dedup → rate-limit → retry) ────────────────────────
async function get(key, endpoint) {
  const hit = getCache(key);
  if (hit) return hit;

  // Dedup concurrent identical requests
  if (pending.has(key)) return pending.get(key);

  const promise = (async () => {
    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        const res = await rateLimited(() => http.get(endpoint));
        setCache(key, res.data);
        return res.data;
      } catch (err) {
        if (err?.response?.status === 429 && attempt < 3) {
          await sleep(1000 * (attempt + 1)); // 1s, 2s, 3s
          continue;
        }
        throw err;
      }
    }
  })();

  pending.set(key, promise);
  try   { return await promise; }
  finally { pending.delete(key); }
}

// ─── Public API ──────────────────────────────────────────────────────────────
export const jikanApi = {
  async getCurrentSeason(page = 1) {
    const d = await get(`season-${page}`, `/seasons/now?limit=24&page=${page}`);
    return { data: d.data, pagination: d.pagination };
  },
  async getTopAnime(limit = 24, page = 1) {
    const d = await get(`top-${limit}-${page}`, `/top/anime?limit=${limit}&filter=bypopularity&page=${page}`);
    return { data: d.data, pagination: d.pagination };
  },
  async getTrendingAnime(limit = 24, page = 1) {
    const d = await get(`trending-${limit}-${page}`, `/top/anime?limit=${limit}&filter=airing&page=${page}`);
    return { data: d.data, pagination: d.pagination };
  },
  async getTopRatedAnime(limit = 24, page = 1) {
    const d = await get(`rated-${limit}-${page}`, `/top/anime?limit=${limit}&filter=byrating&page=${page}`);
    return { data: d.data, pagination: d.pagination };
  },
  async getUpcomingAnime(limit = 24, page = 1) {
    const d = await get(`upcoming-${limit}-${page}`, `/top/anime?limit=${limit}&filter=upcoming&page=${page}`);
    return { data: d.data, pagination: d.pagination };
  },
  async searchAnime(query, limit = 5, page = 1) {
    const d = await get(
      `search-${query}-${limit}-${page}`,
      `/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true&page=${page}`
    );
    return { data: d.data, pagination: d.pagination };
  },
  async getAnimeById(id) {
    const d = await get(`anime-${id}`, `/anime/${id}/full`);
    return d.data;
  },
  async getAnimeRelations(id) {
    const d = await get(`relations-${id}`, `/anime/${id}/relations`);
    return d.data;
  },
  // Fetch lightweight anime entry (for related cards — only images + title needed)
  async getAnimeBasic(id) {
    // Reuse full cache if already loaded; otherwise hit the same endpoint
    const full = getCache(`anime-${id}`);
    if (full) return full.data;
    const d = await get(`basic-${id}`, `/anime/${id}`);
    return d.data;
  },
  async getFeatured() {
    const d = await get('featured', '/top/anime?filter=airing&limit=5');
    return d.data;
  },
  async _rawFetch(endpoint) {
    const d = await get(`raw-${endpoint}`, endpoint);
    return { data: d.data, pagination: d.pagination };
  },
  clearCache() { cache.clear(); },
};

export default jikanApi;
