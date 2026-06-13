import React from 'react';
import { Outlet } from 'react-router-dom';


import Footer from '../Footer/Footer';
import AnimeDetail from '../AnimeDetail/AnimeDetail';

export default function MainLayout() {
  return (
    <>
      

      <AnimeDetail />

      <main className="main">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}