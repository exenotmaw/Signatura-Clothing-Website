import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ArrowRight, Search } from 'lucide-react'; 
import { Link } from 'react-router-dom';

const filters = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Accessories'];

// ACCEPT THE LIVE DATABASE INVENTORY HERE
const Collection = ({ inventory }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // FILTER LOGIC NOW USES `inventory` INSTEAD OF `catalogData`
  const filteredProducts = inventory.filter((product) => {
    const matchesCategory = activeFilter === 'All' || product.category === activeFilter;
    
    // Safety check: ensure product.name exists before checking .includes()
    const matchesSearch = product.name 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 pb-20 relative overflow-hidden min-h-screen">
      
      {/* Massive Background Text */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black leading-none pointer-events-none z-0 stroke-text opacity-30">
        INDEX
      </div>

      <div className="max-w-[90rem] mx-auto px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-[#DC143C]"></div>
              <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Complete Archive</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              The <br/>Collection
            </h1>
          </div>

          <div className="text-right flex flex-col items-end">
            <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-2">
              Showing {filteredProducts.length} of {inventory.length} Assets
            </p>
            <div className="flex items-center gap-2 text-[#DC143C] font-black text-sm uppercase tracking-widest">
              <Filter size={16} /> Filter Protocol
            </div>
          </div>
        </div>

        {/* --- TOOLS BAR (Filters + Search) --- */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12">
          
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 text-[10px] font-black tracking-widest uppercase border transition-all duration-300 ${
                  activeFilter === filter 
                    ? 'border-[#DC143C] bg-[#DC143C] text-white' 
                    : 'border-white/20 text-neutral-400 hover:border-white hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#DC143C] transition-colors" size={16} />
            <input
              type="text"
              placeholder="SEARCH BY NAME OR ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-white/20 text-white pl-12 pr-4 py-3 font-mono text-[10px] tracking-widest outline-none focus:border-[#DC143C] transition-colors uppercase placeholder:text-neutral-600"
            />
            <div className="absolute bottom-0 left-0 h-[2px] bg-[#DC143C] transition-all duration-300 w-0 group-focus-within:w-full"></div>
          </div>
        </div>

        {/* Product Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                key={product.id}
                className="group cursor-pointer flex flex-col"
              >
                {/* Image Frame */}
                <div className="relative aspect-[4/5] bg-neutral-900 border border-neutral-800 overflow-hidden mb-4 group-hover:border-[#DC143C] transition-colors duration-500">
                  <img 
                    src={product.img || "https://images.unsplash.com/photo-1618354691438-25af04aa3cada?q=80&w=800&auto=format&fit=crop"} 
                    alt={product.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20">
                    <span className="font-mono text-[9px] tracking-widest bg-black/80 px-2 py-1 uppercase text-neutral-300 border border-white/10">
                      DRP // {product.drop || '01'}
                    </span>
                    {product.status && product.status !== 'Available' && (
                      <span className="font-black text-[9px] tracking-widest bg-[#DC143C] text-white px-2 py-1 uppercase">
                        {product.status}
                      </span>
                    )}
                  </div>

                  {/* Quick Add Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 backdrop-blur-sm">
                    <Link 
                      to={`/product/${product.id}`} 
                      className="border border-white text-white px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-colors"
                    >
                      View Asset <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-lg mb-1 group-hover:text-[#DC143C] transition-colors">{product.name}</h3>
                    <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">ID: SGN-{product.id}</p>
                  </div>
                  <span className="font-black text-lg">{product.price}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="w-full py-24 flex flex-col items-center justify-center border border-dashed border-neutral-800 text-neutral-500 font-mono text-xs uppercase tracking-widest"
          >
            <Search className="mb-4 opacity-50" size={32} />
            DATABASE EMPTY. NO ASSETS FOUND.
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Collection;