import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiChevronRight, FiGithub, FiHeart, FiCode, FiDatabase } from 'react-icons/fi';
import Header from '../components/Header/Header';
import './LegalPage.css';

export default function AboutPage() {
  const navigate = useNavigate();

  const stack = [
    { icon: <FiCode size={18} />, label: 'React + Framer Motion', desc: 'Interface e animações fluidas' },
    { icon: <FiDatabase size={18} />, label: 'Jikan API', desc: 'Dados de animes do MyAnimeList' },
    { icon: <FiHeart size={18} />, label: 'Firebase', desc: 'Autenticação e favoritos em tempo real' },
  ];

  return (
    <div className="legal-page">
      <Header />
      <div className="legal-page__inner container">
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb__item"><FiHome size={14} />Home</Link>
          <FiChevronRight size={13} className="breadcrumb__sep" />
          <span className="breadcrumb__item breadcrumb__item--active">Sobre</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="legal-title">Sobre o Yume</h1>
          <p className="legal-updated">Um projeto pessoal feito com 夢 (sonhos) e código</p>

          <section className="legal-section">
            <h2>O que é o Yume?</h2>
            <p>
              Yume (夢, "sonho" em japonês) é um catálogo de animes criado como projeto
              pessoal e de portfólio. A proposta é oferecer uma forma elegante e fluida de
              explorar animes em exibição, lançamentos, animes populares e da temporada
              atual, com detalhes completos, trailers e a possibilidade de montar sua
              própria lista de favoritos.
            </p>
          </section>

          <section className="legal-section">
            <h2>Tecnologias utilizadas</h2>
            <div className="about-stack">
              {stack.map((item) => (
                <div key={item.label} className="about-stack__item">
                  <span className="about-stack__icon">{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="legal-section">
            <h2>Fonte dos dados</h2>
            <p>
              Todas as informações sobre animes — incluindo sinopses, capas, notas,
              gêneros, episódios e trailers — são fornecidas pela{' '}
              <a href="https://jikan.moe" target="_blank" rel="noreferrer" className="legal-link">
                Jikan API
              </a>
              , uma API REST não-oficial e gratuita para o MyAnimeList. Este projeto não é
              afiliado ao MyAnimeList ou ao Jikan.
            </p>
          </section>

          <section className="legal-section">
            <h2>Projeto pessoal</h2>
            <p>
              O Yume não possui fins comerciais e não exibe anúncios. Foi desenvolvido como
              forma de aprendizado e experimentação com interfaces modernas, animações,
              autenticação e bancos de dados em tempo real.
            </p>
          </section>

          <section className="legal-section">
            <h2>Saiba mais</h2>
            <p>
              Confira nossa{' '}
              <button className="legal-link legal-link--btn" onClick={() => navigate('/privacidade')}>
                Política de Privacidade
              </button>{' '}
              e{' '}
              <button className="legal-link legal-link--btn" onClick={() => navigate('/termos')}>
                Termos de Uso
              </button>{' '}
              para mais informações sobre como seus dados são tratados.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
