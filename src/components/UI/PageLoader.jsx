import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PageLoader.css';

export default function PageLoader({ ready }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let raf;
    let current = 0;

    function tick() {
      if (ready) {
        current = 100;
        setProgress(100);
        setTimeout(() => setVisible(false), 600);
        return;
      }
      const target = 85;
      const step = (target - current) * 0.035;
      current = Math.min(current + Math.max(step, 0.25), target);
      setProgress(current);
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  if (!visible) return null;

  return (
    <div className="page-loader">
      {/* Red bar at very top */}
      <div className="page-loader__bar-track">
        <motion.div
          className="page-loader__bar"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
        <motion.div
          className="page-loader__glow"
          animate={{ left: `${progress}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        />
      </div>

      {/* Full-screen overlay while loading */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            className="page-loader__overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <motion.div
              className="page-loader__logo"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="page-loader__logo-jp">夢</span>
              <span className="page-loader__logo-text">yume</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
