import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const FOOTER_LINKS = {
  'Navegar': [
    { label: 'Início', path: '/' },
    { label: 'Temporada Atual', path: '/browse/season' },
    { label: 'Trending', path: '/browse/trending' },
    { label: 'Próximos', path: '/browse/upcoming' },
  ],
  'Conta': [

    { label: 'Favoritos', path: '/favorite' },
    { label: 'Lista de Assistir', path: '/favorite'},
  ],
  'Suporte': [
    { label: 'Privacidade', path: '/privacidade' },
    { label: 'Termos de Uso', path: '/termos' },
    { label: 'Sobre', path: '/sobre' },
  ],
};

const SOCIALS = [
  { icon: <FiTwitter size={17} />, label: 'Twitter' },
  { icon: <FiInstagram size={17} />, label: 'Instagram' },
  { icon: <FiYoutube size={17} />, label: 'YouTube' },
  { icon: <FiGithub size={17} />, label: 'GitHub' },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__top-inner">
          <div className="footer__brand">
            <div className="footer__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <span className="footer__logo-jp">夢</span>
              <span className="footer__logo-text">yume</span>
            </div>
            <p className="footer__tagline">Seu portal de animes.<br />Descubra, assista, apaixone-se.</p>
            <div className="footer__socials">
              {SOCIALS.map((s) => (
                <motion.button key={s.label} className="footer__social-btn" aria-label={s.label}
                  whileHover={{ scale: 1.15, color: 'var(--accent-glow)' }} transition={{ duration: 0.15 }}>
                  {s.icon}
                </motion.button>
              ))}
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
            <div key={cat} className="footer__links-col">
              <h4 className="footer__links-title">{cat}</h4>
              <ul className="footer__links-list">
                {links.map((link) => (
                  <li key={link.label}>
                    <motion.a href="#" className="footer__link"
                      onClick={(e) => { e.preventDefault(); if (link.path) navigate(link.path); }}
                      whileHover={{ x: 3, color: 'var(--text-primary)' }} transition={{ duration: 0.15 }}>
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copyright">
            © 2026 Yume Anime. Dados fornecidos por{' '}
            <a href="https://jikan.moe" target="_blank" rel="noreferrer" className="footer__link-inline">Jikan API</a>
            {' '}& <a href="https://myanimelist.net" target="_blank" rel="noreferrer" className="footer__link-inline">MyAnimeList</a>
          </p>
          <div className="footer__badges">
            <span className="footer__badge">Não afiliado ao MAL</span>
            <span className="footer__badge footer__badge--accent">Versão 1.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
