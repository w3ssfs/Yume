import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth, loginWithGoogle, logout,
  addFavorite, removeFavorite, getFavorites,
  addToWatchlist, removeFromWatchlist, getWatchlist,
} from '../services/firebase';

const AuthContext = createContext(null);

const SILENT_ERRORS = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/popup-blocked',
  'auth/user-cancelled',
];

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError]   = useState(null);
  const [favorites, setFavorites]     = useState([]);
  const [favIds, setFavIds]           = useState(new Set());
  const [watchlist, setWatchlist]     = useState([]);
  const [watchIds, setWatchIds]       = useState(new Set());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        try {
          const [favs, watch] = await Promise.all([
            getFavorites(firebaseUser.uid),
            getWatchlist(firebaseUser.uid),
          ]);
          setFavorites(favs);
          setFavIds(new Set(favs.map((f) => f.animeId)));
          setWatchlist(watch);
          setWatchIds(new Set(watch.map((w) => w.animeId)));
        } catch {
          
        }
      } else {
        setFavorites([]); setFavIds(new Set());
        setWatchlist([]); setWatchIds(new Set());
      }
    });
    return unsub;
  }, []);

  const handleLogin = useCallback(async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      const code = err?.code || '';
      if (!SILENT_ERRORS.includes(code)) {
        setLoginError('Erro ao entrar. Tente novamente.');
        setTimeout(() => setLoginError(null), 4000);
      }
      
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try { await logout(); } catch { /* silent */ }
  }, []);

  
  const toggleFavorite = useCallback(async (anime) => {
    if (!user) return;
    const id = anime.mal_id;
    try {
      if (favIds.has(id)) {
        await removeFavorite(user.uid, id);
        setFavIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
        setFavorites((prev) => prev.filter((f) => f.animeId !== id));
      } else {
        await addFavorite(user.uid, anime);
        setFavIds((prev) => new Set(prev).add(id));
        setFavorites((prev) => [
          ...prev,
          {
            animeId: id,
            title: anime.title_english || anime.title,
            image: anime.images?.jpg?.image_url || '',
            score: anime.score || null,
            year: anime.year || null,
            genres: anime.genres?.map((g) => g.name) || [],
          },
        ]);
      }
    } catch { /* silent */ }
  }, [user, favIds]);

  const isFavorite = useCallback((animeId) => favIds.has(animeId), [favIds]);

  /* ── Watchlist ── */
  const toggleWatchlist = useCallback(async (anime) => {
    if (!user) return;
    const id = anime.mal_id;
    try {
      if (watchIds.has(id)) {
        await removeFromWatchlist(user.uid, id);
        setWatchIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
        setWatchlist((prev) => prev.filter((w) => w.animeId !== id));
      } else {
        await addToWatchlist(user.uid, anime);
        setWatchIds((prev) => new Set(prev).add(id));
        setWatchlist((prev) => [
          ...prev,
          {
            animeId: id,
            title: anime.title_english || anime.title,
            image: anime.images?.jpg?.image_url || '',
            score: anime.score || null,
            year: anime.year || null,
            genres: anime.genres?.map((g) => g.name) || [],
          },
        ]);
      }
    } catch { /* silent */ }
  }, [user, watchIds]);

  const isInWatchlist = useCallback((animeId) => watchIds.has(animeId), [watchIds]);

  return (
    <AuthContext.Provider value={{
      user, authLoading, loginError,
      favorites, isFavorite, toggleFavorite,
      watchlist, isInWatchlist, toggleWatchlist,
      handleLogin, handleLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}