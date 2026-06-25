import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const VerifyTerminal = ({ inventory, currentOperative }) => {
  const { secureHash } = useParams(); // Reads the hash from the URL
  const navigate = useNavigate();
  
  const [assetDetails, setAssetDetails] = useState(null);
  const [keyData, setKeyData] = useState(null);
  const [status, setStatus] = useState('SCANNING...'); // SCANNING, UNCLAIMED, CLAIMED, ERROR
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!currentOperative) {
      alert("UNAUTHORIZED ACCESS. Please log in to your Dossier to verify assets.");
      navigate('/auth');
      return;
    }

    const interrogateHash = async () => {
      // 1. Look up the secure hash in the vault_keys table
      const { data: vaultRecord, error } = await supabase
        .from('vault_keys')
        .select('*')
        .eq('key_hash', secureHash)
        .single();

      if (error || !vaultRecord) {
        setStatus('ERROR');
        return;
      }

      setKeyData(vaultRecord);

      // 2. Find the visual/text data for that specific item from the inventory
      const foundAsset = inventory.find(item => item.id === vaultRecord.asset_id);
      if (foundAsset) {
        setAssetDetails(foundAsset);
      }

      // 3. Check if someone already owns it
      if (vaultRecord.claimed_by) {
        setStatus('CLAIMED');
      } else {
        setStatus('UNCLAIMED');
      }
    };

    interrogateHash();
  }, [secureHash, currentOperative, inventory, navigate]);

  const executeTransfer = async () => {
    setIsProcessing(true);
    
    // Update the vault_keys table directly to bind the owner
    const { error } = await supabase
      .from('vault_keys')
      .update({ claimed_by: currentOperative.nickname })
      .eq('key_hash', secureHash);

    if (error) {
      console.error("Transfer failed:", error);
      alert("SYSTEM ERROR: CRYPTOGRAPHIC BINDING FAILED.");
    } else {
      setStatus('CLAIMED');
      // Update local state so UI refreshes immediately
      setKeyData(prev => ({ ...prev, claimed_by: currentOperative.nickname }));
    }
    
    setIsProcessing(false);
  };

  if (status === 'SCANNING...') return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-[#DC143C] uppercase tracking-[0.3em] animate-pulse">Decrypting Physical Asset...</div>;

  if (status === 'ERROR') return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono text-center px-4">
      <h1 className="text-4xl text-[#DC143C] font-black uppercase mb-4">INVALID CIPHER</h1>
      <p className="text-neutral-500 tracking-widest text-xs mb-8">THIS QR CODE OR HASH DOES NOT EXIST IN THE VAULT.</p>
      <Link to="/" className="border border-white px-8 py-3 text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-colors">Return to Base</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-8 font-mono relative overflow-hidden">
      
      {/* Background Target Design */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-neutral-900 rounded-full opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-screen bg-neutral-900 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-screen bg-neutral-900 pointer-events-none" />

      <div className="max-w-[800px] mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <p className="text-[#DC143C] text-[10px] tracking-[0.3em] uppercase mb-2 font-bold animate-pulse">Secure Cryptographic Handshake</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Asset Interrogation</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black border border-neutral-800 relative">
          
          <div className={`p-4 text-[10px] tracking-[0.2em] uppercase font-bold flex justify-between items-center border-b border-neutral-800 ${status === 'CLAIMED' ? 'bg-neutral-900 text-neutral-500' : 'bg-[#DC143C] text-black'}`}>
            <span>STATUS: {status === 'CLAIMED' ? 'LOCKED & BOUND' : 'AWAITING AUTHORIZATION'}</span>
            <span>{new Date().toISOString().split('T')[0]}</span>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-neutral-800 relative p-6 flex justify-center items-center">
               <img src={assetDetails?.img || "https://images.unsplash.com/photo-1618354691438-25af04aa3cada"} alt="Asset" className="w-full aspect-square object-cover filter grayscale contrast-125 opacity-80" />
            </div>

            <div className="w-full md:w-2/3 p-8 flex flex-col justify-center">
              <div className="mb-8">
                <p className="text-[#DC143C] text-[10px] mb-1">DESIGNATION</p>
                <h2 className="text-2xl font-black uppercase tracking-tighter">{assetDetails?.name || 'CLASSIFIED ASSET'}</h2>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-l-2 border-neutral-800 pl-4 mb-8">
                <div><p className="text-neutral-500 text-[9px] uppercase tracking-widest mb-1">Base Model</p><p className="text-lg">SGN-{keyData.asset_id}</p></div>
                <div><p className="text-neutral-500 text-[9px] uppercase tracking-widest mb-1">Serial Print</p><p className="text-lg text-[#DC143C] font-bold">{keyData.serial_number}</p></div>
                <div className="col-span-2"><p className="text-neutral-500 text-[9px] uppercase tracking-widest mb-1">Cryptographic Hash</p><p className="text-sm font-bold tracking-[0.2em] text-neutral-400">{secureHash}</p></div>
              </div>

              {status === 'UNCLAIMED' ? (
                <button onClick={executeTransfer} disabled={isProcessing} className="w-full border border-[#DC143C] text-[#DC143C] hover:bg-[#DC143C] hover:text-black font-black py-4 uppercase tracking-[0.2em] transition-colors disabled:opacity-50">
                  {isProcessing ? 'PROCESSING BIND...' : 'AUTHORIZE ACQUISITION'}
                </button>
              ) : (
                <div className="w-full border border-neutral-800 bg-neutral-900/50 p-4 flex justify-between items-center text-[10px] uppercase tracking-widest">
                  <span className="text-neutral-500">OWNER REGISTERED:</span>
                  <span className="text-white font-bold bg-black px-3 py-1 border border-neutral-800">OP: {keyData.claimed_by}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
           <Link to="/collection" className="text-neutral-500 text-[9px] tracking-[0.3em] uppercase hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">Abort & Return to Archive</Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyTerminal;