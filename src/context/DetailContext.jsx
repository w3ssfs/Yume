import React, { createContext, useContext, useState, useCallback } from 'react';

const DetailContext = createContext(null);

export function DetailProvider({ children }) {
  const [selectedAnime, setSelectedAnime] = useState(null);

  const openDetail = useCallback((anime) => setSelectedAnime(anime), []);
  const closeDetail = useCallback(() => setSelectedAnime(null), []);

  return (
    <DetailContext.Provider value={{ selectedAnime, openDetail, closeDetail }}>
      {children}
    </DetailContext.Provider>
  );
}

export function useDetail() {
  return useContext(DetailContext);
}
