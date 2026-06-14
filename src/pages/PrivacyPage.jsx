import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import Header from '../components/Header/Header';
import './LegalPage.css';

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <Header />
      <div className="legal-page__inner container">
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb__item"><FiHome size={14} />Home</Link>
          <FiChevronRight size={13} className="breadcrumb__sep" />
          <span className="breadcrumb__item breadcrumb__item--active">Privacidade</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="legal-title">Política de Privacidade</h1>
          <p className="legal-updated">Última atualização: Junho de 2026</p>

          <section className="legal-section">
            <h2>1. Introdução</h2>
            <p>
              O Yume é um projeto pessoal e não comercial, criado para fins de estudo e
              demonstração. Esta página explica de forma simples quais dados são coletados
              e como são utilizados ao usar o site.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Dados coletados</h2>
            <p>
              Ao fazer login com sua conta Google, coletamos apenas seu nome, e-mail e foto
              de perfil, fornecidos diretamente pelo Google através do Firebase
              Authentication. Não temos acesso à sua senha em nenhum momento.
            </p>
            <p>
              Quando você favorita um anime ou adiciona à sua lista "Assistir Depois",
              armazenamos essas informações (título, capa, gêneros, nota e ano do anime)
              associadas ao seu identificador de usuário no Firebase Firestore.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Uso dos dados</h2>
            <p>
              Os dados coletados são usados exclusivamente para personalizar sua experiência
              no site, permitindo salvar e exibir sua lista de favoritos e animes para
              assistir depois. Não vendemos, compartilhamos ou utilizamos seus dados para
              fins de marketing ou publicidade.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Serviços de terceiros</h2>
            <p>
              Este site utiliza a <strong>Jikan API</strong> (uma API não oficial do
              MyAnimeList) para exibir informações sobre animes, e o{' '}
              <strong>Firebase</strong> (Google) para autenticação e armazenamento de
              dados. Ambos possuem suas próprias políticas de privacidade.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Cookies e armazenamento local</h2>
            <p>
              Utilizamos cookies e armazenamento local apenas para manter sua sessão
              autenticada ativa. Nenhum cookie é utilizado para rastreamento publicitário.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Exclusão de dados</h2>
            <p>
              Você pode remover seus favoritos e itens da lista "Assistir Depois" a
              qualquer momento diretamente na interface. Para solicitar a exclusão completa
              da sua conta e dados associados, entre em contato através das redes sociais
              listadas no rodapé.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Alterações nesta política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. Recomendamos revisitar esta
              página de tempos em tempos para se manter informado sobre quaisquer mudanças.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
