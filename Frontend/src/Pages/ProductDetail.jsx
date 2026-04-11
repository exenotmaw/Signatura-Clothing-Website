import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- MOCK PRODUCT DATA ---
const product = {
  id: "ASSET-001-TM",
  name: "OBSIDIAN WEAVE HOODIE",
  creator: "Takashi Mori",
  status: "VERIFIED // IN STOCK",
  price: "12,000 JPY",
  material: "Heavyweight 450gsm Cotton / Phantom Thread",
  description: "Forged for the urban shadows. The Obsidian Weave integrates stealth-tech aesthetics with brutalist comfort. Engineered with articulated joints and a deep-cowl hood. Each piece carries the digital signature of the creator.",
  // High-contrast main image
  mainImage: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop", 
  // Macro detail shots (textures, zippers, close-ups)
  macros: [
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400&auto=format&fit=crop", // Fabric texture
    "https://images.unsplash.com/photo-1528606160759-459892c9bbf2?q=80&w=400&auto=format&fit=crop", // Seam/Zipper
    "https://images.unsplash.com/photo-1613521140785-e85e427f8002?q=80&w=400&auto=format&fit=crop"  // Detail
  ]
};

const ProductDetail = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 px-4 sm:px-8 relative">
      
      {/* 1. SUBTLE GRAIN BACKGROUND TEXTURE */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Navigation / Breadcrumb */}
        <div className="mb-8 flex justify-between items-end border-b-2 border-[#DC143C] pb-4">
          <div>
            <Link to="/collection" className="text-neutral-500 hover:text-white font-mono text-[10px] tracking-[0.2em] uppercase transition-colors">
              &lt; RETURN TO COLLECTION
            </Link>
            <h2 className="text-2xl font-black mt-2 tracking-tighter uppercase">ASSET REPOSITORY</h2>
          </div>
          <div className="text-right text-[10px] font-mono text-[#DC143C] tracking-widest uppercase">
            SECURE VIEWING // {product.id}
          </div>
        </div>

        {/* --- THE BLUEPRINT GRID LAYOUT --- */}
        {/* Fixed height on desktop prevents images from blowing up the page */}
        <div className="flex flex-col lg:flex-row border border-neutral-800 lg:h-[750px]">
          
          {/* COLUMN 1: PRODUCT DATA (Left) */}
          <div className="w-full lg:w-[35%] border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col justify-between p-8 bg-black">
            <div>
              <p className="text-[#DC143C] font-mono text-[10px] tracking-[0.3em] uppercase mb-4 font-bold">
                CLASSIFIED DROP 01
              </p>
              <h1 className="text-5xl xl:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                {product.name}
              </h1>
              
              <div className="space-y-6 text-sm">
                <p className="text-neutral-400 font-serif italic text-lg border-l-2 border-neutral-800 pl-4">
                  "{product.description}"
                </p>

                {/* Technical Specs Table */}
                <div className="border border-neutral-800 font-mono text-[10px] uppercase">
                  <div className="flex border-b border-neutral-800">
                    <div className="w-1/3 p-3 text-neutral-500 border-r border-neutral-800">CREATOR</div>
                    <div className="p-3 text-white font-bold">{product.creator}</div>
                  </div>
                  <div className="flex border-b border-neutral-800">
                    <div className="w-1/3 p-3 text-neutral-500 border-r border-neutral-800">MATERIAL</div>
                    <div className="p-3 text-white font-bold">{product.material}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 p-3 text-neutral-500 border-r border-neutral-800">PRICE</div>
                    <div className="p-3 text-[#DC143C] font-bold text-xs">{product.price}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions / Barcode */}
            <div className="mt-12 lg:mt-0">
              <div className="flex gap-[2px] h-8 items-end mb-4 opacity-50">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="bg-white flex-1" style={{ height: Math.random() > 0.5 ? '100%' : '60%' }} />
                ))}
              </div>
              <button className="w-full bg-[#DC143C] text-black font-black text-sm uppercase tracking-[0.2em] py-4 hover:bg-white transition-colors duration-300">
                AUTHORIZE ACQUISITION
              </button>
            </div>
          </div>

          {/* COLUMN 2: MAIN IMAGE & SIGNATURE (Center) */}
          <div className="w-full lg:w-[45%] border-b lg:border-b-0 lg:border-r border-neutral-800 relative bg-[#050505] p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2 font-mono text-[9px] text-neutral-500 tracking-widest uppercase">
              <span>PRIMARY VISUAL</span>
              <span className="text-[#DC143C] font-bold">{product.status}</span>
            </div>
            
            {/* The strictly bounded image container */}
            <div className="relative flex-1 border border-neutral-800 overflow-hidden group">
              <motion.img 
                src={product.mainImage} 
                alt={product.name}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-[1.1] opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
              
              {/* Center Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="w-full h-[1px] bg-white absolute" />
                <div className="w-[1px] h-full bg-white absolute" />
                <div className="w-8 h-8 border border-white rounded-full absolute" />
              </div>

              {/* Minimalist Signature Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.span 
                  initial={{ opacity: 0, rotate: -5 }}
                  animate={{ opacity: 0.7, rotate: -10 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="font-serif italic text-white/40 text-7xl md:text-9xl tracking-tighter drop-shadow-2xl mix-blend-overlay"
                >
                  {product.creator.split(' ')[0]}
                </motion.span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: MACRO DETAILS GRID (Right) */}
          <div className="w-full lg:w-[20%] flex flex-row lg:flex-col bg-black">
            <div className="hidden lg:block border-b border-neutral-800 p-3 text-center text-[9px] text-neutral-500 font-mono tracking-[0.2em] uppercase">
              MACRO ANALYSIS // DETAILS
            </div>
            
            {/* 3 stacked detail shots */}
            {product.macros.map((img, idx) => (
              <div 
                key={idx} 
                className={`relative flex-1 w-full h-48 lg:h-auto border-r lg:border-r-0 lg:border-b border-neutral-800 overflow-hidden group ${idx === 2 ? 'border-none' : ''}`}
              >
                <img 
                  src={img} 
                  alt={`Detail ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 text-[8px] font-mono text-[#DC143C] uppercase">
                  ZOOM 0{idx + 1}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Accent */}
        <div className="mt-8 flex justify-between font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
          <p>FORGED BY THE GOD OF HANDS</p>
          <p>SIGNED BY THE CREATOR</p>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;