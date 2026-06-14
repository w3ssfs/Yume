import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import Header from '../components/Header/Header';
import './LegalPage.css';

export default function TermsPage() {
  return (
    <div className="legal-page">
      <Header />
      <div className="legal-page__inner container">
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb__item"><FiHome size={14} />Home</Link>
          <FiChevronRight size={13} className="breadcrumb__sep" />
          <span className="breadcrumb__item breadcrumb__item--active">Termos de Uso</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="legal-title">Termos de Uso</h1>
          <p className="legal-updated">Última atualização: Junho de 2026</p>

          <section className="legal-section">
            <h2>1. Sobre o serviço</h2>
            <p>
              O Yume é um projeto pessoal, desenvolvido sem fins comerciais, com o objetivo
              de catalogar e exibir informações sobre animes utilizando dados públicos da
              Jikan API (MyAnimeList). Ao utilizar este site, você concorda com os termos
              descritos abaixo.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Uso aceitável</h2>
            <p>
              Você concorda em utilizar o site apenas para fins pessoais e não comerciais,
              não tentando explorar, sobrecarregar ou comprometer a segurança da plataforma
              ou dos serviços de terceiros integrados (Jikan API, Firebase).
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Conta e autenticação</h2>
            <p>
              O login é realizado exclusivamente via conta Google, através do Firebase
              Authentication. Você é responsável por manter a segurança do acesso à sua
              conta Google. Funcionalidades de favoritos e lista de "Assistir Depois"
              requerem autenticação.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Conteúdo de terceiros</h2>
            <p>
              As informações sobre animes (sinopses, imagens, notas, trailers e dados
              relacionados) são fornecidas pela Jikan API, que por sua vez extrai dados do
              MyAnimeList. Este projeto não é afiliado, endossado ou patrocinado pelo
              MyAnimeList.
            </p>
            <p>
              Trailers exibidos são incorporados via YouTube e seguem os termos de uso da
              plataforma.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Disponibilidade do serviço</h2>
            <p>
              Por se tratar de um projeto pessoal sem garantias de SLA, o site pode
              apresentar instabilidades, indisponibilidade temporária ou alterações sem
              aviso prévio, especialmente devido a limitações de uso (rate limits) das APIs
              externas utilizadas.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Propriedade intelectual</h2>
            <p>
              Marcas, imagens, capas e nomes de animes pertencem aos seus respectivos
              detentores de direitos. O código-fonte e design original deste site são de
              uso pessoal do desenvolvedor.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Limitação de responsabilidade</h2>
            <p>
              O Yume é fornecido "como está", sem garantias de qualquer tipo. O
              desenvolvedor não se responsabiliza por imprecisões nos dados exibidos, que
              são de responsabilidade das fontes originais (MyAnimeList via Jikan API).
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Alterações nos termos</h2>
            <p>
              Estes termos podem ser atualizados a qualquer momento. O uso continuado do
              site após alterações implica na aceitação dos novos termos.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
