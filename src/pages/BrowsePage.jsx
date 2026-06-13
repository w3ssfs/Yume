import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiChevronRight, FiSearch, FiX } from 'react-icons/fi';
import Header from '../components/Header/Header';
import BrowseCarousel from '../components/Browse/BrowseCarousel';
import AnimeGrid from '../components/Browse/AnimeGrid';
import { useDebounce } from '../hooks/useDebounce';
import { useSearch, useCurrentSeason, useTopAnime, useTrendingAnime, useTopRatedAnime, useUpcomingAnime } from '../hooks/useAnime';
import jikanApi from '../services/jikanApi';
import './BrowsePage.css';

const CATEGORIES = {
  browse: { label: 'Anime', desc: 'Browse top, airing and upcoming Anime.' },
  trending: { label: 'Trending Now', desc: 'View Anime that is trending right now.' },
  season: { label: 'Temporada 2026', desc: 'View Anime that aired in the current season.' },
  top100: { label: 'Top 100', desc: 'View highly rated Anime of all time.' },
  popular: { label: 'Popular', desc: 'View the most popular Anime of all time.' },
  upcoming: { label: 'Próximos', desc: 'View Anime that is airing in the upcoming seasons.' },
};

/* Breadcrumb */
function Breadcrumb({ category }) {
  const isDeep = category && category !== 'browse';
  return (
    <nav className="breadcrumb">
      <Link to="/" className="breadcrumb__item"><FiHome size={14} />Home</Link>
      <FiChevronRight size={13} className="breadcrumb__sep" />
      <Link to="/browse" className={`breadcrumb__item ${!isDeep ? 'breadcrumb__item--active' : ''}`}>
        Animes
      </Link>
      {isDeep && (
        <>
          <FiChevronRight size={13} className="breadcrumb__sep" />
          <span className="breadcrumb__item breadcrumb__item--active">
            {CATEGORIES[category]?.label || category}
          </span>
        </>
      )}
    </nav>
  );
}

/* Category row shown on main browse page */
function CategoryRow({ title, desc, items, loading, onViewAll }) {
  return (
    <div className="browse-cat-row">
      <div className="browse-cat-row__header">
        <div>
          <h2 className="browse-cat-row__title">{title}</h2>
          <p className="browse-cat-row__desc">{desc}</p>
        </div>
        <motion.button className="browse-cat-row__viewall" onClick={onViewAll}
          whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
          Ver todos →
        </motion.button>
      </div>
      <BrowseCarousel items={items} loading={loading} />
    </div>
  );
}

/* Full paginated category view */
function CategoryFullView({ category, searchQuery }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const { results: searchResults, loading: searchLoading, pagination: searchPag, search } = useSearch();
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    if (searchQuery) {
      search(searchQuery, 24, page);
      return;
    }
    setLoading(true);
    const fetchers = {
      trending: () => jikanApi.getTrendingAnime(24, page),
      season: () => jikanApi.getCurrentSeason(page),
      top100: () => jikanApi.getTopRatedAnime(24, page),
      popular: () => jikanApi.getTopAnime(24, page),
      upcoming: () => jikanApi.getUpcomingAnime(24, page),
      browse: () => jikanApi.getTopAnime(24, page),
    };
    const fn = fetchers[category] || fetchers.browse;
    fn().then((res) => {
      setData(res.data);
      setPagination(res.pagination);
    }).catch(() => setData([])).finally(() => setLoading(false));
  }, [category, page, searchQuery]);

  useEffect(() => {
    if (debouncedSearch) search(debouncedSearch, 24, page);
  }, [debouncedSearch, page]);

  const displayData = searchQuery ? searchResults : data;
  const displayPag = searchQuery ? searchPag : pagination;
  const isLoading = searchQuery ? searchLoading : loading;

  return (
    <div>
      <div className="browse-full-header">
        <h1 className="browse-full-title">{searchQuery ? `Resultados: "${searchQuery}"` : CATEGORIES[category]?.label}</h1>
        <p className="browse-full-desc">{CATEGORIES[category]?.desc}</p>
      </div>
      <AnimeGrid
        items={displayData}
        loading={isLoading}
        pagination={displayPag}
        page={page}
        onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    </div>
  );
}

/* Main Browse Page */
export default function BrowsePage() {
  const { category } = useParams(); // undefined = main browse page
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const debouncedLocal = useDebounce(localSearch, 500);

  const { data: trending, loading: l1 } = useTrendingAnime(12);
  const { data: season, loading: l2 } = useCurrentSeason(1);
  const { data: popular, loading: l3 } = useTopAnime(12);
  const { data: upcoming, loading: l4 } = useUpcomingAnime(12);

  useEffect(() => {
    setSearchQuery(debouncedLocal);
  }, [debouncedLocal]);

  const isCategory = !!category;
  const activeCategory = category || 'browse';

  return (
    <div className="browse-page">
      <Header />
      <div className="browse-page__inner container">
        <Breadcrumb category={category} />

        {/* Search bar */}
        <div className="browse-search-bar">
          <FiSearch size={16} className="browse-search-bar__icon" />
          <input
            className="browse-search-bar__input"
            type="text"
            placeholder="Buscar um Anime..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <motion.button className="browse-search-bar__clear"
              onClick={() => { setLocalSearch(''); setSearchQuery(''); }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <FiX size={14} />
            </motion.button>
          )}
          {/* Filter dropdowns – decorative for now */}
          <div className="browse-filters">
            {['Gêneros', 'Tipo', 'Status', 'Min Score'].map((f) => (
              <select key={f} className="browse-filter-select">
                <option>{f}</option>
              </select>
            ))}
          </div>
        </div>

        {/* If no category selected (main browse page) and no search: show category rows */}
        {!isCategory && !searchQuery ? (
          <div className="browse-categories">
            <CategoryRow title="Trending Anime" desc="View Anime that is trending right now."
              items={trending} loading={l1} onViewAll={() => navigate('/browse/trending')} />
            <CategoryRow title="Temporada 2026" desc="View Anime that aired in the current season."
              items={season} loading={l2} onViewAll={() => navigate('/browse/season')} />
            <CategoryRow title="Popular" desc="View the most popular Anime of all time."
              items={popular} loading={l3} onViewAll={() => navigate('/browse/popular')} />
            <CategoryRow title="Próximos" desc="View Anime that is airing in the upcoming seasons."
              items={upcoming} loading={l4} onViewAll={() => navigate('/browse/upcoming')} />
          </div>
        ) : (
          /* Category full view (or search results) */
          <CategoryFullView category={activeCategory} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}
