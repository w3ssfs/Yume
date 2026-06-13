import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DetailProvider } from './context/DetailContext';
import AnimeDetail from './components/AnimeDetail/AnimeDetail';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import './styles/globals.css';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DetailProvider>
          {/* Global detail panel — rendered once, outside routes */}
          <AnimeDetail />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/browse/:category" element={<BrowsePage />} />
          </Routes>
          <Footer />
        </DetailProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
