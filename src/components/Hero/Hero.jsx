import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiInfo, FiStar, FiCalendar, FiHeart  } from 'react-icons/fi';
import { useFeatured } from '../../hooks/useAnime';
import { useDetail } from '../../context/DetailContext';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  const { data: featured } = useFeatured();
  const [anime, setAnime] = useState(null);
  const iframeRef = useRef(null);
  const { openDetail } = useDetail();
  const navigate = useNavigate();
  const display = {
    mal_id: anime?.mal_id,
    title: anime?.title_english || anime?.title,
    images: anime?.images,
    score: anime?.score,
    year: anime?.year,
    genres: anime?.genres || [],
  };
  useEffect(() => {
    async function loadHeroAnime() {


      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${61316}/full`
      );

      const data = await response.json();
      setAnime(data.data);
    }

    loadHeroAnime();
  }, []);


  const title = anime?.title_english || anime?.title || '';
  const image = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url || '';
  const synopsis = anime?.synopsis
    ? anime.synopsis.slice(0, 220) + (anime.synopsis.length > 220 ? '...' : '')
    : 'Carregando...';

 
  const rawTrailer = anime?.trailer?.embed_url;
  let trailerUrl = null;
  if (rawTrailer) {
    const base = rawTrailer.split('?')[0];
    trailerUrl = `${base}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=${base.split('/embed/')[1]}`;
  }

  return (
    <section className="hero">
      
      <div className="hero__bg">
        {trailerUrl ? (
          <iframe
            ref={iframeRef}
            src={trailerUrl}
            className="hero__trailer-iframe"
            title="trailer"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          image && <img src={image} alt={title} className="hero__bg-img" />
        )}
        <div className="hero__bg-overlay" />
        <div className="hero__bg-gradient" />
      </div>

      
      {anime && (
        <motion.div
          className="hero__content container"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        >
          
          <motion.div
            className="hero-slide__genres"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {anime.genres?.slice(0, 3).map((g) => (
              <span key={g.mal_id} className="hero-slide__genre-tag">{g.name}</span>
            ))}
          </motion.div>

          
          <motion.h1
            className="hero-slide__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            {title}
          </motion.h1>

          
          <motion.div
            className="hero-slide__meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {anime.score && (
              <span className="hero-meta-pill hero-meta-pill--score">
                <FiStar size={13} />
                {anime.score.toFixed(2)}
              </span>
            )}
            {anime.year && (
              <span className="hero-meta-pill">
                <FiCalendar size={12} />
                {anime.year}
              </span>
            )}
            {anime.episodes && (
              <span className="hero-meta-pill">{anime.episodes} episódios</span>
            )}
            {anime.status === 'Currently Airing' && (
              <span className="hero-meta-pill hero-meta-pill--live">
                <span className="live-dot" />
                Em exibição
              </span>
            )}
          </motion.div>

          
          <motion.p
            className="hero-slide__synopsis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
          >
            {synopsis}
          </motion.p>

          
          <motion.div
            className="hero-slide__actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <motion.button
              className="hero-btn hero-btn--primary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openDetail(display)}
            >
              <FiPlay size={16} />
              Ver Agora
            </motion.button>

            <motion.button
              className="hero-btn hero-btn--secondary"
              whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.12)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/favorite')}
            >
              <FiHeart size={16} />
              Meus Animes
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      
      <motion.div
        className="hero__scroll-hint"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </motion.div>
    </section>
  );
}
