import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Barcode, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import Logo from '../assets/Signatura_Logo-removebg-preview.png';
import GenesisModelImage from '../assets/Gemini_Generated_Image_rioln8rioln8riol.png';

const Landing = () => {
  // --- DYNAMIC DATABASE STATES ---
  const [featuredAssets, setFeaturedAssets] = useState([]);   // Ledger Assets (Limited)
  const [activeCitizens, setActiveCitizens] = useState([]);   // Operatives
  const [featuredArtists, setFeaturedArtists] = useState([]); // Artist Collection
  const [generalProducts, setGeneralProducts] = useState([]); // Featured Products (Local)

  useEffect(() => {
    const fetchLandingData = async () => {
      // 1. Fetch Ledger Products
      const { data: ledgerAssets } = await supabase.from('inventory').select('name, price, category, img, drop').eq('type', 'limited').limit(4);

      // 2. Fetch Artists
      const { data: artists } = await supabase.from('artists').select('name, classification, tier, photo').limit(3);

      // 3. Fetch General Products
      const { data: products } = await supabase.from('inventory').select('name, price, category, img').eq('type', 'local').limit(3);

      // 4. THE FIX: Fetch Citizens and filter out "Ghost" accounts with no items
      const { data: ops } = await supabase.from('operatives').select('nickname, favoriteClothing, favoriteColorHex, signature');
      const { data: vKeys } = await supabase.from('vault_keys').select('claimed_by').not('claimed_by', 'is', null);

      if (ops && vKeys) {
        // Find ops who actually own something
        const opsWithAssets = ops.filter(op => vKeys.some(k => k.claimed_by === op.nickname));
        setActiveCitizens(opsWithAssets.slice(0, 3)); // Only show max 3 on landing page
      }

      if (ledgerAssets) setFeaturedAssets(ledgerAssets);
      if (artists) setFeaturedArtists(artists);
      if (products) setGeneralProducts(products);
    };

    fetchLandingData();
  }, []);

  return (
    <div className="pt-24 pb-20 bg-[#050505]"> 
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center px-8 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black leading-none text-neutral-900/40 pointer-events-none z-0">01</div>
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col items-start pt-12 lg:pt-0">
            <div className="flex items-center gap-2 text-[#DC143C] mb-6 font-mono text-xs tracking-widest font-bold">
              <Target size={14} /> EXCLUSIVE DROP
            </div>
            <h1 className="text-white text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
              Genesis <br/>Drop
            </h1>
            <p className="text-neutral-400 max-w-md mb-10 text-sm md:text-base leading-relaxed">
              Forged by the God of hands. Signed by the Creator. Limited edition streetwear that transcends reality and binds to the blockchain.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/collection">
                <button className="bg-[#DC143C] text-black px-8 py-4 text-xs font-black tracking-widest uppercase hover:bg-white transition-colors">See Collection</button>
              </Link>
              <Link to="/ledger">
                <button className="border border-white/20 text-white px-8 py-4 text-xs font-black tracking-widest uppercase hover:border-white transition-colors">View Ledger</button>
              </Link>
            </div>

            <div className="flex flex-col gap-2 font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
              <p>Material: 100% Premium Cotton <span className="inline-block w-2 h-2 bg-[#DC143C] ml-2"></span></p>
              <p>Network: Signatura Cryptographic <span className="inline-block w-2 h-2 bg-[#DC143C] ml-2"></span></p>
            </div>
          </div>

          <div className="relative w-full max-w-md mx-auto aspect-[4/5]">
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t border-l border-[#DC143C]"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t border-r border-[#DC143C]"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b border-l border-[#DC143C]"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b border-r border-[#DC143C]"></div>
            <img src={GenesisModelImage} alt="Genesis Drop Model" className="w-full h-full object-cover border border-white/10 grayscale hover:grayscale-0 transition-all duration-700" />
            <div className="absolute -bottom-12 left-0 w-full flex justify-between items-end font-mono text-[10px] text-neutral-500 tracking-widest uppercase">
              <span>Signatura: 2026-GEN</span>
              <Barcode size={32} className="text-white opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THIN SCROLLING MARQUEE */}
      <div className="w-full border-y border-white/10 py-3 mt-20 overflow-hidden bg-black">
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="flex whitespace-nowrap font-mono text-[10px] tracking-[0.2em] text-[#DC143C] uppercase font-bold">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8">Phygital Handshake Required • Immutable Ledger • Authenticity Guaranteed •</span>
          ))}
        </motion.div>
      </div>

      {/* 3. DYNAMIC: FEATURED COLLABORATIONS (Artists) */}
      <section id="artists" className="px-8 py-24 max-w-7xl mx-auto">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-[2px] bg-[#DC143C]"></div>
              <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Live Personnel Roster</span>
            </div>
            <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter">Artist<br/>Collection</h2>
          </div>
          <Link to="/artists">
            <button className="border border-white/20 text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-white hover:text-black transition-colors hidden md:flex">
              View Roster <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {featuredArtists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArtists.map((artist, idx) => (
              <ArtistCard 
                key={idx}
                name={artist.name} 
                role={artist.classification} 
                tier={artist.tier} 
                img={artist.photo || "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop"} 
              />
            ))}
          </div>
        ) : (
          <div className="border border-neutral-800 p-12 text-center text-neutral-600 font-mono text-xs tracking-widest uppercase">
            ESTABLISHING UPLINK TO ROSTER... NO CREATORS FOUND.
          </div>
        )}
      </section>

      {/* 4. DYNAMIC: FEATURED PRODUCTS (Local Inventory) */}
      <section className="px-8 py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-[#DC143C]"></div>
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Latest Drops</span>
              </div>
              <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter">Featured<br/>Products</h2>
            </div>
            <Link to="/collection">
              <button className="border border-white/20 text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-white hover:text-black transition-colors">
                View All <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {generalProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {generalProducts.map((product, idx) => (
                <ProductCard 
                  key={idx} 
                  name={product.name} 
                  price={product.price} 
                  cat={product.category} 
                  img={product.img || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"} 
                  isNew={idx === 0} 
                />
              ))}
            </div>
          ) : (
            <div className="border border-neutral-800 p-12 text-center text-neutral-600 font-mono text-xs tracking-widest uppercase bg-black">
              NO LOCAL ASSETS DETECTED IN INVENTORY.
            </div>
          )}
        </div>
      </section>

      {/* 5. DYNAMIC FEATURED ASSETS (Ledger) */}
      <section className="px-8 py-24 bg-black border-t border-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-[#DC143C]"></div>
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Live Database Feed</span>
              </div>
              <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter">Classified<br/>Ledger Assets</h2>
            </div>
            <Link to="/ledger">
              <button className="border border-neutral-800 text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-white hover:text-black transition-colors">
                Explore Ledger <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {featuredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAssets.map((product, idx) => (
                <LedgerCard 
                  key={idx} 
                  name={product.name} 
                  price={product.price} 
                  cat={product.category} 
                  img={product.img || "https://images.unsplash.com/photo-1618354691438-25af04aa3cada?q=80&w=600&auto=format&fit=crop"} 
                  isNew={idx === 0}
                />
              ))}
            </div>
          ) : (
            <div className="border border-neutral-800 p-12 text-center text-neutral-600 font-mono text-xs tracking-widest uppercase">
              ESTABLISHING UPLINK TO LEDGER... NO ASSETS FOUND YET.
            </div>
          )}
        </div>
      </section>

      {/* 6. DYNAMIC VERIFIED CITIZENS (From Database) */}
      <section id="citizens" className="px-8 py-24 bg-[#050505] border-t border-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-[2px] bg-[#DC143C]"></div>
              <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Network Operatives</span>
            </div>
            <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter">Verified<br/>Citizens</h2>
          </div>

          {activeCitizens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeCitizens.map((citizen, idx) => (
                <CitizenCard 
                  key={idx} 
                  nickname={citizen.nickname} 
                  clothing={citizen.favoriteClothing} 
                  color={citizen.favoriteColorHex}
                  signature={citizen.signature}
                />
              ))}
            </div>
          ) : (
            <div className="border border-neutral-800 p-12 text-center text-neutral-600 font-mono text-xs tracking-widest uppercase">
              NO OPERATIVES REGISTERED IN THE SECTOR.
            </div>
          )}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer id="about" className="w-full border-t border-neutral-800 pt-20 pb-8 px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h2 className="text-white text-4xl font-black uppercase tracking-tighter mb-4">Join The<br/>Movement</h2>
              <p className="text-neutral-500 text-sm mb-8">Exclusive access to drops, phygital collabs, and behind-the-scenes engineering.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 font-mono text-[10px] tracking-widest uppercase">
              <div className="flex flex-col gap-4">
                <span className="font-bold text-[#DC143C] mb-2">Database</span>
                <Link to="/collection" className="text-neutral-500 hover:text-white transition-colors">Archive</Link>
                <Link to="/ledger" className="text-neutral-500 hover:text-white transition-colors">Global Ledger</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-bold text-[#DC143C] mb-2">Personnel</span>
                <Link to="/artists" className="text-neutral-500 hover:text-white transition-colors">Creators</Link>
                <Link to="/operatives" className="text-neutral-500 hover:text-white transition-colors">Citizens</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-neutral-900 text-neutral-600 font-mono text-[10px] tracking-widest">
            <img src={Logo} alt="Signatura" className="h-12 w-auto object-contain mb-4 md:mb-0" />
            <div className="flex gap-6">
              <span>© 2026 Signatura. All rights reserved.</span>
              <span className="flex items-center gap-1 text-[#DC143C]"><ShieldCheck size={12} /> SECURE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- REUSABLE COMPONENTS ---

// Dynamic Artist Card
const ArtistCard = ({ name, role, tier, img }) => (
  <div className="group border border-neutral-800 bg-neutral-950 flex flex-col cursor-pointer hover:border-white/30 transition-colors">
    <div className="relative aspect-[4/5] overflow-hidden">
      <img src={img} alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
    </div>
    <div className="p-4 flex justify-between items-end border-t border-neutral-800 text-white">
      <div>
        <h3 className="font-black uppercase text-xl tracking-tighter mb-1">{name}</h3>
        <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">{role}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-[8px] text-neutral-500 tracking-widest uppercase mb-1">Status</p>
        <p className="font-black text-[#DC143C] text-[10px] uppercase tracking-widest leading-none">{tier}</p>
      </div>
    </div>
  </div>
);

// Dynamic Product Card (With S, M, L, XL sizes)
const ProductCard = ({ name, price, cat, img, isNew }) => (
  <div className="group cursor-pointer">
    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 mb-4 border border-transparent group-hover:border-white/20 transition-colors">
      <img src={img} alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-700" />
      {isNew && (
        <div className="absolute top-3 right-3 bg-[#DC143C] text-black text-[9px] font-black tracking-widest px-2 py-1 uppercase">New</div>
      )}
    </div>
    <div className="flex justify-between items-start mb-4 text-white">
      <div>
        <h3 className="font-bold uppercase tracking-tight text-sm mb-1">{name}</h3>
        <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">{cat}</p>
      </div>
      <span className="font-bold text-sm">{price}</span>
    </div>
    <div className="flex gap-2">
      {['S', 'M', 'L', 'XL'].map(size => (
        <div key={size} className="w-8 h-8 border border-neutral-800 text-white flex items-center justify-center text-[10px] font-mono hover:border-white hover:bg-white hover:text-black transition-all">{size}</div>
      ))}
    </div>
  </div>
);

// Specialized Card for Limited Ledger Assets (No sizes, has cryptographic badge)
const LedgerCard = ({ name, price, cat, img, isNew }) => (
  <div className="group cursor-pointer">
    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 mb-4 border border-transparent group-hover:border-[#DC143C] transition-colors">
      <img src={img} alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-700" />
      {isNew && (
        <div className="absolute top-3 right-3 bg-[#DC143C] text-black text-[9px] font-black tracking-widest px-2 py-1 uppercase">Latest</div>
      )}
    </div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-white font-bold uppercase tracking-tight text-sm mb-1">{name}</h3>
        <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">{cat}</p>
      </div>
      <span className="text-white font-bold text-sm">{price}</span>
    </div>
    <div className="flex gap-2">
      <div className="px-3 py-1 border border-neutral-800 text-neutral-500 text-[9px] font-mono uppercase tracking-widest">Limited Cryptographic Asset</div>
    </div>
  </div>
);

// Dynamic Citizen Card
const CitizenCard = ({ nickname, color, clothing, signature }) => (
  <div className="group border border-neutral-800 bg-black p-6 flex flex-col hover:border-white/30 transition-colors">
    <div 
      className="w-full aspect-square mb-6 flex items-center justify-center relative overflow-hidden border border-neutral-800" 
      style={{ backgroundColor: color || '#DC143C' }}
    >
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
      <span className="text-[100px] font-black text-black/40 mix-blend-overlay uppercase leading-none">
        {nickname ? nickname.charAt(0) : 'X'}
      </span>
    </div>
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <p className="text-[#DC143C] font-mono text-[10px] tracking-widest uppercase mb-1">REGISTERED ALIAS</p>
        <h3 className="text-white font-black uppercase text-2xl tracking-tighter mb-4">{nickname}</h3>
        <div className="border-t border-neutral-800 pt-4 flex flex-col gap-2 font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
          <p>Key Asset: <span className="text-white ml-2">{clothing || 'CLASSIFIED'}</span></p>
          <p className="flex items-center">
            Aesthetic: 
            <span className="w-2 h-2 inline-block mx-2 border border-white/20" style={{ backgroundColor: color || '#DC143C' }}></span>
            <span className="text-white">{color || '#DC143C'}</span>
          </p>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-neutral-800">
         <p className="font-serif italic text-white text-xl capitalize truncate">{signature}</p>
      </div>
    </div>
  </div>
);

export default Landing;