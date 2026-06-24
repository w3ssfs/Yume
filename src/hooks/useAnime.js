import { useState, useEffect, useCallback } from 'react';
import jikanApi from '../services/jikanApi';

const cache = new Map();

function useAnimeList(cacheKey, fetchFn, deps = []) {
  const [data, setData] = useState(() => {
    return cache.get(cacheKey)?.data || [];
  });

  const [pagination, setPagination] = useState(() => {
    return cache.get(cacheKey)?.pagination || null;
  });

  const [loading, setLoading] = useState(!cache.has(cacheKey));

  const load = useCallback(async () => {
  
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);

      setData(cached.data);
      setPagination(cached.pagination);
      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      const result = await fetchFn();

      const cacheData = {
        data: result.data || result,
        pagination: result.pagination || null
      };

      cache.set(cacheKey, cacheData);

      setData(cacheData.data);
      setPagination(cacheData.pagination);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFn]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    pagination,
    reload: load
  };
}


export function useCurrentSeason(page = 1) {
  return useAnimeList(
    `season-${page}`,
    () => jikanApi.getCurrentSeason(page),
    [page]
  );
}


export function useTrendingAnime(limit = 12, page = 1) {
  return useAnimeList(
    `trending-${limit}-${page}`,
    () => jikanApi.getTrendingAnime(limit, page),
    [limit, page]
  );
}

export function useTopRatedAnime(limit = 12, page = 1) {
  return useAnimeList(
    `rating-${limit}-${page}`,
    () => jikanApi.getTopRatedAnime(limit, page),
    [limit, page]
  );
}

export function useUpcomingAnime(limit = 12, page = 1) {
  return useAnimeList(
    `upcoming-${limit}-${page}`,
    () => jikanApi.getUpcomingAnime(limit, page),
    [limit, page]
  );
}



export function useFeatured() {
  return useAnimeList(
    'featured',
    () => jikanApi.getFeatured(),
    []
  );
}



export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  const search = useCallback(async (query, limit = 5, page = 1) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const cacheKey = `search-${query}-${limit}-${page}`;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);

      setResults(cached.data);
      setPagination(cached.pagination);

      return;
    }

    try {
      setLoading(true);

      const result = await jikanApi.searchAnime(
        query,
        limit,
        page
      );

      cache.set(cacheKey, result);

      setResults(result.data);
      setPagination(result.pagination);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setPagination(null);
  }, []);

  return {
    results,
    loading,
    pagination,
    search,
    clear
  };
}



export function useAnimeDetail(animeId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!animeId) return;

    const cacheKey = `detail-${animeId}`;

    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey));
      return;
    }

    setLoading(true);

    jikanApi
      .getAnimeById(animeId)
      .then((res) => {
        cache.set(cacheKey, res);
        setData(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [animeId]);

  return { data, loading };
}



export function useAnimeRelations(animeId) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!animeId) return;

    const cacheKey = `relations-${animeId}`;

    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey));
      return;
    }

    jikanApi
      .getAnimeRelations(animeId)
      .then((res) => {
        cache.set(cacheKey, res);
        setData(res);
      })
      .catch(() => {});
  }, [animeId]);

  return data;
}