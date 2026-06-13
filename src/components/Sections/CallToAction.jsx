import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiPlay, FiBookOpen } from 'react-icons/fi';
import './CallToAction.css';


export default function CallToAction({ anime }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const image = anime?.images?.jpg?.large_image_url;
  const title = anime?.title_english || anime?.title;

  return (
    <section className="cta-section" ref={ref}>
      {/* Ambient background */}
      <div className="cta-section__bg">
        {image && <img src={image} alt="" aria-hidden />}
        <div className="cta-section__bg-overlay" />
      </div>

      <div className="container cta-section__inner">
        {/* Video/image side */}
        <motion.div
          className="cta-section__media"
          initial={{ opacity: 0, x: 60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.4,0,0.2,1] }}
        >
          <div className="cta-media-frame">
            {image ? (
              <img src={image} alt={title} />
            ) : (
              <div className="cta-media-placeholder" />
            )}
            <div className="cta-media-frame__glow" />
          </div>
        </motion.div>

        {/* Text side */}
        <motion.div
          className="cta-section__text"
          initial={{ opacity: 0, x: -60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.4,0,0.2,1] }}
        >
          <span className="section-label">Descubra Agora</span>

          <h2 className="cta-section__heading">
            Mergulhe em<br />
            <span className="gradient-text">Novos Mundos</span>
          </h2>

          <p className="cta-section__body">
            Explore uma vasta biblioteca de animes, acompanhe seus favoritos,
            descubra novas histórias e conecte-se com uma comunidade apaixonada.
            Sua próxima aventura começa aqui.
          </p>

          <div className="cta-section__stats">
            {[
              { value: '10.000+', label: 'Animes' },
              { value: '500K+', label: 'Usuários' },
              { value: '98%', label: 'Satisfação' },
            ].map((s) => (
              <div key={s.label} className="cta-stat">
                <span className="cta-stat__value gradient-text">{s.value}</span>
                <span className="cta-stat__label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="cta-section__actions">
            <motion.button
              className="hero-btn hero-btn--primary"
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(124,92,191,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              <FiPlay size={16} />
              Começar a Assistir
            </motion.button>

            <motion.button
              className="hero-btn hero-btn--secondary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiBookOpen size={16} />
              Explorar Catálogo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
