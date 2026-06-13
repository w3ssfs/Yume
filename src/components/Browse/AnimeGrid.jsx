import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AnimeCard from '../AnimeCard/AnimeCard';
import './AnimeGrid.css';

export default function AnimeGrid({
  items = [],
  loading,
  pagination,
  page,
  onPageChange
}) {
  const totalPages = pagination?.last_visible_page || 1;
  const hasNext = pagination?.has_next_page;

  const changePage = (newPage) => {
    onPageChange(newPage);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 7;

    let start = Math.max(1, page - 3);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="anime-grid anime-grid--loading">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="anime-grid__skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <motion.div
        className="anime-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {items
          .filter(
            (anime, index, self) =>
              index === self.findIndex(a => a.mal_id === anime.mal_id)
          )
          .map((anime) => (
            <AnimeCard
              key={`${anime.mal_id}-${anime.title}`}
              anime={anime}
            />
          ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="anime-grid__pagination">
          <motion.button
            className="page-btn"
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronLeft size={16} />
            Anterior
          </motion.button>

          <div className="page-numbers">
            {page > 4 && (
              <>
                <button
                  className="page-num"
                  onClick={() => changePage(1)}
                >
                  1
                </button>

                <span className="page-ellipsis">...</span>
              </>
            )}

            {getVisiblePages().map((p) => (
              <motion.button
                key={p}
                className={`page-num ${page === p ? 'page-num--active' : ''
                  }`}
                onClick={() => changePage(p)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {p}
              </motion.button>
            ))}

            {page < totalPages - 3 && (
              <>
                <span className="page-ellipsis">...</span>

                <button
                  className="page-num"
                  onClick={() => changePage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <motion.button
            className="page-btn"
            disabled={!hasNext}
            onClick={() => changePage(page + 1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Próximo
            <FiChevronRight size={16} />
          </motion.button>
        </div>
      )}
    </div>
  );
}