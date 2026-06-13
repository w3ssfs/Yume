import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import AnimeCard from '../AnimeCard/AnimeCard';
import './Carousel.css';

export default function InfiniteCarousel({ items = [], speed = 0.5, showRank = false, reverse = false }) {
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const cardWidth = 195; // card + gap

  // Duplicate items to make infinite effect
  const doubled = [...items, ...items];

  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(items.length * cardWidth);
    }
  }, [items.length]);

  useAnimationFrame((_, delta) => {
    if (paused || trackWidth === 0) return;
    const dir = reverse ? 1 : -1;
    xRef.current += dir * speed * (delta / 16);

    if (!reverse && xRef.current <= -trackWidth) {
      xRef.current += trackWidth;
    }
    if (reverse && xRef.current >= 0) {
      xRef.current -= trackWidth;
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${xRef.current}px)`;
    }
  });

  if (items.length === 0) {
    return (
      <div className="carousel-skeleton">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="carousel-skeleton__card" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="infinite-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="infinite-carousel__track" ref={trackRef}>
        {doubled.map((anime, idx) => (
          <div key={`${anime.mal_id}-${idx}`} className="infinite-carousel__item">
            <AnimeCard anime={anime} rank={showRank && idx < items.length ? idx + 1 : undefined} />
          </div>
        ))}
      </div>

      {/* Edge fades */}
      <div className="infinite-carousel__fade infinite-carousel__fade--left" />
      <div className="infinite-carousel__fade infinite-carousel__fade--right" />
    </div>
  );
}
