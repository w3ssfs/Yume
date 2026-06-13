import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiPlay, FiHeart, FiBookmark } from 'react-icons/fi';
import { useDetail } from '../../context/DetailContext';
import { useAuth } from '../../context/AuthContext';
import './AnimeCard.css';

const GENRE_COLORS = {
  Action:'#e85c5c',Adventure:'#5cb8e8',Fantasy:'#9d7de8',Romance:'#e86db4',
  Drama:'#e8a45c',Comedy:'#5ce88a','Sci-Fi':'#5ce8d4',Horror:'#c0392b',
  Mystery:'#8e44ad',Sports:'#27ae60',
};

export default function AnimeCard({ anime, rank }) {
  const [hovered, setHovered] = useState(false);

  const { openDetail } = useDetail();
  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useAuth();

  if (!anime) return null;

  const isLocal = !!anime.animeId;

  const display = {
    mal_id: anime.animeId || anime.mal_id,
    title: anime.title_english || anime.title,
    images: anime.images || {
      jpg: {
        image_url: anime.image,
        large_image_url: anime.image,
      },
    },
    score: anime.score,
    year: anime.year,
    genres: anime.genres || [],
  };

  const title = display.title;
  const image =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url ||
    anime.image;

  const score = anime.score;
  const episodes = anime.episodes;
  const genres = anime.genres?.slice(0, 2) || [];
  const status = anime.status;

  const fav = isFavorite(display.mal_id);
  const inWL = isInWatchlist(display.mal_id);

  return (
    <motion.div
      className="anime-card"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.06, zIndex: 10 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => openDetail(display)}
    >
      <div className="anime-card__image-wrap">
        {image ? (
          <img src={image} alt={title} loading="lazy" />
        ) : (
          <div className="anime-card__no-image">?</div>
        )}

        <div className="anime-card__image-overlay" />

        {status === 'Currently Airing' && (
          <div className="anime-card__live-badge">
            <span className="anime-card__live-dot" />ON AIR
          </div>
        )}

        {/* ⭐ score */}
        {score && (
          <span className="anime-card__score-badge">
            ⭐ {score}
          </span>
        )}
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
              {score && (
                <span className="anime-card__score">
                  <FiStar size={11} />
                  {score.toFixed(2)}
                </span>
              )}
              {episodes && (
                <span className="anime-card__eps">{episodes} eps</span>
              )}
            </div>

            <div className="anime-card__genres">
              {genres.map((g) => {
                const name = g.name || g;
                return (
                  <span
                    key={name}
                    className="anime-card__genre-tag"
                    style={{
                      color: GENRE_COLORS[name] || '#9c9ab8',
                      borderColor: (GENRE_COLORS[name] || '#9c9ab8') + '44',
                    }}
                  >
                    {name}
                  </span>
                );
              })}
            </div>

            {/* ações estilo FavCard */}
            <div
              className="anime-card__actions"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`anime-card__btn ${fav ? 'anime-card__btn--fav' : ''}`}
                onClick={() => toggleFavorite(display)}
                title="Favoritar"
              >
                <FiHeart size={13} />
              </button>

              <button
                className={`anime-card__btn ${inWL ? 'anime-card__btn--wl' : ''}`}
                onClick={() => toggleWatchlist(display)}
                title="Assistir depois"
              >
                <FiBookmark size={13} />
              </button>
            </div>

           
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}