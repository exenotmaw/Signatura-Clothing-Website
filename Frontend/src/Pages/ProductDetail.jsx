import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProductDetail = () => {
  // 1. Get the ID from the URL (e.g., "001")
  const { id } = useParams();
  
  // 2. Setup State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. Fetch specific asset from Supabase on load
  useEffect(() => {
    const fetchAsset = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', id)
        .single(); // Tells Supabase we only expect 1 row back

      if (error) {
        console.error("Failed to retrieve asset:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchAsset();
  }, [id]);

  // Loading Screen (Tech-Noir Style)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-xs tracking-widest text-[#DC143C] uppercase animate-pulse">
        Decrypting Asset Data...
      </div>
    );
  }

  // Error Screen (If someone types a bad URL)
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono text-xs tracking-widest uppercase">
        <span className="text-neutral-500 mb-4">ERROR 404</span>
        <span className="text-white">Asset not found in secure database.</span>
        <Link to="/collection" className="mt-8 text-[#DC143C] hover:text-white border-b border-[#DC143C] pb-1 transition-colors">Return to Archive</Link>
      </div>
    );
  }

  // Formatting macros array from the database fields
  const macros = [
    product.macro1 || product.img, // fallback to main img if empty
    product.macro2 || product.img,
    product.macro3 || product.img
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 px-4 sm:px-8 relative">
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        <div className="mb-8 flex justify-between items-end border-b-2 border-[#DC143C] pb-4">
          <div>
            <Link to="/collection" className="text-neutral-500 hover:text-white font-mono text-[10px] tracking-[0.2em] uppercase transition-colors">
              &lt; RETURN TO COLLECTION
            </Link>
            <h2 className="text-2xl font-black mt-2 tracking-tighter uppercase">ASSET REPOSITORY</h2>
          </div>
          <div className="text-right text-[10px] font-mono text-[#DC143C] tracking-widest uppercase">
            SECURE VIEWING // SGN-{product.id}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row border border-neutral-800 lg:h-[750px]">
          
          <div className="w-full lg:w-[35%] border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col justify-between p-8 bg-black">
            <div>
              <p className="text-[#DC143C] font-mono text-[10px] tracking-[0.3em] uppercase mb-4 font-bold">
                CLASSIFIED DROP // {product.drop || '01'}
              </p>
              <h1 className="text-5xl xl:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                {product.name}
              </h1>
              
              <div className="space-y-6 text-sm">
                <p className="text-neutral-400 font-serif italic text-lg border-l-2 border-neutral-800 pl-4">
                  "{product.description}"
                </p>

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

          </div>

          <div className="w-full lg:w-[45%] border-b lg:border-b-0 lg:border-r border-neutral-800 relative bg-[#050505] p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2 font-mono text-[9px] text-neutral-500 tracking-widest uppercase">
              <span>PRIMARY VISUAL</span>
              <span className="text-[#DC143C] font-bold">VERIFIED // {product.status || 'IN STOCK'}</span>
            </div>
            
            <div className="relative flex-1 border border-neutral-800 overflow-hidden group">
              <motion.img 
                src={product.img} 
                alt={product.name}
                initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-[1.1] opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="w-full h-[1px] bg-white absolute" />
                <div className="w-[1px] h-full bg-white absolute" />
                <div className="w-8 h-8 border border-white rounded-full absolute" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.span 
                  initial={{ opacity: 0, rotate: -5 }} animate={{ opacity: 0.7, rotate: -10 }} transition={{ delay: 0.5, duration: 1 }}
                  className="font-serif italic text-white/40 text-7xl md:text-9xl tracking-tighter drop-shadow-2xl mix-blend-overlay"
                >
                  {/* Safely split the creator name to get the first name for the watermark */}
                  {product?.creator?.split(' ')[0] || 'VERIFIED'}
                </motion.span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[20%] flex flex-row lg:flex-col bg-black">
            <div className="hidden lg:block border-b border-neutral-800 p-3 text-center text-[9px] text-neutral-500 font-mono tracking-[0.2em] uppercase">
              MACRO ANALYSIS // DETAILS
            </div>
            
            {macros.map((imgUrl, idx) => (
              <div key={idx} className={`relative flex-1 w-full h-48 lg:h-auto border-r lg:border-r-0 lg:border-b border-neutral-800 overflow-hidden group ${idx === 2 ? 'border-none' : ''}`}>
                <img 
                  src={imgUrl} 
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

        <div className="mt-8 flex justify-between font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
          <p>FORGED BY THE GOD OF HANDS</p>
          <p>SIGNED BY THE CREATOR</p>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;