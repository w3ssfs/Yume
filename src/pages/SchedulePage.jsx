import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { getWeeklySchedule } from '../services/anilistApi';
import Header from '../components/Header/Header';
import './SchedulePage.css';

const DAY_PT   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTH_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function sameDay(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function dayLabel(date) {
  const today    = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  if (sameDay(date, today))    return { primary: 'Hoje',   secondary: `${date.getDate()} de ${MONTH_PT[date.getMonth()]}`, isToday: true };
  if (sameDay(date, tomorrow)) return { primary: 'Amanhã', secondary: `${date.getDate()} de ${MONTH_PT[date.getMonth()]}`, isToday: false };
  return { primary: `${DAY_PT[date.getDay()]} ${date.getDate()}`, secondary: MONTH_PT[date.getMonth()], isToday: false };
}

function formatTime(ts) {
  return new Date(ts * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function groupByDay(schedules) {
  const map = new Map();
  schedules.forEach(item => {
    const d   = new Date(item.airingAt * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map.has(key)) map.set(key, { date: d, items: [] });
    map.get(key).items.push(item);
  });
  return [...map.values()].sort((a, b) => a.date - b.date);
}

function DayCard({ group, index }) {
  const { primary, secondary, isToday } = dayLabel(group.date);
  const now = Date.now();

  return (
    <motion.div
      className={`sched-card ${isToday ? 'sched-card--today' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="sched-card__header">
        <div className="sched-card__day-info">
          <span className="sched-card__primary">{primary}</span>
          <span className="sched-card__secondary">{secondary}</span>
        </div>
        <span className="sched-card__count">{group.items.length} eps</span>
      </div>

      <div className="sched-card__list">
        {group.items.map(item => {
          const title  = item.media.title.english || item.media.title.romaji;
          const time   = formatTime(item.airingAt);
          const isPast = item.airingAt * 1000 < now;

          return (
            <div key={`${item.media.id}-${item.episode}`} className={`sched-entry ${isPast ? 'sched-entry--past' : ''}`}>
              <span className="sched-entry__time">{time}</span>
              <span className="sched-entry__title">{title}</span>
              <span className="sched-entry__ep">Ep.{item.episode}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

const REFRESH_MS = 5 * 60 * 1000; // atualiza a cada 5 minutos

export default function SchedulePage() {
  const [groups,      setGroups]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);

  const load = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);

    getWeeklySchedule()
      .then(data => {
        setGroups(groupByDay(data));
        setLastUpdated(new Date());
      })
      .catch(() => setError(true))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  // Carga inicial
  useEffect(() => { load(); }, [load]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const timeAgo = lastUpdated
    ? `atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : '';

  return (
    <div className="sched-page">
      <div className="sched-page__inner container">

        {/* Header */}
        <Header />
        <motion.div className="sched-top" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}>
          <div className="sched-top__left">
            <FiCalendar size={18} className="sched-top__icon" />
            <div>
              <h1 className="sched-top__title">Agenda da Semana</h1>
              {lastUpdated && <p className="sched-top__sub">{timeAgo}</p>}
            </div>
          </div>

          <button
            className={`sched-refresh ${refreshing ? 'sched-refresh--spinning' : ''}`}
            onClick={() => load(true)}
            disabled={refreshing}
            title="Atualizar"
          >
            <FiRefreshCw size={14} />
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="sched-state">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <FiLoader size={22} />
            </motion.div>
            <span>Carregando agenda...</span>
          </div>
        )}

        {/* Erro */}
        {error && !loading && (
          <div className="sched-state sched-state--error">
            <FiAlertCircle size={22} />
            <span>Não foi possível carregar. <button onClick={() => load()}>Tentar novamente</button></span>
          </div>
        )}

        {/* Grid 2 colunas */}
        {!loading && !error && (
          <div className="sched-grid">
            {groups.map((group, i) => (
              <DayCard key={group.date.toISOString()} group={group} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}