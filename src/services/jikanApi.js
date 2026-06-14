import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
});

// ===== CONFIG =====

const CACHE_TTL = 1000 * 60 * 10; // 10 min
const cache = new Map();
const pendingRequests = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ===== CACHE =====

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;

  const isExpired = Date.now() - item.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}


const MIN_GAP_MS = 400; 
let queue = Promise.resolve();

function enqueue(task) {
  const run = () => task();
  const result = queue.then(run, run); 
 
  queue = result.then(
    () => sleep(MIN_GAP_MS),
    () => sleep(MIN_GAP_MS)
  );
  return result;
}


async function requestWithCache(key, endpoint, retries = 4) {
  const cached = getCache(key);
  if (cached) return cached;


  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = (async () => {
    let attempt = 0;
   
    while (true) {
      try {
        const response = await enqueue(() => api.get(endpoint));
        const data = response.data;
        setCache(key, data);
        return data;
      } catch (error) {
        const status = error.response?.status;

        if (status === 429 && attempt < retries) {
         
          const backoff = 1000 * Math.pow(2, attempt);
          await sleep(backoff);
          attempt += 1;
          continue;
        }

        throw error;
      }
    }
  })();

  pendingRequests.set(key, promise);

  try {
    return await promise;
  } finally {
    pendingRequests.delete(key);
  }
}

export const jikanApi = {
  async getCurrentSeason(page = 1) {
    const data = await requestWithCache(`season-${page}`, `/seasons/now?limit=24&page=${page}`);
    return { data: data.data, pagination: data.pagination };
  },

  async getTopAnime(limit = 24, page = 1) {
    const data = await requestWithCache(`top-${limit}-${page}`, `/top/anime?limit=${limit}&filter=bypopularity&page=${page}`);
    return { data: data.data, pagination: data.pagination };
  },

  async getTrendingAnime(limit = 24, page = 1) {
    const data = await requestWithCache(`trending-${limit}-${page}`, `/top/anime?limit=${limit}&filter=airing&page=${page}`);
    return { data: data.data, pagination: data.pagination };
  },

  async getTopRatedAnime(limit = 24, page = 1) {
    const data = await requestWithCache(`rated-${limit}-${page}`, `/top/anime?limit=${limit}&filter=byrating&page=${page}`);
    return { data: data.data, pagination: data.pagination };
  },

  async getUpcomingAnime(limit = 24, page = 1) {
    const data = await requestWithCache(`upcoming-${limit}-${page}`, `/top/anime?limit=${limit}&filter=upcoming&page=${page}`);
    return { data: data.data, pagination: data.pagination };
  },

  async searchAnime(query, limit = 5, page = 1) {
    const data = await requestWithCache(
      `search-${query}-${limit}-${page}`,
      `/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true&page=${page}`
    );
    return { data: data.data, pagination: data.pagination };
  },

  async getAnimeById(id) {
    const data = await requestWithCache(`anime-${id}`, `/anime/${id}/full`);
    return data.data;
  },

  async getAnimeRelations(id) {
    const data = await requestWithCache(`relations-${id}`, `/anime/${id}/relations`);
    return data.data;
  },

  async getFeatured() {
    const data = await requestWithCache('featured', '/top/anime?filter=airing&limit=5');
    return data.data;
  },

  
  async _rawFetch(endpoint) {
    const data = await requestWithCache(`raw-${endpoint}`, endpoint);
    return { data: data.data, pagination: data.pagination };
  },

  clearCache() {
    cache.clear();
  },

  removeCache(key) {
    cache.delete(key);
  },
};

export default jikanApi;
