import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiCompass, FiAlertTriangle } from 'react-icons/fi';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf;
    let cur = 0;

    function tick() {
      cur = Math.min(cur + 2.5, 100);
      setProgress(cur);

      if (cur < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 300);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="notfound-page">
      {/* Progress bar */}
      <div className="notfound-progress">
        <motion.div
          className="notfound-progress-bar"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="notfound-content"
        initial={{ opacity: 0, y: 30 }}
        animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="notfound-icon"
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FiAlertTriangle size={56} />
        </motion.div>

        <div className="notfound-title">404</div>

        <h1 className="notfound-heading">URL inválida</h1>

        <p className="notfound-text">
          A página{' '}
          <code className="notfound-code">
            {location.pathname}
          </code>{' '}
          não existe. Volte para a home ou explore os animes.
        </p>

        <div className="notfound-buttons">
          <motion.button
            className="btn-primary"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiHome size={16} /> Ir para Home
          </motion.button>

          <motion.button
            className="btn-secondary"
            onClick={() => navigate('/browse')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiCompass size={16} /> Explorar Animes
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}