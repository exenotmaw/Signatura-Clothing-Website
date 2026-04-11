import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Barcode } from 'lucide-react';
import { Link } from 'react-router-dom'; // Added routing link

const Landing = () => {
  return (
    <div className="pt-24 pb-20"> {/* Replaced nav with padding-top */}
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center px-8 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black leading-none text-neutral-900/40 pointer-events-none z-0">
          01
        </div>

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col items-start pt-12 lg:pt-0">
            <div className="flex items-center gap-2 text-red-600 mb-6 font-mono text-xs tracking-widest font-bold">
              <Target size={14} /> EXCLUSIVE DROP
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
              Genesis <br/>Drop
            </h1>
            <p className="text-neutral-400 max-w-md mb-10 text-sm md:text-base leading-relaxed">
              Forged by the God of hands. Signed by the Creator. Limited edition streetwear that transcends reality.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              {/* Linked Shop Now Button */}
              <Link to="/collection">
                <button className="bg-red-600 text-white px-8 py-4 text-xs font-black tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
                  Shop Now
                </button>
              </Link>
              <button className="border border-white/20 px-8 py-4 text-xs font-black tracking-widest uppercase hover:border-white transition-colors">
                Explore
              </button>
            </div>

            <div className="flex flex-col gap-2 font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
              <p>Material: 100% Premium Cotton <span className="inline-block w-2 h-2 bg-red-600 ml-2"></span></p>
              <p>Edition: Limited 500 Units <span className="inline-block w-2 h-2 bg-red-600 ml-2"></span></p>
            </div>
          </div>

          <div className="relative w-full max-w-md mx-auto aspect-[4/5]">
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t border-l border-red-600"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t border-r border-red-600"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b border-l border-red-600"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b border-r border-red-600"></div>
            <img 
              src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop" 
              alt="Genesis Drop Model" 
              className="w-full h-full object-cover border border-white/10 grayscale hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute -bottom-12 left-0 w-full flex justify-between items-end font-mono text-[10px] text-neutral-500 tracking-widest uppercase">
              <span>Signatura: 2026-001</span>
              <Barcode size={32} className="text-white opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THIN SCROLLING MARQUEE */}
      <div className="w-full border-y border-white/10 py-3 mt-20 overflow-hidden bg-neutral-950">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex whitespace-nowrap font-mono text-[10px] tracking-[0.2em] text-neutral-400 uppercase"
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8">
              Limited Edition • 500 Units Worldwide • Authenticity Guaranteed •
            </span>
          ))}
        </motion.div>
      </div>

      {/* 3. FEATURED COLLABORATIONS */}
      <section id="artists" className="px-8 py-24 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-[2px] bg-red-600"></div>
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Featured Collaborations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Artist<br/>Collection</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ArtistCard name="Takashi Mori" role="Visual Artist" drop="01" img="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop" />
          <ArtistCard name="Luna Vega" role="Streetwear Designer" drop="02" img="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop" />
          <ArtistCard name="Axiom Crew" role="Creative Collective" drop="03" img="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop" />
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="px-8 py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-red-600"></div>
                <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Latest Drops</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Featured<br/>Products</h2>
            </div>
            <Link to="/collection">
              <button className="border border-white/20 px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-white hover:text-black transition-colors">
                View All <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard name="Ghost Tech Hoodie" price="$245" cat="Outerwear" img="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" isNew />
            <ProductCard name="Cipher Tee" price="$95" cat="Essentials" img="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop" isNew />
            <ProductCard name="Void Cargo Pants" price="$185" cat="Bottoms" img="https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop" isNew />
            <ProductCard name="Neon Track Jacket" price="$265" cat="Outerwear" img="https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=600&auto=format&fit=crop" isNew />
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer id="about" className="w-full border-t border-white/10 pt-20 pb-8 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Join The<br/>Movement</h2>
            <p className="text-neutral-500 text-sm mb-8">Exclusive access to drops, collabs, and behind-the-scenes content.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 font-mono text-[10px] tracking-widest uppercase">
            <div className="flex flex-col gap-4">
              <span className="font-bold text-white mb-2">Shop</span>
              <Link to="/collection" className="text-neutral-500 hover:text-white transition-colors">New Arrivals</Link>
              <Link to="/collection" className="text-neutral-500 hover:text-white transition-colors">Collections</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold text-white mb-2">Company</span>
              <a href="#" className="text-neutral-500 hover:text-white transition-colors">About Us</a>
              <a href="#" className="text-neutral-500 hover:text-white transition-colors">Careers</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-neutral-900 text-neutral-600 font-mono text-[10px] tracking-widest">
          <span className="text-lg font-black italic tracking-tighter text-white mb-4 md:mb-0">Signatura.</span>
          <div className="flex gap-6">
            <span>© 2026 Signatura. All rights reserved.</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Reusable Components
const ArtistCard = ({ name, role, drop, img }) => (
  <div className="group border border-neutral-800 bg-neutral-950 flex flex-col cursor-pointer hover:border-white/30 transition-colors">
    <div className="relative aspect-[4/5] overflow-hidden">
      <img src={img} alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
    </div>
    <div className="p-4 flex justify-between items-end border-t border-neutral-800">
      <div>
        <h3 className="font-black uppercase text-xl tracking-tighter mb-1">{name}</h3>
        <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">{role}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-[8px] text-neutral-500 tracking-widest uppercase mb-1">Drop</p>
        <p className="font-black text-red-600 text-xl leading-none">{drop}</p>
      </div>
    </div>
  </div>
);

const ProductCard = ({ name, price, cat, img, isNew }) => (
  <div className="group cursor-pointer">
    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 mb-4 border border-transparent group-hover:border-white/20 transition-colors">
      <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      {isNew && (
        <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black tracking-widest px-2 py-1 uppercase">New</div>
      )}
    </div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold uppercase tracking-tight text-sm mb-1">{name}</h3>
        <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">{cat}</p>
      </div>
      <span className="font-bold text-sm">{price}</span>
    </div>
    <div className="flex gap-2">
      {['S', 'M', 'L', 'XL'].map(size => (
        <div key={size} className="w-8 h-8 border border-neutral-800 flex items-center justify-center text-[10px] font-mono hover:border-white hover:bg-white hover:text-black transition-all">{size}</div>
      ))}
    </div>
  </div>
);

export default Landing;