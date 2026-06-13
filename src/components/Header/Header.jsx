import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiX, FiUser, FiHeart, FiBookmark, FiSettings, FiLogOut,
  FiChevronDown, FiGlobe, FiTrendingUp, FiSun, FiAward, FiThumbsUp, FiClock
} from 'react-icons/fi';
import { useSearch } from '../../hooks/useAnime';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import { useDetail } from '../../context/DetailContext';
import './Header.css';

/* ─── Search Dropdown ─── */
function SearchDropdown({ results, loading, query, onSeeMore }) {
  if (!query || query.length < 2) return null;
  const { openDetail } = useDetail();
  return (
    <motion.div className="search-dropdown"
      initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
      transition={{ duration: 0.18 }}
      style={{ transformOrigin: 'top' }}>
      {loading && (
        <div className="search-dropdown__loading">
          <div className="search-loading-dots">
            {[0,1,2].map(i => (
              <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
        </div>
      )}
      {!loading && results.length === 0 && query.length >= 2 && (
        <div className="search-dropdown__empty">Nenhum anime encontrado para "{query}"</div>
      )}
      {!loading && results.map((anime) => {
        const title = anime.title_english || anime.title;
        const image = anime.images?.jpg?.image_url;
        return (
          <motion.div key={anime.mal_id} className="search-result-item"
            whileHover={{ backgroundColor: 'rgba(124,92,191,0.12)' }}
            onClick={() => openDetail(anime)}>
            {image && <img src={image} alt={title} />}
            <div className="search-result-info">
              <span className="search-result-title">{title}</span>
              <span className="search-result-meta">
                {anime.type} • {anime.score ? `⭐ ${anime.score}` : 'N/A'}
                {anime.episodes ? ` • ${anime.episodes} eps` : ''}
              </span>
            </div>
          </motion.div>
        );
      })}
      {results.length >= 5 && (
        <motion.button className="search-see-more"
          whileHover={{ backgroundColor: 'rgba(124,92,191,0.15)' }}
          onClick={onSeeMore}>
          Ver mais resultados →
        </motion.button>
      )}
    </motion.div>
  );
}

/* ─── Nav Grid (hover) ─── */
const NAV_ITEMS = [
  { icon: <FiGlobe size={20} />, label: 'Browse', desc: 'Browse top, airing and upcoming Anime.', path: '/browse' },
  { icon: <FiTrendingUp size={20} />, label: 'Trending Now', desc: 'View Anime that is trending right now.', path: '/browse/trending' },
  { icon: <FiSun size={20} />, label: 'Temporada 2026', desc: 'View Anime that aired in the current season.', path: '/browse/season' },
  { icon: <FiAward size={20} />, label: 'Top 100', desc: 'View highly rated Anime of all time.', path: '/browse/top100' },
  { icon: <FiThumbsUp size={20} />, label: 'Popular', desc: 'View the most popular Anime of all time.', path: '/browse/popular' },
  { icon: <FiClock size={20} />, label: 'Próximos', desc: 'View Anime that is airing in the upcoming seasons.', path: '/browse/upcoming' },
];

function NavGridMenu() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  return (
    <div className="nav-grid-wrap" onMouseEnter={() => { clearTimeout(timerRef.current); setOpen(true); }}
      onMouseLeave={() => { timerRef.current = setTimeout(() => setOpen(false), 120); }}>
      <AnimatePresence>
        {open && (
          <motion.div className="nav-grid"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}>
            {NAV_ITEMS.map((item) => (
              <motion.button key={item.label} className="nav-grid__item"
                whileHover={{ backgroundColor: 'rgba(124,92,191,0.1)' }}
                transition={{ duration: 0.12 }}
                onClick={() => { navigate(item.path); setOpen(false); }}>
                <span className="nav-grid__icon">{item.icon}</span>
                <div className="nav-grid__text">
                  <span className="nav-grid__label">{item.label}</span>
                  <span className="nav-grid__desc">{item.desc}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── User Menu (hover) ─── */
function UserMenu() {
  const { user, handleLogin, handleLogout } = useAuth();
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  if (!user) {
    return (
      <motion.button className="header__login-btn" onClick={handleLogin}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Entrar com Google
      </motion.button>
    );
  }

  const displayName = user.displayName || 'Usuário';
  const firstName = displayName.split(' ')[0];
  const photoURL = user.photoURL;
  const initial = firstName.charAt(0).toUpperCase();

  const menuItems = [
    { icon: <FiUser size={15} />, label: 'Meu Perfil' },
    { icon: <FiHeart size={15} />, label: 'Favoritos' },
    { icon: <FiBookmark size={15} />, label: 'Lista de Assistir' },
    { icon: <FiSettings size={15} />, label: 'Configurações', divider: true },
    { icon: <FiLogOut size={15} />, label: 'Sair', danger: true, action: handleLogout },
  ];

  return (
    <div className="user-menu"
      onMouseEnter={() => { clearTimeout(timerRef.current); setOpen(true); }}
      onMouseLeave={() => { timerRef.current = setTimeout(() => setOpen(false), 120); }}>
      <div className="user-menu__trigger">
        <div className="user-menu__avatar">
          {photoURL ? <img src={photoURL} alt={firstName} referrerPolicy="no-referrer" /> : <span>{initial}</span>}
        </div>
        <span className="user-menu__name">{firstName}</span>
        <motion.span className="user-menu__chevron" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown size={14} />
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="user-menu__dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'top right' }}>
            <div className="user-menu__header">
              <div className="user-menu__avatar user-menu__avatar--lg">
                {photoURL ? <img src={photoURL} alt={firstName} referrerPolicy="no-referrer" /> : <span>{initial}</span>}
              </div>
              <div>
                <p className="user-menu__display-name">{displayName}</p>
                <p className="user-menu__email">{user.email}</p>
              </div>
            </div>
            <div className="user-menu__divider" />
            {menuItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.divider && <div className="user-menu__divider" />}
                <motion.button
                  className={`user-menu__item ${item.danger ? 'user-menu__item--danger' : ''}`}
                  whileHover={{ x: 3 }} transition={{ duration: 0.12 }}
                  onClick={item.action}>
                  {item.icon}{item.label}
                </motion.button>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Header ─── */
export default function Header() {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(searchQuery, 400);
  const { results, loading, search, clear } = useSearch();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { search(debouncedQuery); }, [debouncedQuery, search]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    function h(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchExpanded(false); setSearchQuery(''); clear();
      }
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [clear]);

  function handleSeeMore() {
    navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
    setSearchExpanded(false); setSearchQuery(''); clear();
  }

  return (
    <motion.header className={`header ${scrolled ? 'header--scrolled' : ''}`}
      initial={{ y: -80 }} animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
      <div className="header__inner container">
        <motion.div className="header__logo" whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}
          onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="header__logo-jp">夢</span>
          <span className="header__logo-text">yume</span>
        </motion.div>

        <div className="header__controls">
          {/* Search */}
          <div className="header__search" ref={searchRef}>
            <motion.div
              className={`search-bar ${searchExpanded ? 'search-bar--expanded' : ''}`}
              animate={{ width: searchExpanded ? 280 : 38 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
              <button className="search-bar__icon"
                onClick={() => { setSearchExpanded(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                aria-label="Buscar anime">
                <FiSearch size={16} />
              </button>
              <AnimatePresence>
                {searchExpanded && (
                  <motion.input ref={inputRef} className="search-bar__input" type="text"
                    placeholder="Buscar anime..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }} />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {searchExpanded && searchQuery && (
                  <motion.button className="search-bar__clear"
                    onClick={() => { setSearchQuery(''); clear(); inputRef.current?.focus(); }}
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.15 }}>
                    <FiX size={13} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
            <AnimatePresence>
              {searchExpanded && (
                <SearchDropdown results={results} loading={loading} query={debouncedQuery}
                  onSeeMore={handleSeeMore} />
              )}
            </AnimatePresence>
          </div>

          {/* Nav Grid hover zone (invisible trigger zone, the grid floats over it) */}
          <NavGridMenu />

          {/* User / Login */}
          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
}
