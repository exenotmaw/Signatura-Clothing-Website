import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const TargetLines = ({ active }) => (
  <div className="absolute inset-0 pointer-events-none z-10">
    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: active ? '100%' : 0, opacity: active ? 1 : 0 }} className="absolute top-1/2 left-0 h-[1.5px] bg-[#DC143C] shadow-[0_0_8px_#DC143C]" />
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: active ? '100%' : 0, opacity: active ? 1 : 0 }} className="absolute left-1/2 top-0 w-[1.5px] bg-[#DC143C] shadow-[0_0_8px_#DC143C]" />
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }} className="absolute top-1/2 left-1/2 w-[60px] h-[60px] border-[1.5px] border-[#DC143C] rounded-full -translate-x-1/2 -translate-y-1/2" />
  </div>
);

// --- THE SECURE VAULT MODAL ---
const VaultModal = ({ operative, inventory, vaultKeys, onClose }) => {
  // Find all keys claimed by this operative
  const acquiredKeys = vaultKeys.filter(key => key.claimed_by === operative.nickname);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[9999] flex justify-center items-center p-5 backdrop-blur-md"
    >
      <div className="w-full max-w-[900px] bg-[#050505] border border-neutral-800 relative overflow-y-auto max-h-[90vh]">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#DC143C]" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#DC143C]" />

        <button onClick={onClose} className="absolute top-5 right-5 text-white bg-transparent border border-neutral-800 px-4 py-2 font-mono text-[10px] cursor-pointer uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
          Terminate View X
        </button>

        <div className="p-10 md:p-16">
          <h1 className="text-white text-4xl md:text-5xl font-black uppercase m-0 leading-none tracking-tighter mb-10">
            Personal <br/><span className="text-[#DC143C]">Secure Vault.</span>
          </h1>

          <div className="flex flex-col gap-12">
            <div className="border-l-2 border-neutral-800 pl-5">
              <p className="text-[#DC143C] text-[10px] font-mono uppercase tracking-[0.3em] font-bold mb-4">01 // Verified Ownership</p>
              <p className="text-neutral-400 text-base leading-relaxed max-w-[600px] m-0">
                These physical assets have been cryptographically verified and permanently bound to Operative {operative.nickname}. This ledger is immutable.
              </p>
            </div>

            <div className="border-l-2 border-neutral-800 pl-5">
              <p className="text-[#DC143C] text-[10px] font-mono uppercase tracking-[0.3em] font-bold mb-4">02 // Vault Inventory</p>
              
              <div className="border border-neutral-800 bg-black">
                {acquiredKeys.length > 0 ? (
                  acquiredKeys.map((key, idx) => {
                    // Match the key's asset_id with the master inventory to get the name/material
                    const asset = inventory.find(item => item.id === key.asset_id);
                    return (
                      <div key={idx} className={`flex flex-col md:flex-row ${idx !== acquiredKeys.length - 1 ? 'border-b border-neutral-800' : ''}`}>
                        <div className="w-full md:w-32 p-4 border-b md:border-b-0 md:border-r border-neutral-800 text-neutral-500 font-mono text-[10px] flex items-center">
                          SGN-{key.asset_id}
                        </div>
                        <div className="flex-1 p-4 text-white font-bold uppercase flex items-center">
                          {asset ? asset.name : 'UNKNOWN ASSET'}
                        </div>
                        <div className="flex-1 p-4 text-neutral-400 text-xs uppercase flex items-center">
                          {asset ? asset.material : 'CLASSIFIED'}
                        </div>
                        <div className="p-4 text-[#DC143C] font-black tracking-widest flex items-center">
                          SN: {key.serial_number}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-neutral-500 font-mono text-[10px] uppercase tracking-widest">
                    VAULT IS CURRENTLY EMPTY. NO ACQUISITIONS ON RECORD.
                  </div>
                )}
              </div>
            </div>

            <div className="border-l-2 border-neutral-800 pl-5">
              <p className="text-[#DC143C] text-[10px] font-mono uppercase tracking-[0.3em] font-bold mb-4">03 // Dossier Signature</p>
              <div className="text-white text-5xl font-serif italic tracking-tighter">
                {operative.signature}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- THE OPERATIVE CARD ---
const OperativeCard = ({ operative, inventory, vaultKeys }) => {
  const [imgHover, setImgHover] = useState(false);
  const [showVault, setShowVault] = useState(false);

  // Dynamic Avatar Generator
  const avatarBg = operative.favoriteColorHex || '#333';
  const initial = operative.nickname ? operative.nickname.charAt(0).toUpperCase() : 'X';

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[1000px] bg-black border border-neutral-800 p-10 relative mb-20">
        
        {/* Red Tech Corners */}
        <div className="absolute top-0 left-0 w-[30px] h-[30px] border-t-4 border-l-4 border-[#DC143C]" />
        <div className="absolute top-0 right-0 w-[30px] h-[30px] border-t-4 border-r-4 border-[#DC143C]" />
        <div className="absolute bottom-0 left-0 w-[30px] h-[30px] border-b-4 border-l-4 border-[#DC143C]" />
        <div className="absolute bottom-0 right-0 w-[30px] h-[30px] border-b-4 border-r-4 border-[#DC143C]" />

        <div className="flex justify-between border-b-2 border-neutral-800 pb-4 mb-8">
          <div>
            <p className="text-[#DC143C] text-[10px] font-bold m-0 tracking-[0.2em]">SIGNATURA NETWORK</p>
            <h2 className="text-white text-2xl font-black m-0">OPERATIVE DOSSIER</h2>
          </div>
          <div className="text-right text-white text-xs font-mono">
            <p className="text-[#DC143C] m-0">{operative.id}</p>
            <p className="m-0 mt-1 uppercase text-neutral-500">Citizen Level</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* Dynamic Avatar Block */}
          <div onMouseEnter={() => setImgHover(true)} onMouseLeave={() => setImgHover(false)} className="w-full md:w-[320px] shrink-0 cursor-crosshair relative">
            <div className="border-2 border-white relative overflow-hidden h-[400px] flex items-center justify-center" style={{ backgroundColor: avatarBg }}>
              <TargetLines active={imgHover} />
              
              {/* Graphic Elements Inside Avatar */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <motion.div animate={{ scale: imgHover ? 1.1 : 1 }} transition={{ duration: 0.5 }} className="text-[200px] font-black text-white/30 mix-blend-overlay">
                {initial}
              </motion.div>
              <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/70 tracking-widest uppercase">
                ID: {operative.id}
              </div>
            </div>
            
            <button 
              onClick={() => setShowVault(true)}
              className="w-full bg-[#DC143C] text-black border-none text-center font-black text-xs p-3 mt-4 cursor-pointer uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white hover:text-black"
            >
              SECURE VAULT // VIEW ASSETS
            </button>
          </div>

          {/* Dossier Data */}
          <div className="flex-1 min-w-[300px]">
            <div className="border-l-4 border-[#DC143C] pl-4 mb-8">
              <p className="text-[#DC143C] text-[10px] m-0 tracking-widest">NICKNAME (ALIAS)</p>
              <h3 className="text-white text-4xl md:text-5xl font-black m-0 leading-none uppercase">{operative.nickname}</h3>
            </div>

            <div className="border-2 border-white w-full font-mono">
              <div className="flex border-b-2 border-white">
                <div className="w-[150px] p-4 bg-white text-black font-bold text-[10px]">FAVORITE ASSET</div>
                <div className="p-4 text-white font-bold text-sm uppercase truncate">{operative.favoriteClothing}</div>
              </div>
              <div className="flex border-b-2 border-white">
                <div className="w-[150px] p-4 bg-white text-black font-bold text-[10px]">AESTHETIC (HEX)</div>
                <div className="p-4 text-white font-bold flex items-center gap-4">
                  <div className="w-[20px] h-[20px] border border-white" style={{ backgroundColor: operative.favoriteColorHex || '#DC143C' }} />
                  <span className="text-sm">{operative.favoriteColorHex}</span>
                </div>
              </div>
              <div className="flex">
                <div className="w-[150px] p-4 bg-white text-black font-bold text-[10px]">SIGNATURE</div>
                <div className="p-4 text-white text-2xl font-serif italic truncate">{operative.signature}</div>
              </div>
            </div>

            <div className="mt-12 flex justify-between items-end">
              <div className="flex-1">
                <div className="flex gap-[3px] h-[45px] items-end pr-5">
                  {[...Array(30)].map((_, i) => (<div key={i} className="bg-white w-[3px]" style={{ height: Math.random() > 0.5 ? '100%' : '60%' }} />))}
                </div>
                <p className="text-neutral-500 text-[8px] mt-3 tracking-[0.3em] font-mono">NET-{operative.id}-CRYPT</p>
              </div>
              <div className="text-right min-w-[120px]">
                <p className="text-[#DC143C] text-[9px] m-0 font-bold tracking-[0.2em]">STATUS</p>
                <p className="text-white text-xl font-black m-0 tracking-[0.1em]">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between border-t-2 border-neutral-800 mt-10 pt-4 font-mono text-[10px] text-neutral-600 uppercase tracking-widest">
          <p className="m-0">CLASSIFICATION: <span className="text-[#DC143C] font-bold">VERIFIED OPERATIVE</span></p>
          <p className="m-0">ACCESS GRANTED</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showVault && <VaultModal operative={operative} inventory={inventory} vaultKeys={vaultKeys} onClose={() => setShowVault(false)} />}
      </AnimatePresence>
    </>
  );
};

// --- MAIN CITIZENS COMPONENT ---
const Operatives = ({ inventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [operativesList, setOperativesList] = useState([]);
  const [vaultKeys, setVaultKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the Operatives and Vault Ledger when the page loads
  useEffect(() => {
    const fetchCitizenData = async () => {
      const [opsResponse, vaultResponse] = await Promise.all([
        supabase.from('operatives').select('*'),
        supabase.from('vault_keys').select('*')
      ]);
      
      if (opsResponse.data) setOperativesList(opsResponse.data);
      if (vaultResponse.data) setVaultKeys(vaultResponse.data);
      setIsLoading(false);
    };
    fetchCitizenData();
  }, []);

  // Only show operatives who have AT LEAST ONE bound asset in the vault
  const filteredOperatives = operativesList.filter(op => {
    // 1. Check if they have keys
    const hasBoundAsset = vaultKeys.some(key => key.claimed_by === op.nickname);
    if (!hasBoundAsset) return false;

    // 2. Check if they match the search bar
    return op.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           op.id?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-[#DC143C] uppercase tracking-[0.3em] animate-pulse">Decrypting Network Records...</div>;
  }

  return (
    <div className="bg-black min-h-screen pt-[200px] pb-[100px] px-5 flex flex-col items-center">
      <div className="max-w-[1000px] w-full mb-10 text-center">
        <h1 className="text-white text-5xl md:text-[72px] font-black uppercase m-0 tracking-tighter leading-[1.1]">Citizen Directory</h1>
        <p className="text-[#DC143C] text-xs tracking-[0.5em] uppercase mt-4 font-bold">Public Verification Ledger</p>
        
        <div className="mt-12 relative max-w-[500px] mx-auto group">
          <input 
            type="text" 
            placeholder="SEARCH BY ALIAS OR ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-black border-2 border-neutral-800 text-white p-5 font-mono text-xs tracking-widest outline-none transition-colors group-focus-within:border-[#DC143C]" 
          />
        </div>
      </div>

      <AnimatePresence>
        <div className="w-full flex flex-col items-center mt-16">
          {filteredOperatives.length > 0 ? (
            filteredOperatives.map((op) => (
              <OperativeCard key={op.id} operative={op} inventory={inventory} vaultKeys={vaultKeys} />
            ))
          ) : (
            <p className="text-neutral-500 font-mono mt-20 tracking-[0.3em] uppercase text-xs">NO OPERATIVES FOUND IN DATABASE.</p>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Operatives;