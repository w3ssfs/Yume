import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import { SeasonCarouselSection, CategoryPanelsSection, TopAnimeCarouselSection } from '../components/Sections/Sections';
import CallToAction from '../components/Sections/CallToAction';
import Footer from '../components/Footer/Footer';
import PageLoader from '../components/UI/PageLoader';
import { useCurrentSeason, useTopAnime, useFeatured } from '../hooks/useAnime';

export default function HomePage() {
  const { data: seasonAnimes, loading: l1 } = useCurrentSeason();
  const { data: topAnimes, loading: l2 } = useTopAnime(20);
  const { data: featured, loading: l3 } = useFeatured();

  const ready = !l1 && !l2 && !l3 &&
    (seasonAnimes.length > 0 || topAnimes.length > 0 || featured.length > 0);

  return (
    <>
      <PageLoader ready={ready} />
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <Header />
        <Hero />
        <SeasonCarouselSection animes={seasonAnimes} />
        <CategoryPanelsSection topAnimes={topAnimes} />
        <TopAnimeCarouselSection animes={topAnimes} />
        <CallToAction anime={topAnimes[3] || null} />
        <Footer />
      </div>
    </>
  );
}
