import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { supabase } from './supabaseClient'; 

import Landing from './Pages/Landing';
import Collection from './Pages/Collection';
import Artists from './Pages/Artists';
import Operatives from './Pages/Operatives';
import LimitedLedger from './Pages/LimitedLedger';
import ProductDetail from './Pages/ProductDetail';
import AdminDashboard from './Pages/AdminDashboard';
import AuthTerminal from './Pages/AuthTerminal';
import VerifyTerminal from './Pages/VerifyTerminal';
import DossierSettings from './Pages/DossierSettings';
import Logo from './assets/Signatura_Logo-removebg-preview.png';

// ==========================================
// 1. INITIALIZE THE CACHING ENGINE
// ==========================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Trust cached data for 5 minutes before background refreshing
      gcTime: 1000 * 60 * 30, // Keep data in memory for 30 minutes after leaving the page
      refetchOnWindowFocus: false, // Prevents spamming the DB every time they click to another browser tab
      retry: 1 // Only retry failed requests once
    },
  },
});

const Navbar = ({ currentOperative }) => (
  <nav className="fixed top-0 w-full px-8 py-4 flex justify-between items-center border-b border-white/10 z-50 bg-black/80 backdrop-blur-md">
    <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity">
      <img src={Logo} alt="Signatura" className="h-20 w-auto object-contain" />
    </Link>
    <div className="flex gap-12 text-xs font-mono tracking-widest text-neutral-400 items-center">
      <Link to="/collection" className="hover:text-white transition-colors">COLLECTIONS</Link>
      <Link to="/ledger" className="hover:text-white transition-colors">LEDGER</Link>
      <Link to="/artists" className="hover:text-white transition-colors">ARTISTS</Link>
      <Link to="/operatives" className="hover:text-white transition-colors">CITIZENS</Link>
      <a href="/#about" className="hover:text-white transition-colors">ABOUT</a>
      
      {currentOperative ? (
        <div className="flex items-center gap-6">
          <Link to="/settings" className="text-white border-b border-[#DC143C] pb-1 hover:text-[#DC143C] transition-colors cursor-pointer">
            OP: {currentOperative.nickname}
          </Link>
        </div>
      ) : (
        <Link to="/auth" className="hover:text-white transition-colors text-[#DC143C]">LOGIN</Link>
      )}
    </div>
    <div className="w-10 md:hidden"></div>
  </nav>
);

// ==========================================
// 2. THE CORE APPLICATION LOGIC
// ==========================================
const SignaturaCore = () => {
  const [currentOperative, setCurrentOperative] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- REACT QUERY FETCHING PROTOCOLS ---
  // These hooks automatically handle caching, loading states, and background updates
  
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const { data, error } = await supabase.from('artists').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: vaultKeys = [] } = useQuery({
    queryKey: ['vaultKeys'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vault_keys').select('*');
      if (error) throw error;
      return data;
    }
  });

  // --- AUTHENTICATION LISTENER ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: dossier } = await supabase.from('operatives').select('*').eq('auth_id', session.user.id).single();
        if (dossier) setCurrentOperative(dossier);
      }
      setIsAuthLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') setCurrentOperative(null);
      if (event === 'SIGNED_IN' && session) {
        const { data: dossier } = await supabase.from('operatives').select('*').eq('auth_id', session.user.id).single();
        if (dossier) setCurrentOperative(dossier);
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-[#DC143C] text-xs tracking-[0.3em] uppercase">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-t-2 border-[#DC143C] rounded-full animate-spin"></div>
          ESTABLISHING SECURE CONNECTION...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
        <Navbar currentOperative={currentOperative} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/collection" element={<Collection inventory={inventory} />} />
          <Route path="/artists" element={<Artists artists={artists} inventory={inventory} />} />
          <Route path="/operatives" element={<Operatives inventory={inventory} />} /> 
          <Route path="/ledger" element={<LimitedLedger inventory={inventory} vaultKeys={vaultKeys} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* Note: Admin dashboard might need manual setInventory overrides depending on your specific edit logic, but the cache handles the initial load beautifully */}
          <Route path="/admin" element={<AdminDashboard inventory={inventory} artists={artists} vaultKeys={vaultKeys} />} />
          
          {/* Route Guards applied */}
          <Route path="/auth" element={currentOperative ? <Navigate to="/" replace /> : <AuthTerminal inventory={inventory} setCurrentOperative={setCurrentOperative} />} />
          <Route path="/verify/:secureHash" element={<VerifyTerminal inventory={inventory} currentOperative={currentOperative} />} />
          <Route path="/settings" element={<DossierSettings inventory={inventory} currentOperative={currentOperative} setCurrentOperative={setCurrentOperative} vaultKeys={vaultKeys} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

// ==========================================
// 3. EXPORT WITH CACHING PROVIDER
// ==========================================
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SignaturaCore />
    </QueryClientProvider>
  );
};

export default App;