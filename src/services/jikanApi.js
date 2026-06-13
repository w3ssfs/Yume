import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
});
api.interceptors.response.use(
  response => response,
  async error => {

    if (error.response?.status === 429) {

      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      return api(error.config);
    }

    return Promise.reject(error);
  }
);
// ===== CONFIG =====

const CACHE_TTL = 1000 * 60 * 10; // 10 min

const cache = new Map();
const pendingRequests = new Map();



const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ===== CACHE =====

function getCache(key) {
  const item = cache.get(key);

  if (!item) return null;

  const isExpired =
    Date.now() - item.timestamp > CACHE_TTL;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return item.data;
}



function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// ===== REQUEST =====

async function requestWithCache(
  key,
  endpoint,
  retries = 2
) {
  const cached = getCache(key);

  if (cached) {
    return cached;
  }

  // Evita chamadas duplicadas simultâneas
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = (async () => {
    try {
      const response = await api.get(endpoint);

      const data = response.data;

      setCache(key, data);

      return data;
    } catch (error) {
      const status = error.response?.status;

      // Retry para Rate Limit
      if (status === 429 && retries > 0) {
        await sleep(1500);

        return requestWithCache(
          key,
          endpoint,
          retries - 1
        );
      }

      throw error;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);

  return promise;
}

// ===== API =====

export const jikanApi = {
  async getCurrentSeason(page = 1) {
    const data = await requestWithCache(
      `season-${page}`,
      `/seasons/now?limit=24&page=${page}`
    );

    return {
      data: data.data,
      pagination: data.pagination,
    };
  },

  async getTopAnime(limit = 24, page = 1) {
    const data = await requestWithCache(
      `top-${limit}-${page}`,
      `/top/anime?limit=${limit}&filter=bypopularity&page=${page}`
    );

    return {
      data: data.data,
      pagination: data.pagination,
    };
  },

  async getTrendingAnime(limit = 24, page = 1) {
    const data = await requestWithCache(
      `trending-${limit}-${page}`,
      `/top/anime?limit=${limit}&filter=airing&page=${page}`
    );

    return {
      data: data.data,
      pagination: data.pagination,
    };
  },

  async getTopRatedAnime(limit = 24, page = 1) {
    const data = await requestWithCache(
      `rated-${limit}-${page}`,
      `/top/anime?limit=${limit}&filter=byrating&page=${page}`
    );

    return {
      data: data.data,
      pagination: data.pagination,
    };
  },

  async getUpcomingAnime(limit = 24, page = 1) {
    const data = await requestWithCache(
      `upcoming-${limit}-${page}`,
      `/top/anime?limit=${limit}&filter=upcoming&page=${page}`
    );

    return {
      data: data.data,
      pagination: data.pagination,
    };
  },

  async searchAnime(query, limit = 5, page = 1) {
    const data = await requestWithCache(
      `search-${query}-${limit}-${page}`,
      `/anime?q=${encodeURIComponent(
        query
      )}&limit=${limit}&sfw=true&page=${page}`
    );

    return {
      data: data.data,
      pagination: data.pagination,
    };
  },

  async getAnimeById(id) {
    const data = await requestWithCache(
      `anime-${id}`,
      `/anime/${id}/full`
    );

    return data.data;
  },

  async getAnimeRelations(id) {
    const data = await requestWithCache(
      `relations-${id}`,
      `/anime/${id}/relations`
    );

    return data.data;
  },

  async getFeatured() {
    const data = await requestWithCache(
      'featured',
      '/top/anime?filter=airing&limit=5'
    );

    return data.data;
  },

  clearCache() {
    cache.clear();
  },

  removeCache(key) {
    cache.delete(key);
  },
};

export default jikanApi;