import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout, addFavorite, removeFavorite, getFavorites } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [favorites, setFavorites] = useState([]); // array of saved favorite objects
  const [favIds, setFavIds] = useState(new Set()); // Set of animeIds for O(1) lookup

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        try {
          const favs = await getFavorites(firebaseUser.uid);
          setFavorites(favs);
          setFavIds(new Set(favs.map((f) => f.animeId)));
        } catch {
          setFavorites([]);
          setFavIds(new Set());
        }
      } else {
        setFavorites([]);
        setFavIds(new Set());
      }
    });
    return unsub;
  }, []);

  const handleLogin = useCallback(async () => {
    await loginWithGoogle();
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
  }, []);

  const toggleFavorite = useCallback(async (anime) => {
    if (!user) return;
    const id = anime.mal_id;
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
          genres: anime.genres?.map((g) => g.name) || [],
        },
      ]);
    }
  }, [user, favIds]);

  const isFavorite = useCallback((animeId) => favIds.has(animeId), [favIds]);

  return (
    <AuthContext.Provider value={{ user, authLoading, favorites, isFavorite, toggleFavorite, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
