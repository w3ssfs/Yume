import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import { SeasonCarouselSection, CategoryPanelsSection, TopAnimeCarouselSection } from '../components/Sections/Sections';
import CallToAction from '../components/Sections/CallToAction';

import PageLoader from '../components/UI/PageLoader';
import { useCurrentSeason } from '../hooks/useAnime';
import { mockTopAnimes } from '../data/mockTopAnimes.js';

export default function HomePage() {
  const { data: seasonAnimes, loading: l1 } = useCurrentSeason();

  const featuredAnime =
    mockTopAnimes[4] || topAnimes?.[11];

  const ready = !l1 &&
    (seasonAnimes.length > 0 || topAnimes.length > 0);

  return (
    <>
      <PageLoader ready={ready} />
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <Header />
        <Hero />
        <SeasonCarouselSection animes={seasonAnimes} />
        <CategoryPanelsSection topAnimes={mockTopAnimes} />        
        <CallToAction anime={featuredAnime || null} />

      </div>
    </>
  );
}
