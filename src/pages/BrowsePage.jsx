import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiChevronRight, FiSearch, FiX } from 'react-icons/fi';
import Header from '../components/Header/Header';
import BrowseCarousel from '../components/Browse/BrowseCarousel';
import AnimeGrid from '../components/Browse/AnimeGrid';
import { useDebounce } from '../hooks/useDebounce';
import { useSearch, useCurrentSeason, useTrendingAnime, useUpcomingAnime, useTopAnime } from '../hooks/useAnime';
import jikanApi from '../services/jikanApi';
import './BrowsePage.css';

const CATEGORIES = {
  browse: { label: 'Anime', desc: 'Confira os animes mais populares, em exibição e os que estão por vir.' },
  trending: { label: 'Animes em Lançamentos', desc: 'Veja os animes que estão em alta no momento.' },
  season: { label: 'Temporada 2026', desc: 'Veja os animes que foram ao ar na temporada atual.' },
  upcoming: { label: 'Lançamentos Futuros', desc: 'Veja os animes que serão exibidos nas próximas temporadas.' },
  popular: { label: 'Mais Populares', desc: 'Veja os animes mais populares de todos os tempos.' },
};

/* Breadcrumb */
function Breadcrumb({ category, isSearch }) {
  const isDeep = (category && category !== 'browse') || isSearch;
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
            {isSearch ? 'Pesquisa' : (CATEGORIES[category]?.label || category)}
          </span>
        </>
      )}
    </nav>
  );
}


