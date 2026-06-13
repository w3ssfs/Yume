import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AnimeCard from '../AnimeCard/AnimeCard';
import './BrowseCarousel.css';

export default function BrowseCarousel({ items = [], loading }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const SCROLL = 600;

  const uniqueItems = items.filter(
    (anime, index, self) =>
      index === self.findIndex(
        a => a.mal_id === anime.mal_id
      )
  );

  function scroll(dir) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * SCROLL, behavior: 'smooth' });
  }

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }

  if (loading) {
    return (
      <div className="browse-carousel">
        <div className="browse-carousel__track browse-carousel__track--loading">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="browse-carousel__skeleton" />
          ))}
        </div>
      </div>
    );
  }
  const ids = items.map(a => a.mal_id);

  

  return (
    <div className="browse-carousel">
      {canLeft && (
        <motion.button className="browse-carousel__arrow browse-carousel__arrow--left"
          onClick={() => scroll(-1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <FiChevronLeft size={22} />
        </motion.button>
      )}
      <div className="browse-carousel__track" ref={trackRef} onScroll={onScroll}>
        {uniqueItems.map((anime) => (
          <div
            key={anime.mal_id}
            className="browse-carousel__item"
          >
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
      {canRight && items.length > 5 && (
        <motion.button className="browse-carousel__arrow browse-carousel__arrow--right"
          onClick={() => scroll(1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <FiChevronRight size={22} />
        </motion.button>
      )}
    </div>
  );
}
