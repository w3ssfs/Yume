import { useState, useEffect, useCallback } from 'react';
import jikanApi from '../services/jikanApi';

function useAnimeList(fetchFn, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const load = useCallback(async (...args) => {
    setLoading(true);
    try {
      const result = await fetchFn(...args);
      setData(result.data || result);
      setPagination(result.pagination || null);
    } catch { setData([]); }
    finally { setLoading(false); }
  // eslint-disable-next-line
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, loading, pagination, reload: load };
}

export function useCurrentSeason(page = 1) {
  return useAnimeList(() => jikanApi.getCurrentSeason(page), [page]);
}

export function useTopAnime(limit = 20, page = 1) {
  return useAnimeList(() => jikanApi.getTopAnime(limit, page), [limit, page]);
}

export function useTrendingAnime(limit = 20, page = 1) {
  return useAnimeList(() => jikanApi.getTrendingAnime(limit, page), [limit, page]);
}

export function useTopRatedAnime(limit = 20, page = 1) {
  return useAnimeList(() => jikanApi.getTopRatedAnime(limit, page), [limit, page]);
}

export function useUpcomingAnime(limit = 20, page = 1) {
  return useAnimeList(() => jikanApi.getUpcomingAnime(limit, page), [limit, page]);
}

export function useFeatured() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    jikanApi.getFeatured().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);

  const search = useCallback(async (query, limit = 5, page = 1) => {
    if (!query || query.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await jikanApi.searchAnime(query, limit, page);
      setResults(res.data);
      setPagination(res.pagination);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const clear = useCallback(() => { setResults([]); setPagination(null); }, []);
  return { results, loading, pagination, search, clear };
}

export function useAnimeDetail(animeId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!animeId) return;
    setLoading(true);
    setData(null);
    jikanApi.getAnimeById(animeId).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [animeId]);
  return { data, loading };
}

export function useAnimeRelations(animeId) {
  const [data, setData] = useState([]);
  useEffect(() => {
    if (!animeId) return;
    jikanApi.getAnimeRelations(animeId).then(setData).catch(() => {});
  }, [animeId]);
  return data;
}
