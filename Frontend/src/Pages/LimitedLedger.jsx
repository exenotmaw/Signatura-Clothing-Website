import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LimitedLedger = ({ inventory, vaultKeys }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // FILTER STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCreator, setFilterCreator] = useState('');

  // 1. Get Base Limited Assets
  const limitedAssets = useMemo(() => {
    return inventory.filter(item => item.type === 'limited');
  }, [inventory]);

  // 2. Extract Unique Filters for Dropdowns
  const categories = [...new Set(limitedAssets.map(item => item.category).filter(Boolean))].sort();
  const creators = [...new Set(limitedAssets.map(item => item.artist_name || item.creator).filter(Boolean))].sort();

  // 3. Apply Active Filters to the Left Column List
  const filteredAssets = useMemo(() => {
    return limitedAssets.filter(asset => {
      const matchesCategory = filterCategory ? asset.category === filterCategory : true;
      const assetCreator = asset.artist_name || asset.creator;
      const matchesCreator = filterCreator ? assetCreator === filterCreator : true;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery ? (
        (asset.name || '').toLowerCase().includes(searchLower) ||
        `sgn-${asset.id}`.toLowerCase().includes(searchLower)
      ) : true;

      return matchesCategory && matchesCreator && matchesSearch;
    });
  }, [limitedAssets, filterCategory, filterCreator, searchQuery]);

  // Get keys specifically for the chosen asset (Right Column)
  const getAssetKeys = (assetId) => {
    return vaultKeys.filter(k => k.asset_id === assetId).sort((a, b) => a.serial_number.localeCompare(b.serial_number));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-4 sm:px-8 font-mono relative">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 border-b-2 border-[#DC143C] pb-6">
          <p className="text-[#DC143C] text-[10px] tracking-[0.3em] uppercase mb-2 font-bold animate-pulse">Public Chain Verification</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Immutable Ledger</h1>
        </div>

        {/* FILTER CONSOLE (NEW) */}
        <div className="bg-black border border-neutral-800 p-6 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Search (Name / SGN ID)</label>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="e.g. SGN-001..." 
                className="bg-transparent border border-neutral-700 p-3 text-xs text-white outline-none focus:border-[#DC143C] transition-colors uppercase placeholder:text-neutral-700"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Filter by Category</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)} 
                className="bg-black border border-neutral-700 p-3 text-xs text-white outline-none focus:border-[#DC143C] uppercase"
              >
                <option value="">ALL CATEGORIES</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Creator Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest">Filter by Creator</label>
              <select 
                value={filterCreator} 
                onChange={(e) => setFilterCreator(e.target.value)} 
                className="bg-black border border-neutral-700 p-3 text-xs text-white outline-none focus:border-[#DC143C] uppercase"
              >
                <option value="">ALL CREATORS</option>
                {creators.map(creator => <option key={creator} value={creator}>{creator}</option>)}
              </select>
            </div>

          </div>
        </div>

        {/* MAIN SPLIT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: Limited Assets Directory (Now uses filteredAssets) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <h2 className="text-neutral-500 text-[10px] uppercase tracking-widest mb-2 border-b border-neutral-800 pb-2 flex justify-between">
              <span>Classified Limited Assets</span>
              <span className="text-[#DC143C] font-bold">{filteredAssets.length} FOUND</span>
            </h2>
            
            {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
              <button 
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`text-left p-4 border transition-colors flex items-center gap-4 group ${selectedAsset?.id === asset.id ? 'bg-[#DC143C] border-[#DC143C] text-black' : 'bg-black border-neutral-800 text-white hover:border-white'}`}
              >
                <img src={asset.image_url || asset.img} alt={asset.name} className={`w-12 h-12 object-cover filter ${selectedAsset?.id === asset.id ? 'grayscale-0' : 'grayscale'}`} />
                <div>
                  <p className="font-black uppercase tracking-widest text-sm leading-none mb-1">{asset.name}</p>
                  <p className={`text-[9px] uppercase tracking-widest ${selectedAsset?.id === asset.id ? 'text-black/70' : 'text-neutral-500'}`}>SGN-{asset.id} // QTY: {asset.productNumber}</p>
                </div>
              </button>
            )) : (
               <div className="border border-dashed border-neutral-800 p-6 text-center">
                 <p className="text-neutral-600 text-xs">NO ASSETS MATCH QUERY.</p>
                 <button 
                  onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterCreator(''); }} 
                  className="mt-2 text-[#DC143C] text-[9px] font-bold uppercase hover:text-white underline decoration-[#DC143C]"
                 >
                  CLEAR FILTERS
                 </button>
               </div>
            )}
          </div>

          {/* RIGHT: Status Grid (Stays exactly as you had it) */}
          <div className="w-full lg:w-2/3 border border-neutral-800 bg-black min-h-[500px] p-6 relative">
            {!selectedAsset ? (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-[10px] uppercase tracking-widest font-bold text-center">
                <div className="w-8 h-8 border border-neutral-600 mb-4 mx-auto animate-spin" />
                SELECT AN ASSET TO INITIATE LEDGER SCAN
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                <div className="flex justify-between items-end border-b border-neutral-800 pb-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase text-white tracking-tighter">{selectedAsset.name}</h2>
                    <p className="text-[#DC143C] text-[10px] tracking-widest uppercase mt-1">Creator: {selectedAsset.artist_name || selectedAsset.creator}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 text-[9px] uppercase tracking-widest">Global Status</p>
                    <p className="text-white text-sm font-bold uppercase">
                      {getAssetKeys(selectedAsset.id).filter(k => k.claimed_by).length} / {selectedAsset.productNumber} Claimed
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
                  <AnimatePresence>
                    {getAssetKeys(selectedAsset.id).map((keyItem) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        key={keyItem.serial_number} 
                        className={`p-4 border flex justify-between items-center ${keyItem.claimed_by ? 'border-neutral-800 bg-neutral-900/50' : 'border-[#DC143C]/30 bg-[#DC143C]/5'}`}
                      >
                        <div>
                          <p className="text-[10px] text-neutral-500 tracking-widest mb-1">SERIAL NUM</p>
                          <p className={`font-black text-lg ${keyItem.claimed_by ? 'text-white' : 'text-[#DC143C]'}`}>{keyItem.serial_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-widest mb-1 text-neutral-500">OWNER</p>
                          {keyItem.claimed_by ? (
                            <span className="bg-black text-white px-2 py-1 text-[10px] border border-neutral-700 uppercase">
                              OP: {keyItem.claimed_by}
                            </span>
                          ) : (
                            <span className="text-[#DC143C] text-[10px] font-bold tracking-widest animate-pulse">
                              UNCLAIMED
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LimitedLedger;