import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { FiArrowRight, FiTrendingUp, FiSun, FiThumbsUp, FiClock } from 'react-icons/fi';
import InfiniteCarousel from '../Carousel/InfiniteCarousel';
import './Sections.css';
import tap from '../../assets/tap.webp';
import tap2 from '../../assets/tap2.webp';

function SectionHeader({ label, title, subtitle, action, onAction }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div ref={ref} className="section-head"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.4,0,0.2,1] }}>
      <div className="section-head__left">
        <span className="section-label">{label}</span>
        <h2 className="section-head__title">{title}</h2>
        {subtitle && <p className="section-head__subtitle">{subtitle}</p>}
      </div>
      {action && (
        <motion.button className="section-head__action" onClick={onAction}
          whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
          {action} <FiArrowRight size={15} />
        </motion.button>
      )}
    </motion.div>
  );
}


export function SeasonCarouselSection({ animes }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const navigate = useNavigate();
  return (
    <section className="section section--season" ref={ref}>
      <div className="container">
        <SectionHeader label="Temporada Atual" title="Animes em Exibição"
          subtitle="Os títulos mais quentes desta temporada"
          action="Ver todos" onAction={() => navigate('/browse/season')} />
      </div>
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}>
        <InfiniteCarousel items={animes} speed={0.4} />
      </motion.div>
    </section>
  );
}


const PANELS = [
  {
    icon: <FiTrendingUp size={28} />, path: '/browse/trending',
    label: 'Trending Now', desc: 'View Anime that is trending right now.',
    action: 'DISCOVER', accentColor: '#e85c5c',
    bgQuery: 'trending',
  },
  {
    icon: <FiSun size={28} />, path: '/browse/season',
    label: 'Spring 2026', desc: 'View Anime that aired in the current season.',
    action: 'EXPLORE', accentColor: '#9d7de8',
    bgQuery: 'season',
  },
  {
    icon: <FiThumbsUp size={28} />, path: '/browse',
    label: 'Popular', desc: 'View the most popular Anime of all time.',
    action: 'BROWSE', accentColor: '#5cb8e8',
    bgQuery: 'popular',
  },
  {
    icon: <FiClock size={28} />, path: '/browse/upcoming',
    label: 'Upcoming', desc: 'View Anime that is airing in the upcoming seasons.',
    action: 'VIEW', accentColor: '#5ce8d4',
    bgQuery: 'upcoming',
  },
];


const BG_IMAGES = [
  'https://cdn.myanimelist.net/images/anime/1015/18006l.jpg',
  'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
  'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',
  'https://cdn.myanimelist.net/images/anime/1629/117851l.jpg',
];

function CategoryPanel({ panel, index, bgImage }) {
  const navigate = useNavigate();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div ref={ref} className="cat-panel"
      style={{ '--accent': panel.accentColor }}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ scale: 1.02, zIndex: 2 }}
      onClick={() => navigate(panel.path)}>
      {/* BG image */}
      {bgImage && <img src={bgImage} alt="" className="cat-panel__bg" loading="lazy" />}
      <div className="cat-panel__overlay" />
      {/* Content */}
      <div className="cat-panel__content">
        <span className="cat-panel__icon" style={{ color: panel.accentColor }}>{panel.icon}</span>
        <h3 className="cat-panel__label">{panel.label}</h3>
        <p className="cat-panel__desc">{panel.desc}</p>
        <span className="cat-panel__action" style={{ color: panel.accentColor }}>
          {panel.action} <FiArrowRight size={14} />
        </span>
      </div>
    </motion.div>
  );
}

export function CategoryPanelsSection({ topAnimes }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  
  const bgImages = topAnimes.slice(0, 4).map(
    (a) => a?.images?.jpg?.large_image_url || a?.images?.jpg?.image_url
  );
  const imgs = bgImages.length === 4 ? bgImages : BG_IMAGES;

  return (
    <section className="section section--cat-panels" ref={ref}>
      <div className="container">
        <SectionHeader label="Explorar" title="Não Perca Esses"
          subtitle="Escolha uma categoria e mergulhe" />
        <motion.div className="cat-panels-grid"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}>
          {PANELS.map((panel, i) => (
            <CategoryPanel key={panel.label} panel={panel} index={i} bgImage={imgs[i]} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}


export function TopAnimeCarouselSection({ animes }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const navigate = useNavigate();
  return (
    <section className="section section--top" ref={ref}>
      <div className="container">
        <SectionHeader label="Ranking Global" title="Top 20 Animes"
          subtitle="Os mais amados da comunidade"
          action="Ver ranking completo" onAction={() => navigate('/browse')} />
      </div>
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}>
        <InfiniteCarousel items={animes} speed={0.35} showRank reverse />
      </motion.div>
    </section>
  );
}