function FilterBar({ search, onSearch, genre, onGenre, year, onYear, allGenres, allYears, onClear, placeholder }) {
  const hasFilter = search || genre || year;
  return (
    <div className="fav-filters">
      <div className="fav-search-wrap">
        <FiSearch size={15} className="fav-search-icon" />
        <input
          className="fav-search"
          placeholder={placeholder || 'Buscar um anime...'}
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


function useFilterOptions(items) {
  return useMemo(() => {
    const genres = new Set();
    const years = new Set();
    (items || []).forEach((a) => {
      (a.genres || []).forEach((g) => {
        const name = typeof g === 'string' ? g : g?.name;
        if (name) genres.add(name);
      });
      if (a.year) years.add(String(a.year));
    });
    return {
      allGenres: [...genres].sort(),
      allYears: [...years].sort((a, b) => b - a),
    };
  }, [items]);
}


function applyFilters(items, { search, genre, year }) {
  return (items || []).filter((a) => {
    const title = a.title_english || a.title || '';
    const titleMatch = !search || title.toLowerCase().includes(search.toLowerCase());
    const genreList = (a.genres || [])
      .map((g) => (typeof g === 'string' ? g : g?.name))
      .filter(Boolean);
    const genreMatch = !genre || genreList.includes(genre);
    const yearMatch = !year || String(a.year) === year;
    return titleMatch && genreMatch && yearMatch;
  });
}


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


function CategoryFullView({ category }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    setPage(1);
    setSearch(''); setGenre(''); setYear('');
  }, [category]);

  useEffect(() => {
    setLoading(true);

    const fetchers = {
      trending: () => jikanApi.getTrendingAnime(24, page),
      season: () => jikanApi.getCurrentSeason(page),
      upcoming: () => jikanApi.getUpcomingAnime(24, page),
      popular: () => jikanApi.getTopAnime(24, page),
    };

    const fn = fetchers[category];
    if (!fn) {
      setData([]);
      setLoading(false);
      return;
    }

    fn()
      .then((res) => {
        setData(res.data || []);
        setPagination(res.pagination);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [category, page]);

  const { allGenres, allYears } = useFilterOptions(data);
  const filtered = useMemo(() => applyFilters(data, { search, genre, year }), [data, search, genre, year]);
  const clearFilters = () => { setSearch(''); setGenre(''); setYear(''); };

  return (
    <div>
      <div className="browse-full-header">
        <h1 className="browse-full-title">{CATEGORIES[category]?.label}</h1>
        <p className="browse-full-desc">{CATEGORIES[category]?.desc}</p>
      </div>

      <FilterBar
        search={search} onSearch={setSearch}
        genre={genre} onGenre={setGenre}
        year={year} onYear={setYear}
        allGenres={allGenres} allYears={allYears}
        onClear={clearFilters}
        placeholder="Filtrar nesta lista..."
      />

      {(search || genre || year) && (
        <p className="fav-results-info">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} nesta página
          {search && ` para "${search}"`}
          {genre && ` • Gênero: ${genre}`}
          {year && ` • Ano: ${year}`}
        </p>
      )}

      <AnimeGrid
        items={filtered}
        loading={loading}
        pagination={pagination}
        page={page}
        onPageChange={(p) => { setPage(p); }}
      />
    </div>
  );
}


function SearchResultsView({ query, onQueryChange }) {
  const [localQuery, setLocalQuery] = useState(query);
  const debouncedQuery = useDebounce(localQuery, 450);
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const { results, loading, pagination, search } = useSearch();

  useEffect(() => { setLocalQuery(query); }, [query]);
  useEffect(() => { setPage(1); setGenre(''); setYear(''); }, [debouncedQuery]);
  useEffect(() => {
    if (debouncedQuery) search(debouncedQuery, 24, page);
    onQueryChange?.(debouncedQuery);
  }, [debouncedQuery, page, search]);

  const { allGenres, allYears } = useFilterOptions(results);
  const filtered = useMemo(
    () => applyFilters(results, { search: '', genre, year }),
    [results, genre, year]
  );
  const clearFilters = () => { setGenre(''); setYear(''); };

  return (
    <div>
      <div className="browse-full-header">
        <h1 className="browse-full-title">Resultados para "{debouncedQuery}"</h1>
        <p className="browse-full-desc">Animes encontrados na sua busca</p>
      </div>

      <FilterBar
        search={localQuery} onSearch={setLocalQuery}
        genre={genre} onGenre={setGenre}
        year={year} onYear={setYear}
        allGenres={allGenres} allYears={allYears}
        onClear={() => { setGenre(''); setYear(''); }}
        placeholder="Buscar um anime..."
      />

      {(genre || year) && (
        <p className="fav-results-info">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} nesta página
          {genre && ` • Gênero: ${genre}`}
          {year && ` • Ano: ${year}`}
        </p>
      )}

      <AnimeGrid
        items={filtered}
        loading={loading}
        pagination={pagination}
        page={page}
        onPageChange={(p) => { setPage(p); }}
      />
    </div>
  );
}


export default function BrowsePage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [localSearch, setLocalSearch] = useState(urlQuery);
  const debouncedLocal = useDebounce(localSearch, 500);

  // Filters for the main browse landing page categories
  const [mainGenre, setMainGenre] = useState('');
  const [mainYear, setMainYear] = useState('');

  const { data: trending, loading: l1 } = useTrendingAnime(12);
  const { data: season, loading: l2 } = useCurrentSeason(1);
  const { data: upcoming, loading: l4 } = useUpcomingAnime(12);
  const { data: popular, loading: l5 } = useTopAnime(12);

  useEffect(() => {
    setLocalSearch(urlQuery);
  }, [urlQuery]);

  const isCategory = !!category;
  const activeCategory = category || 'browse';
  const isSearch = !isCategory && !!debouncedLocal;

  
  const allLandingItems = useMemo(
    () => [...trending, ...season, ...upcoming, ...popular],
    [trending, season, upcoming, popular]
  );
  const { allGenres, allYears } = useFilterOptions(allLandingItems);

  const filteredTrending = useMemo(() => applyFilters(trending, { search: '', genre: mainGenre, year: mainYear }), [trending, mainGenre, mainYear]);
  const filteredSeason = useMemo(() => applyFilters(season, { search: '', genre: mainGenre, year: mainYear }), [season, mainGenre, mainYear]);
  const filteredUpcoming = useMemo(() => applyFilters(upcoming, { search: '', genre: mainGenre, year: mainYear }), [upcoming, mainGenre, mainYear]);
  const filteredPopular = useMemo(() => applyFilters(popular, { search: '', genre: mainGenre, year: mainYear }), [popular, mainGenre, mainYear]);

  const clearMainFilters = () => { setLocalSearch(''); setMainGenre(''); setMainYear(''); };

  return (
    <div className="browse-page">
      <Header />
      <div className="browse-page__inner container">
        <Breadcrumb category={category} isSearch={isSearch} />

        {!isCategory && !isSearch ? (
          <>
            <FilterBar
              search={localSearch} onSearch={setLocalSearch}
              genre={mainGenre} onGenre={setMainGenre}
              year={mainYear} onYear={setMainYear}
              allGenres={allGenres} allYears={allYears}
              onClear={clearMainFilters}
              placeholder="Buscar um anime..."
            />

            <div className="browse-categories">
              <CategoryRow title="Animes em Lançamentos" desc="Veja os animes que estão em alta no momento."
                items={filteredTrending} loading={l1} onViewAll={() => navigate('/browse/trending')} />
              <CategoryRow title="Temporada 2026" desc="Veja os animes que foram ao ar na temporada atual."
                items={filteredSeason} loading={l2} onViewAll={() => navigate('/browse/season')} />
              <CategoryRow title="Lançamentos Futuros" desc="Veja os animes que serão exibidos nas próximas temporadas."
                items={filteredUpcoming} loading={l4} onViewAll={() => navigate('/browse/upcoming')} />
              <CategoryRow title="Mais Populares" desc="Veja os animes mais populares de todos os tempos."
                items={filteredPopular} loading={l5} onViewAll={() => navigate('/browse/popular')} />
            </div>
          </>
        ) : isCategory ? (
          <CategoryFullView category={activeCategory} />
        ) : (
          <SearchResultsView query={debouncedLocal} />
        )}
      </div>
    </div>
  );
}