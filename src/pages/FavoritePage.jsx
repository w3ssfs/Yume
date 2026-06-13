import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHome, FiChevronRight, FiSearch, FiX,
  FiHeart, FiBookmark, FiFilter,
} from 'react-icons/fi';
import Header from '../components/Header/Header';
import { useAuth } from '../context/AuthContext';
import { useDetail } from '../context/DetailContext';
import './FavoritePage.css';
import AnimeCard from '../components/AnimeCard/AnimeCard';

/* ── Mini anime card for local favorites ── */


/* ── Filter bar ── */
function FilterBar({ search, onSearch, genre, onGenre, year, onYear, allGenres, allYears, onClear }) {
  const hasFilter = search || genre || year;
  return (
    <div className="fav-filters">
      <div className="fav-search-wrap">
        <FiSearch size={15} className="fav-search-icon" />
        <input
          className="fav-search"
          placeholder="Buscar nos favoritos..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button className="fav-search-clear" onClick={() => onSearch('')}><FiX size={13} /></button>
        )}
      </div>

      <select className="fav-select" value={genre} onChange={(e) => onGenre(e.target.value)}>
        <option value="">Todos os gêneros</option>
        {allGenres.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>

      <select className="fav-select" value={year} onChange={(e) => onYear(e.target.value)}>
        <option value="">Todos os anos</option>
        {allYears.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>

      {hasFilter && (
        <motion.button className="fav-clear-btn" onClick={onClear}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <FiX size={13} /> Limpar
        </motion.button>
      )}
    </div>
  );
}

/* ── Empty state ── */
function Empty({ tab }) {
  const navigate = useNavigate();
  return (
    <motion.div className="fav-empty"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <span className="fav-empty__icon">{tab === 'favorites' ? '💜' : '📌'}</span>
      <h3>{tab === 'favorites' ? 'Nenhum favorito ainda' : 'Lista vazia'}</h3>
      <p>{tab === 'favorites'
        ? 'Explore animes e clique em ❤️ para favoritar.'
        : 'Adicione animes com 🔖 para assistir depois.'}</p>
      <motion.button className="fav-empty__btn" onClick={() => navigate('/browse')}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        Explorar Animes →
      </motion.button>
    </motion.div>
  );
}

/* ── Not logged in ── */
function NotLoggedIn() {
  const { handleLogin } = useAuth();
  return (
    <motion.div className="fav-empty"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <span className="fav-empty__icon">🔒</span>
      <h3>Entre para ver seus favoritos</h3>
      <p>Faça login com o Google para salvar e acessar sua lista de animes.</p>
      <motion.button className="fav-empty__btn" onClick={handleLogin}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        Entrar com Google
      </motion.button>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function FavoritesPage() {
  const { user, favorites, watchlist } = useAuth();
  const [tab, setTab] = useState('favorites'); // 'favorites' | 'watchlist'
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');

  const activeList = tab === 'favorites' ? favorites : watchlist;

  /* Collect all genres and years for filter dropdowns */
  const { allGenres, allYears } = useMemo(() => {
    const genres = new Set();
    const years = new Set();
    activeList.forEach((a) => {
      (a.genres || []).forEach((g) => genres.add(typeof g === 'string' ? g : g.name));
      if (a.year) years.add(String(a.year));
    });
    return {
      allGenres: [...genres].sort(),
      allYears: [...years].sort((a, b) => b - a),
    };
  }, [activeList]);

  /* Filtered list */
  const filtered = useMemo(() => {
    return activeList.filter((a) => {
      const titleMatch = !search || (a.title || '').toLowerCase().includes(search.toLowerCase());
      const genreList = (a.genres || []).map((g) => (typeof g === 'string' ? g : g.name));
      const genreMatch = !genre || genreList.includes(genre);
      const yearMatch = !year || String(a.year) === year;
      return titleMatch && genreMatch && yearMatch;
    });
  }, [activeList, search, genre, year]);

  const clearFilters = () => { setSearch(''); setGenre(''); setYear(''); };

  return (
    <div className="fav-page">
      <Header />
      <div className="fav-page__inner container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb__item"><FiHome size={14} />Home</Link>
          <FiChevronRight size={13} className="breadcrumb__sep" />
          <span className="breadcrumb__item breadcrumb__item--active">Meus Favoritos</span>
        </nav>

        <div className="fav-page__head">
          <div>
            <h1 className="fav-page__title">Meus Animes</h1>
            <p className="fav-page__sub">Gerencie sua coleção pessoal</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="fav-tabs">
          {[
            { key: 'favorites', label: 'Favoritos', icon: <FiHeart size={15} />, count: favorites.length },
            { key: 'watchlist', label: 'Assistir Depois', icon: <FiBookmark size={15} />, count: watchlist.length },
          ].map((t) => (
            <motion.button
              key={t.key}
              className={`fav-tab ${tab === t.key ? 'fav-tab--active' : ''}`}
              onClick={() => { setTab(t.key); clearFilters(); }}
              whileTap={{ scale: 0.97 }}
            >
              {t.icon} {t.label}
              <span className="fav-tab__count">{t.count}</span>
            </motion.button>
          ))}
        </div>

        {!user ? (
          <NotLoggedIn />
        ) : (
          <>
            {/* Filter bar */}
            {activeList.length > 0 && (
              <FilterBar
                search={search} onSearch={setSearch}
                genre={genre} onGenre={setGenre}
                year={year} onYear={setYear}
                allGenres={allGenres} allYears={allYears}
                onClear={clearFilters}
              />
            )}

            {/* Results info */}
            {(search || genre || year) && (
              <p className="fav-results-info">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                {search && ` para "${search}"`}
                {genre && ` • Gênero: ${genre}`}
                {year && ` • Ano: ${year}`}
              </p>
            )}

            {/* Grid */}
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Empty tab={tab} />
                </motion.div>
              ) : (
                <motion.div
                  key={tab}
                  className="fav-grid"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {filtered.map((anime) => (
                    <AnimeCard key={anime.animeId} anime={anime} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}