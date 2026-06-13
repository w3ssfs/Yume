import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DetailProvider } from './context/DetailContext';
import AnimeDetail from './components/AnimeDetail/AnimeDetail';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import './styles/globals.css';
import Footer from './components/Footer/Footer';
import NotFoundPage from './pages/NotFoundPage';
import FavoritesPage from './pages/FavoritePage';
import MainLayout from './components/Layouts/MainLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DetailProvider>

          <Routes>
            {/* Layout com Header + Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/browse/:category" element={<BrowsePage />} />
              <Route path="/favorite" element={<FavoritesPage />} />
            </Route>

            {/* Página sem layout (SEM footer) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </DetailProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
