import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// --- IMPORTS ---
import Landing from './Pages/Landing';
import Collection from './Pages/Collection';
import Artists from './Pages/Artists';
import ProductDetail from './Pages/ProductDetail'; // <-- CRITICAL: Make sure this is here!

import Logo from './assets/Signatura_Logo-removebg-preview.png';

const Navbar = () => (
  <nav className="fixed top-0 w-full px-8 py-4 flex justify-between items-center border-b border-white/10 z-50 bg-black/80 backdrop-blur-md">
    <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity">
      <img 
        src={Logo} 
        alt="Signatura" 
        className="h-20 w-auto object-contain" 
      />
    </Link>
    
    <div className="flex gap-12 text-xs font-mono tracking-widest text-neutral-400">
      <Link to="/collection" className="hover:text-white transition-colors">COLLECTIONS</Link>
      <Link to="/artists" className="hover:text-white transition-colors">ARTISTS</Link>
      <a href="/#about" className="hover:text-white transition-colors">ABOUT</a>
    </div>

    <div className="w-10 md:hidden"></div>
  </nav>
);

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
        <Navbar />
        
        {/* --- ROUTING SYSTEM --- */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/artists" element={<Artists />} />
          
          {/* THE NEW PRODUCT ROUTE */}
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
};

export default App;