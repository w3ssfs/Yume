import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import { SeasonCarouselSection, CategoryPanelsSection, TopAnimeCarouselSection } from '../components/Sections/Sections';
import CallToAction from '../components/Sections/CallToAction';

import PageLoader from '../components/UI/PageLoader';
import { useCurrentSeason, useTopAnime } from '../hooks/useAnime';
import { mockTopAnimes } from '../data/mockTopAnimes.js';

export default function HomePage() {
  const { data: seasonAnimes, loading: l1 } = useCurrentSeason();
  const { data: topAnimes, loading: l2 } = useTopAnime(20);

  const ready = !l1 && !l2 &&
    (seasonAnimes.length > 0 || topAnimes.length > 0);

  return (
    <>
      <PageLoader ready={ready} />
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <Header />
        <Hero />
        <SeasonCarouselSection animes={seasonAnimes} />
        <CategoryPanelsSection topAnimes={mockTopAnimes} />
        <TopAnimeCarouselSection animes={topAnimes} />
        <CallToAction anime={topAnimes[3] || null} />

      </div>
    </>
  );
}
