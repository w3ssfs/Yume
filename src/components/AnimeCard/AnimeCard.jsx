import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiHeart, FiBookmark, FiLayers, FiX, FiChevronRight } from 'react-icons/fi';
import { useDetail } from '../../context/DetailContext';
import { useAuth } from '../../context/AuthContext';
import { jikanApi } from '../../services/jikanApi';
import './AnimeCard.css';

const GENRE_COLORS = {
  Action: '#e85c5c', Adventure: '#5cb8e8', Fantasy: '#9d7de8', Romance: '#e86db4',
  Drama: '#e8a45c', Comedy: '#5ce88a', 'Sci-Fi': '#5ce8d4', Horror: '#c0392b',
  Mystery: '#8e44ad', Sports: '#27ae60',
};

const SEASON_RELATIONS = ['Sequel', 'Prequel', 'Alternative version', 'Parent story', 'Side story'];

const RELATION_LABEL = {
  Prequel: 'Prequel',
  Sequel: 'Continuação',
  'Alternative version': 'Versão Alt.',
  'Parent story': 'História Pai',
  'Side story': 'Spin-off',
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const relatedCache = new Map();

async function fetchAllRelated(rootId, signal) {
  if (relatedCache.has(rootId)) {
    return relatedCache.get(rootId);
  }

  const visited = new Set();
  const results = [];

  async function walk(id) {
    if (visited.has(id) || signal?.aborted) return;
    visited.add(id);

    let relations;
    try {
      relations = await jikanApi.getAnimeRelations(id);
    } catch {
      return;
    }

    if (signal?.aborted) return;

    const relevant = (relations || [])
      .filter(r => SEASON_RELATIONS.includes(r.relation))
      .flatMap(r => r.entry.map(e => ({ mal_id: e.mal_id, name: e.name, relation: r.relation })));

    for (const entry of relevant) {
      if (visited.has(entry.mal_id) || signal?.aborted) continue;

      await sleep(400); 
      if (signal?.aborted) return;

      let data;
      try {
        data = await jikanApi.getAnimeBasic(entry.mal_id);
      } catch {
        continue;
      }

      if (signal?.aborted) return;

      results.push({
        mal_id: entry.mal_id,
        relation: entry.relation,
        title: data?.title_english || data?.title || entry.name,
        image: data?.images?.jpg?.image_url,
        year: data?.year,
        episodes: data?.episodes,
        score: data?.score,
        _full: data,
      });


      await sleep(400);
      await walk(entry.mal_id);
    }
  }

  await walk(rootId);

  relatedCache.set(rootId, results);

  return results;
}


function SeasonsModal({ animeId, anchorRect, onClose, onSelectAnime }) {
  const cached = relatedCache.get(animeId);

  const [entries, setEntries] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const modalRef = useRef(null);


  const style = anchorRect ? {
    top: Math.min(anchorRect.top, window.innerHeight - 360) + window.scrollY,
    left: anchorRect.right + 10,
  } : {};

  useEffect(() => {
    if (relatedCache.has(animeId)) return;

    const ctrl = new AbortController();

    fetchAllRelated(animeId, ctrl.signal).then(data => {
      if (!ctrl.signal.aborted) {
        setEntries(data);
        setLoading(false);
      }
    });

    return () => ctrl.abort();
  }, [animeId]);


  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Fecha com Esc
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const modal = (
    <motion.div
      ref={modalRef}
      className="seasons-modal"
      style={style}
      initial={{ opacity: 0, scale: 0.94, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.94, x: -8 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="seasons-modal__header">
        <FiLayers size={14} />
        <span>Temporadas & Sequências</span>
        <button className="seasons-modal__close" onClick={onClose}>
          <FiX size={14} />
        </button>
      </div>

      <div className="seasons-modal__list">
        {loading && (
          <div className="seasons-modal__status">
            <span className="seasons-modal__spinner" />
            <span>Buscando temporadas...</span>
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="seasons-modal__status seasons-modal__status--empty">
            Nenhuma temporada encontrada.
          </div>
        )}

        {entries.map(entry => (
          <button
            key={entry.mal_id}
            className="seasons-modal__item"
            onClick={() => {
              onSelectAnime(entry._full || { mal_id: entry.mal_id, title: entry.title });
              onClose();
            }}
          >
            <div className="seasons-modal__thumb-wrap">
              {entry.image
                ? <img src={entry.image} alt={entry.title} className="seasons-modal__thumb" />
                : <div className="seasons-modal__thumb seasons-modal__thumb--empty">?</div>
              }
            </div>
            <div className="seasons-modal__item-info">
              <span className="seasons-modal__relation-tag">
                {RELATION_LABEL[entry.relation] || entry.relation}
              </span>
              <span className="seasons-modal__item-title">{entry.title}</span>
              <div className="seasons-modal__item-meta">
                {entry.year && <span>{entry.year}</span>}
                {entry.episodes && <span>{entry.episodes} eps</span>}
                {entry.score && <span>⭐ {entry.score}</span>}
              </div>
            </div>
            <FiChevronRight size={14} className="seasons-modal__arrow" />
          </button>
        ))}


        {loading && entries.length > 0 && (
          <div className="seasons-modal__status seasons-modal__status--more">
            <span className="seasons-modal__spinner" />
            <span>Buscando mais...</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return ReactDOM.createPortal(modal, document.body);
}


function SeasonsBadge({ onClick }) {
  return (
    <button
      className="anime-card__seasons-badge"
      onClick={onClick}
      title="Ver temporadas relacionadas"
    >
      <FiLayers size={11} />
    </button>
  );
}

export default function AnimeCard({ anime, rank }) {
  const [hovered, setHovered] = useState(false);
  const [seasonsOpen, setSeasonsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const cardRef = useRef(null);

  const { openDetail } = useDetail();
  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useAuth();

  if (!anime) return null;

  const display = {
    mal_id: anime.animeId || anime.mal_id,
    title: anime.title_english || anime.title,
    images: anime.images || { jpg: { image_url: anime.image, large_image_url: anime.image } },
    score: anime.score,
    year: anime.year,
    genres: anime.genres || [],
  };

  const title = display.title;
  const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image;
  const score = anime.score;
  const episodes = anime.episodes;
  const genres = anime.genres?.slice(0, 2) || [];
  const status = anime.status;
  const fav = isFavorite(display.mal_id);
  const inWL = isInWatchlist(display.mal_id);

  const handleSeasonsBadgeClick = useCallback((e) => {
    e.stopPropagation();
    const rect = cardRef.current?.getBoundingClientRect();
    setAnchorRect(rect || null);
    setSeasonsOpen(true);
  }, []);

  return (
    <>
      <motion.div
        ref={cardRef}
        className={`anime-card ${fav ? 'anime-card--favorited' : inWL ? 'anime-card--watchlist' : ''}`}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.06, zIndex: 10 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        onClick={() => !seasonsOpen && openDetail(display)}
      >
        <div className="anime-card__image-wrap">
          {image
            ? <img src={image} alt={title} loading="lazy" />
            : <div className="anime-card__no-image">?</div>
          }

          <div className="anime-card__image-overlay" />

          {display.mal_id && (
            <SeasonsBadge onClick={handleSeasonsBadgeClick} />
          )}

          {status === 'Currently Airing' && (
            <div className="anime-card__live-badge">
              <span className="anime-card__live-dot" />ON AIR
            </div>
          )}

          {score && <span className="anime-card__score-badge">⭐ {score}</span>}
          {fav && <div className="anime-card__fav-indicator"><FiHeart size={13} fill="#e86db4" /></div>}
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              className="anime-card__hover-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="anime-card__title">{title}</p>

              <div className="anime-card__meta">
                {score && <span className="anime-card__score"><FiStar size={11} />{score.toFixed(2)}</span>}
                {episodes && <span className="anime-card__eps">{episodes} eps</span>}
              </div>

              <div className="anime-card__genres">
                {genres.map((g) => {
                  const name = g.name || g;
                  return (
                    <span key={name} className="anime-card__genre-tag"
                      style={{ color: GENRE_COLORS[name] || '#9c9ab8', borderColor: (GENRE_COLORS[name] || '#9c9ab8') + '44' }}>
                      {name}
                    </span>
                  );
                })}
              </div>

              <div className="anime-card__actions" onClick={e => e.stopPropagation()}>
                <button className={`anime-card__btn ${fav ? 'anime-card__btn--fav' : ''}`}
                  onClick={() => toggleFavorite(display)} title="Favoritar">
                  <FiHeart size={13} />
                </button>
                <button className={`anime-card__btn ${inWL ? 'anime-card__btn--wl' : ''}`}
                  onClick={() => toggleWatchlist(display)} title="Assistir depois">
                  <FiBookmark size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {seasonsOpen && (
          <SeasonsModal
            animeId={display.mal_id}
            anchorRect={anchorRect}
            onClose={() => setSeasonsOpen(false)}
            onSelectAnime={(data) => { openDetail(data); setSeasonsOpen(false); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}