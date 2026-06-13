import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiPlay } from 'react-icons/fi';
import { useDetail } from '../../context/DetailContext';
import './AnimeCard.css';

const GENRE_COLORS = {
  Action:'#e85c5c',Adventure:'#5cb8e8',Fantasy:'#9d7de8',Romance:'#e86db4',
  Drama:'#e8a45c',Comedy:'#5ce88a','Sci-Fi':'#5ce8d4',Horror:'#c0392b',
  Mystery:'#8e44ad',Sports:'#27ae60',
};

export default function AnimeCard({ anime, rank }) {
  const [hovered, setHovered] = useState(false);
  const { openDetail } = useDetail();

  if (!anime) return null;
  const title = anime.title_english || anime.title;
  const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const score = anime.score;
  const episodes = anime.episodes;
  const genres = anime.genres?.slice(0, 2) || [];
  const status = anime.status;

  return (
    <motion.div
      className="anime-card"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.06, zIndex: 10 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => openDetail(anime)}
    >
      
      <div className="anime-card__image-wrap">
        {image ? <img src={image} alt={title} loading="lazy" /> : <div className="anime-card__no-image">?</div>}
        <div className="anime-card__image-overlay" />
        {status === 'Currently Airing' && (
          <div className="anime-card__live-badge">
            <span className="anime-card__live-dot" />ON AIR
          </div>
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
              {score && <span className="anime-card__score"><FiStar size={11} />{score.toFixed(2)}</span>}
              {episodes && <span className="anime-card__eps">{episodes} eps</span>}
            </div>
            <div className="anime-card__genres">
              {genres.map((g) => (
                <span key={g.mal_id} className="anime-card__genre-tag"
                  style={{ color: GENRE_COLORS[g.name]||'#9c9ab8', borderColor:(GENRE_COLORS[g.name]||'#9c9ab8')+'44' }}>
                  {g.name}
                </span>
              ))}
            </div>
            <motion.button className="anime-card__play-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <FiPlay size={13} />Ver Detalhes
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
