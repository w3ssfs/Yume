import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiStar, FiHeart, FiBookmark, FiPlay, FiExternalLink, FiCalendar, FiFilm } from 'react-icons/fi';
import { useDetail } from '../../context/DetailContext';
import { useAuth } from '../../context/AuthContext';
import { useAnimeDetail, useAnimeRelations } from '../../hooks/useAnime';
import './AnimeDetail.css';

function TrailerEmbed({ url }) {
  if (!url) return null;
  const base = url.split('?')[0];
  const videoId = base.split('/embed/')[1];
  const src = `${base}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`;
  return (
    <div className="detail-trailer">
      <iframe
        src={src}
        title="trailer"
        frameBorder="0"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

function RelatedCard({ entry, onClick }) {
  return (
    <motion.div
      className="related-card"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.18 }}
    >
      {entry.images?.jpg?.image_url ? (
        <img src={entry.images.jpg.image_url} alt={entry.title} loading="lazy" />
      ) : (
        <div className="related-card__placeholder" />
      )}
      <div className="related-card__info">
        <p className="related-card__title">{entry.title}</p>
        <span className="related-card__type">{entry.type}</span>
      </div>
    </motion.div>
  );
}

export default function AnimeDetail() {
  const { selectedAnime, closeDetail, openDetail } = useDetail();
  const { user, isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useAuth();
  const { data: anime, loading } = useAnimeDetail(selectedAnime?.mal_id);
  const relations = useAnimeRelations(selectedAnime?.mal_id);
  const [bodyLocked, setBodyLocked] = useState(false);

  const isOpen = !!selectedAnime;

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setBodyLocked(true);
    } else {
      document.body.style.overflow = '';
      setBodyLocked(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeDetail(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeDetail]);

  const display = anime || selectedAnime;
  const title = display?.title_english || display?.title || '';
  const image = display?.images?.jpg?.large_image_url || display?.images?.jpg?.image_url || '';
  const synopsis = display?.synopsis || '';
  const score = display?.score;
  const genres = display?.genres || [];
  const episodes = display?.episodes;
  const status = display?.status;
  const year = display?.year;
  const type = display?.type;
  const trailerUrl = anime?.trailer?.embed_url || null;
  const fav = selectedAnime ? isFavorite(selectedAnime.mal_id) : false;
  const inWL = selectedAnime ? isInWatchlist(selectedAnime.mal_id) : false;
  // Flatten relations to show actual related anime entries
  const relatedEntries = relations.flatMap((rel) =>
    rel.entry.filter((e) => e.type === 'anime').map((e) => ({ ...e, relation: rel.relation }))
  ).slice(0, 10);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDetail}
          />

          {/* Panel */}
          <motion.aside
            className="detail-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Close button */}
            <motion.button
              className="detail-close"
              onClick={closeDetail}
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ duration: 0.18 }}
            >
              <FiX size={20} />
            </motion.button>

            <div className="detail-scroll">
              {/* Trailer / Hero image */}
              {loading ? (
                <div className="detail-trailer detail-trailer--skeleton" />
              ) : trailerUrl ? (
                <TrailerEmbed url={trailerUrl} />
              ) : (
                <div className="detail-hero-img">
                  {image && <img src={image} alt={title} />}
                  <div className="detail-hero-img__overlay" />
                </div>
              )}

              {/* Card row: cover + info */}
              <div className="detail-info-row">
                <div className="detail-cover-wrap">
                  {image && (
                    <img src={image} alt={title} className="detail-cover" loading="lazy" />
                  )}
                  {/* Action buttons */}
                  <div className="detail-actions">
                    {user && (
                      <motion.button
                        className={`detail-action-btn ${fav ? 'detail-action-btn--active' : ''}`}
                        onClick={() => selectedAnime && toggleFavorite(display)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        title={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <FiHeart size={16} />
                        {fav ? 'Favoritado' : 'Favoritar'}
                      </motion.button>
                    )}
                    <motion.button
                      className={`detail-action-btn detail-action-btn--secondary ${inWL ? 'detail-action-btn--active-wl' : ''}`}
                      onClick={() => selectedAnime && toggleWatchlist(display)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      title={inWL ? 'Remover da lista' : 'Assistir depois'}
                    >
                      <FiBookmark size={16} />
                      {inWL ? 'Na lista' : 'Assistir depois'}
                    </motion.button>
                  </div>
                </div>

                {/* Right info */}
                <div className="detail-meta-col">
                  <h2 className="detail-title">{title}</h2>

                  {/* Genres */}
                  <div className="detail-genres">
                    {genres.slice(0, 4).map((g) => (
                      <span key={g.mal_id || g.name} className="detail-genre-tag">
                        {g.name}
                      </span>
                    ))}
                  </div>

                  {/* Stats grid */}
                  <div className="detail-stats">
                    {score && (
                      <div className="detail-stat">
                        <FiStar size={14} className="detail-stat__icon detail-stat__icon--star" />
                        <span className="detail-stat__value">{score.toFixed(2)}</span>
                        <span className="detail-stat__label">Score</span>
                      </div>
                    )}
                    {type && (
                      <div className="detail-stat">
                        <FiFilm size={14} className="detail-stat__icon" />
                        <span className="detail-stat__value">{type}</span>
                        <span className="detail-stat__label">Tipo</span>
                      </div>
                    )}
                    {episodes && (
                      <div className="detail-stat">
                        <FiPlay size={14} className="detail-stat__icon" />
                        <span className="detail-stat__value">{episodes}</span>
                        <span className="detail-stat__label">Episódios</span>
                      </div>
                    )}
                    {year && (
                      <div className="detail-stat">
                        <FiCalendar size={14} className="detail-stat__icon" />
                        <span className="detail-stat__value">{year}</span>
                        <span className="detail-stat__label">Ano</span>
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  {status && (
                    <span className={`detail-status ${status === 'Currently Airing' ? 'detail-status--live' : ''}`}>
                      {status === 'Currently Airing' && <span className="live-dot" />}
                      {status === 'Currently Airing' ? 'Em exibição' : status}
                    </span>
                  )}

                  {/* MAL link */}
                  {display?.url && (
                    <a
                      href={display.url}
                      target="_blank"
                      rel="noreferrer"
                      className="detail-mal-link"
                    >
                      <FiExternalLink size={13} /> Ver no MyAnimeList
                    </a>
                  )}
                </div>
              </div>

              {/* Synopsis */}
              {synopsis && (
                <div className="detail-section">
                  <h3 className="detail-section__title">Sinopse</h3>
                  <p className="detail-synopsis">{synopsis}</p>
                </div>
              )}

              {/* Related */}
              {relatedEntries.length > 0 && (
                <div className="detail-section">
                  <h3 className="detail-section__title">Relacionados</h3>
                  <div className="detail-related-grid">
                    {relatedEntries.map((entry) => (
                      <RelatedCard
                        key={`${entry.mal_id}-${entry.relation}`}
                        entry={entry}
                        onClick={() => openDetail({ mal_id: entry.mal_id, title: entry.title })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
