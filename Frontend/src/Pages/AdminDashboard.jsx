import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient'; 
import { Turnstile } from '@marsidev/react-turnstile'; 
import { useQueryClient } from '@tanstack/react-query'; 

const AdminDashboard = ({ inventory, artists, vaultKeys }) => {
  const queryClient = useQueryClient(); 

  // ==========================================
  // LEVEL 5 SECURITY PROTOCOL & CAPTCHA
  // ==========================================
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [cipherInput, setCipherInput] = useState('');
  const [lockError, setLockError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // [NEW] STRICT ROLE VERIFICATION
      // Only unlock if a session exists AND the email exactly matches the master admin
      if (session && session.user.email === 'admin@signatura.network') {
        setIsAdminAuth(true);
      } else {
        // Keeps the terminal locked for regular Operatives
        setIsAdminAuth(false);
      }
    });
  }, []);

  const handleAdminUnlock = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLockError(false);
    
    if (!captchaToken) {
       console.error("NO CAPTCHA TOKEN");
       setIsAuthenticating(false);
       return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@signatura.network',
      password: cipherInput.trim(),
      options: { captchaToken: captchaToken }
    });

    if (error || !data.session) {
      console.error("SUPABASE SYSTEM REJECTION:", error?.message); 
      setLockError(true);
      setCipherInput('');
      setCaptchaToken(null);
    } else {
      setIsAdminAuth(true);
    }
    setIsAuthenticating(false);
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminAuth(false);
  };

  // ==========================================
  // [NEW] ACTION AUTHORIZATION PROTOCOL (PIN)
  // ==========================================
  const REQUIRED_PIN = '110703';
  const [pinState, setPinState] = useState({ isOpen: false, actionCallback: null, error: false });
  const [pinInputText, setPinInputText] = useState('');

  const requestAuthorization = (callback) => {
    // Intercepts the action and opens the verification modal
    setPinState({ isOpen: true, actionCallback: callback, error: false });
    setPinInputText('');
  };

  const executePinVerification = (e) => {
    e.preventDefault();
    if (pinInputText === REQUIRED_PIN) {
      // Pin correct: close modal and execute the trapped function
      setPinState(prev => ({ ...prev, isOpen: false, error: false }));
      if (pinState.actionCallback) pinState.actionCallback();
    } else {
      // Pin incorrect: show error, wipe input
      setPinState(prev => ({ ...prev, error: true }));
      setPinInputText('');
    }
  };

  const abortAuthorization = () => {
    setPinState({ isOpen: false, actionCallback: null, error: false });
    setPinInputText('');
  };

  const [activeModule, setActiveModule] = useState('inventory'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [activeVaultKeys, setActiveVaultKeys] = useState([]);
  const [activeVaultAsset, setActiveVaultAsset] = useState(null);

  // ==========================================
  // FILE UPLOAD HELPER FUNCTION
  // ==========================================
  const uploadImageToStorage = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('signatura-assets').upload(filePath, file);
    if (uploadError) {
      console.error('Storage Upload Error:', uploadError.message);
      throw uploadError;
    }

    const { data } = supabase.storage.from('signatura-assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // --- INVENTORY STATE & LOGIC ---
  const [invForm, setInvForm] = useState({ 
    id: '', assetName: '', name: '', price: '', type: 'local', productNumber: '', category: 'Tops',
    creator: '', material: '', description: '', img: '', macro1: '', macro2: '', macro3: ''
  });
  
  const [invFile, setInvFile] = useState(null); 
  const [macro1File, setMacro1File] = useState(null);
  const [macro2File, setMacro2File] = useState(null);
  const [macro3File, setMacro3File] = useState(null);
  
  const [isInvEditing, setIsInvEditing] = useState(false);

  const getNextInvId = () => {
    if (!inventory || inventory.length === 0) return '001';
    const maxId = Math.max(...inventory.map(item => parseInt(item.id, 10)));
    return String(maxId + 1).padStart(3, '0'); 
  };

  const generateSecureHash = () => {
    return `SIG-${Math.random().toString(36).substring(2,6).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
  };

  const handleInvSubmit = (e) => {
    e.preventDefault();
    
    if (!isInvEditing) {
      const isDuplicate = inventory.some(item => item.name.toLowerCase().trim() === invForm.name.toLowerCase().trim());
      if (isDuplicate) {
        alert("SYSTEM ERROR: ASSET DESIGNATION ALREADY EXISTS IN LEDGER.");
        return;
      }
    }

    // [NEW] Trap the submission logic inside the PIN Authorizer
    requestAuthorization(async () => {
      setIsProcessing(true);
      try {
        let finalImgUrl = invForm.img;
        let finalMacro1Url = invForm.macro1;
        let finalMacro2Url = invForm.macro2;
        let finalMacro3Url = invForm.macro3;

        const uploadPromises = [];
        if (invFile) uploadPromises.push(uploadImageToStorage(invFile).then(url => finalImgUrl = url));
        if (macro1File) uploadPromises.push(uploadImageToStorage(macro1File).then(url => finalMacro1Url = url));
        if (macro2File) uploadPromises.push(uploadImageToStorage(macro2File).then(url => finalMacro2Url = url));
        if (macro3File) uploadPromises.push(uploadImageToStorage(macro3File).then(url => finalMacro3Url = url));

        await Promise.all(uploadPromises);

        const payload = { 
          ...invForm, img: finalImgUrl, macro1: finalMacro1Url, macro2: finalMacro2Url, macro3: finalMacro3Url 
        };

        if (isInvEditing) {
          const { error } = await supabase.from('inventory').update(payload).eq('id', payload.id);
          if (!error) {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            cancelInvEdit();
          } else throw error;
        } else {
          const baseId = getNextInvId();
          const newAsset = { ...payload, id: baseId, drop: '01', status: 'Available' };
          
          const { data, error } = await supabase.from('inventory').insert([newAsset]).select();
          if (error) throw error;

          if (data) {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            
            if (newAsset.type === 'limited') {
              const qty = parseInt(newAsset.productNumber, 10);
              const generatedKeys = Array.from({ length: qty }, (_, i) => ({
                key_hash: generateSecureHash(),
                asset_id: baseId,
                serial_number: `${String(i + 1).padStart(3, '0')}/${String(qty).padStart(3, '0')}`
              }));
              await supabase.from('vault_keys').insert(generatedKeys);
              alert(`ASSET CREATED. ${qty} UNIQUE SECURE LINKS GENERATED.`);
              
              queryClient.invalidateQueries({ queryKey: ['vaultKeys'] });
            }
            cancelInvEdit();
          }
        }
      } catch (err) {
        console.error("Execution Failed:", err);
        alert(`SYSTEM ERROR: ${err.message || "FAILED TO PROCESS ASSET."}`);
      }
      setIsProcessing(false);
    });
  };

  const viewVaultKeys = async (asset) => {
    setActiveVaultAsset(asset);
    setVaultModalOpen(true);
    const { data } = await supabase.from('vault_keys').select('*').eq('asset_id', asset.id).order('serial_number', { ascending: true });
    setActiveVaultKeys(data || []);
  };

  const handleInvDelete = (id) => { 
    // [NEW] Trap the deletion logic inside the PIN Authorizer
    requestAuthorization(async () => {
      setIsProcessing(true); 
      await supabase.from('vault_keys').delete().eq('asset_id', id);
      await supabase.from('inventory').delete().eq('id', id); 
      
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['vaultKeys'] });
      setIsProcessing(false); 
    });
  };

  const cancelInvEdit = () => { 
    setIsInvEditing(false); 
    setInvFile(null); setMacro1File(null); setMacro2File(null); setMacro3File(null);
    setInvForm({ id: '', assetName: '', name: '', price: '', type: 'local', productNumber: '', category: 'Tops', creator: '', material: '', description: '', img: '', macro1: '', macro2: '', macro3: '' }); 
  };

  // --- ARTIST STATE & LOGIC ---
  const [artistForm, setArtistForm] = useState({ id: '', name: '', tier: 'TIER-S CREATOR', photo: '', favoriteClothing: '', favoriteColorHex: '#DC143C', signature: '', classification: 'TIER-S CREATOR' });
  const [artistFile, setArtistFile] = useState(null); 
  const [isArtistEditing, setIsArtistEditing] = useState(false);
  
  const availableCreators = [...new Set((inventory || []).map(item => item.creator).filter(name => name && name.trim() !== ''))];
  const availableClothing = [...new Set((inventory || []).map(item => item.name).filter(name => name && name.trim() !== ''))];

  const getNextArtistId = (artistName) => { 
    const num = (!artists || artists.length === 0) ? 1 : Math.max(...artists.map(a => parseInt(a.id.split('-')[0], 10))) + 1; 
    const numStr = String(num).padStart(3, '0'); 
    const initials = artistName ? artistName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'XX'; 
    return `${numStr}-${initials}-${new Date().getFullYear()}`; 
  };

  const handleArtistSubmit = (e) => { 
    e.preventDefault(); 
    
    if (!isArtistEditing) {
      const isDuplicate = artists.some(a => a.name.toLowerCase().trim() === artistForm.name.toLowerCase().trim());
      if (isDuplicate) {
        alert("SYSTEM ERROR: CREATOR ALREADY EXISTS IN PERSONNEL ROSTER.");
        return;
      }
    }

    // [NEW] Trap the submission logic inside the PIN Authorizer
    requestAuthorization(async () => {
      setIsProcessing(true); 
      try {
        let finalPhotoUrl = artistForm.photo;
        if (artistFile) finalPhotoUrl = await uploadImageToStorage(artistFile);

        const finalForm = { ...artistForm, classification: artistForm.tier, photo: finalPhotoUrl }; 

        if (isArtistEditing) { 
          const { error } = await supabase.from('artists').update(finalForm).eq('id', finalForm.id); 
          if (!error) { 
            queryClient.invalidateQueries({ queryKey: ['artists'] });
            cancelArtistEdit(); 
          } else throw error;
        } else { 
          const newArtist = { ...finalForm, id: getNextArtistId(finalForm.name), issuedDate: new Date().toISOString().split('T')[0] }; 
          const { data, error } = await supabase.from('artists').insert([newArtist]).select(); 
          if (!error && data) { 
            queryClient.invalidateQueries({ queryKey: ['artists'] });
            cancelArtistEdit(); 
          } else throw error;
        } 
      } catch (err) {
        console.error("Artist Execution Failed:", err);
        alert(`SYSTEM ERROR: ${err.message || "FAILED TO PROCESS PERSONNEL."}`);
      }
      setIsProcessing(false); 
    });
  };

  const handleArtistDelete = (id) => { 
    // [NEW] Trap the deletion logic inside the PIN Authorizer
    requestAuthorization(async () => {
      setIsProcessing(true); 
      await supabase.from('artists').delete().eq('id', id); 
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setIsProcessing(false); 
    });
  };

  const cancelArtistEdit = () => { 
    setIsArtistEditing(false); 
    setArtistFile(null); 
    setArtistForm({ id: '', name: '', tier: 'TIER-S CREATOR', photo: '', favoriteClothing: '', favoriteColorHex: '#DC143C', signature: '', classification: 'TIER-S CREATOR' }); 
  };

  const handleInputChange = (e, formSetter) => { 
    const { name, value } = e.target; 
    formSetter(prev => ({ ...prev, [name]: value })); 
  };

  // ==========================================
  // RENDER BLOCKS
  // ==========================================
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 font-mono">
        <div className="w-full max-w-md bg-black border border-[#DC143C] p-8 shadow-[0_0_30px_rgba(220,20,60,0.1)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl text-[#DC143C] font-black uppercase tracking-widest mb-2">Restricted Module</h1>
            <p className="text-neutral-500 text-[10px] tracking-[0.3em]">INPUT CLASSIFIED OVERRIDE CIPHER</p>
          </div>
          <form onSubmit={handleAdminUnlock} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={cipherInput} 
              onChange={(e) => { setCipherInput(e.target.value); setLockError(false); }} 
              className={`bg-transparent border p-4 text-center text-white outline-none tracking-[0.5em] font-black transition-colors ${lockError ? 'border-[#DC143C]' : 'border-neutral-700 focus:border-white'}`} 
              placeholder="••••••••" 
              autoFocus 
            />
            {lockError && <p className="text-[#DC143C] text-[10px] text-center tracking-widest animate-pulse">ACCESS DENIED. INVALID CIPHER.</p>}
            
            <div className="mt-2 flex justify-center">
              <Turnstile 
                siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                options={{ theme: 'dark' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating || !captchaToken} 
              className="bg-[#DC143C] text-black font-black py-4 uppercase tracking-[0.2em] hover:bg-white transition-colors mt-4 disabled:opacity-50"
            >
              {isAuthenticating ? 'VERIFYING...' : 'EXECUTE OVERRIDE'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-8 font-mono relative">
      <div className="max-w-[1400px] mx-auto relative">
        
        {/* ========================================== */}
        {/* ACTION AUTHORIZATION MODAL (THE PIN LOCK)  */}
        {/* ========================================== */}
        <AnimatePresence>
          {pinState.isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-black border-2 border-[#DC143C] w-full max-w-sm p-8 shadow-[0_0_50px_rgba(220,20,60,0.2)]">
                <div className="text-center mb-6">
                  <h2 className="text-[#DC143C] text-xl font-black uppercase tracking-widest animate-pulse">Verification Required</h2>
                  <p className="text-neutral-500 text-[9px] tracking-[0.3em] mt-2">AUTHORIZE DATABASE MODIFICATION</p>
                </div>
                
                <form onSubmit={executePinVerification} className="flex flex-col gap-4">
                  <input 
                    type="password" 
                    maxLength="6"
                    value={pinInputText}
                    onChange={(e) => { setPinInputText(e.target.value.replace(/\D/g, '')); setPinState(prev => ({...prev, error: false})); }}
                    className={`bg-transparent border ${pinState.error ? 'border-[#DC143C]' : 'border-neutral-700'} p-4 text-center text-white outline-none tracking-[1em] font-black transition-colors focus:border-white text-2xl`} 
                    placeholder="••••••" 
                    autoFocus 
                  />
                  {pinState.error && <p className="text-[#DC143C] text-[10px] text-center tracking-widest animate-pulse">INVALID PIN. ACTION BLOCKED.</p>}
                  
                  <div className="flex gap-4 mt-2">
                    <button type="button" onClick={abortAuthorization} className="flex-1 border border-neutral-700 text-neutral-400 font-black py-4 uppercase tracking-[0.2em] hover:text-white transition-colors text-xs">
                      ABORT
                    </button>
                    <button type="submit" disabled={pinInputText.length < 6} className="flex-1 bg-[#DC143C] text-black font-black py-4 uppercase tracking-[0.2em] hover:bg-white transition-colors text-xs disabled:opacity-50">
                      AUTHORIZE
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- VAULT KEYS MODAL --- */}
        <AnimatePresence>
          {vaultModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
              <div className="bg-[#050505] border border-[#DC143C] w-full max-w-4xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(220,20,60,0.15)]">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-[#DC143C] text-xl font-black uppercase">SECURE KEY VAULT // {activeVaultAsset?.name}</h2>
                    <p className="text-neutral-500 text-[10px] tracking-widest mt-1">GENERATED URLs FOR PHYSICAL QR CODE PRINTING</p>
                  </div>
                  <button onClick={() => setVaultModalOpen(false)} className="text-neutral-500 hover:text-white border border-neutral-800 px-4 py-2 text-xs uppercase tracking-widest">Close Vault X</button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  {activeVaultKeys.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {activeVaultKeys.map(key => (
                        <div key={key.key_hash} className="bg-black border border-neutral-800 p-3 flex justify-between items-center text-[10px] uppercase font-mono tracking-widest">
                          <span className="text-[#DC143C] font-bold w-16">SN: {key.serial_number}</span>
                          <span className="text-neutral-400 select-all truncate mx-4 bg-neutral-900 px-2 py-1">localhost:5173/verify/{key.key_hash}</span>
                          <span className={key.claimed_by ? "text-neutral-500" : "text-white"}>{key.claimed_by ? `CLAIMED: ${key.claimed_by}` : "UNCLAIMED"}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-neutral-500 text-center py-10 text-[10px] tracking-widest uppercase">Fetching keys or no keys generated.</p>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- HEADER --- */}
        <div className="mb-12 border-b-2 border-[#DC143C] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div><p className="text-[#DC143C] text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">Classified Access</p><h1 className="text-4xl font-black uppercase tracking-tighter">Admin // Terminal</h1></div>
          <div className="flex bg-black border border-neutral-800 p-1 flex-wrap gap-1">
            <button onClick={() => setActiveModule('inventory')} className={`px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-colors ${activeModule === 'inventory' ? 'bg-[#DC143C] text-black' : 'text-neutral-500 hover:text-white'}`}>ASSET LEDGER</button>
            <button onClick={() => setActiveModule('artists')} className={`px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-colors ${activeModule === 'artists' ? 'bg-[#DC143C] text-black' : 'text-neutral-500 hover:text-white'}`}>PERSONNEL ROSTER</button>
            <button onClick={handleAdminLogout} className="px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-colors text-neutral-500 hover:text-[#DC143C] hover:bg-neutral-900">LOGOUT TERMINAL</button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ========================================== */}
          {/* MODULE: INVENTORY                          */}
          {/* ========================================== */}
          {activeModule === 'inventory' && (
            <motion.div key="inv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col xl:flex-row gap-8">
              
              <div className="w-full xl:w-1/2 bg-black border border-neutral-800 p-6 h-fit">
                <h2 className="text-lg font-black uppercase mb-6 border-b border-neutral-800 pb-2 text-[#DC143C]">{isInvEditing ? 'Modify Asset Data' : 'Initialize New Asset'}</h2>
                <form onSubmit={handleInvSubmit} className="flex flex-col gap-6 text-xs uppercase tracking-widest">
                  <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-800">
                    <div className="col-span-2 text-[10px] text-neutral-500 mb-2">Core Logistics</div>
                    <div className="flex flex-col gap-2"><label className="text-neutral-500">Class</label><select name="type" value={invForm.type} onChange={(e) => handleInputChange(e, setInvForm)} className="bg-black border border-neutral-700 p-2 text-white outline-none"><option value="local">Local</option><option value="limited">Limited</option></select></div>
                    <div className="flex flex-col gap-2"><label className="text-neutral-500">Category</label><select name="category" value={invForm.category} onChange={(e) => handleInputChange(e, setInvForm)} className="bg-black border border-neutral-700 p-2 text-white outline-none"><option value="Outerwear">Outerwear</option><option value="Tops">Tops</option><option value="Bottoms">Bottoms</option><option value="Accessories">Accessories</option></select></div>
                    <div className="flex flex-col gap-2 col-span-2"><label className="text-neutral-500">Full Designation</label><input required type="text" name="name" value={invForm.name} onChange={(e) => handleInputChange(e, setInvForm)} className="bg-transparent border border-neutral-700 p-2 text-white outline-none focus:border-[#DC143C]" placeholder="e.g. Genesis Tech Hoodie" /></div>
                    <div className="flex flex-col gap-2"><label className="text-neutral-500">Price</label><input required type="text" name="price" value={invForm.price} onChange={(e) => handleInputChange(e, setInvForm)} className="bg-transparent border border-neutral-700 p-2 text-white outline-none focus:border-[#DC143C]" placeholder="$245" /></div>
                    {invForm.type === 'limited' && (<div className="flex flex-col gap-2"><label className="text-[#DC143C]">Cap (Qty)</label><input required type="number" name="productNumber" value={invForm.productNumber} onChange={(e) => handleInputChange(e, setInvForm)} className="bg-transparent border border-[#DC143C] p-2 text-white outline-none" placeholder="500" disabled={isInvEditing} /></div>)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-800">
                    <div className="col-span-2 text-[10px] text-neutral-500 mb-2">Blueprint Specifications</div>
                    <div className="flex flex-col gap-2"><label className="text-neutral-500">Creator Name</label><input required type="text" name="creator" value={invForm.creator} onChange={(e) => handleInputChange(e, setInvForm)} className="bg-transparent border border-neutral-700 p-2 text-white outline-none focus:border-[#DC143C]" /></div>
                    <div className="flex flex-col gap-2"><label className="text-neutral-500">Material Spec</label><input required type="text" name="material" value={invForm.material} onChange={(e) => handleInputChange(e, setInvForm)} className="bg-transparent border border-neutral-700 p-2 text-white outline-none focus:border-[#DC143C]" /></div>
                    <div className="flex flex-col gap-2 col-span-2"><label className="text-neutral-500">Manifesto Description</label><textarea required name="description" value={invForm.description} onChange={(e) => handleInputChange(e, setInvForm)} className="bg-transparent border border-neutral-700 p-2 text-white outline-none focus:border-[#DC143C] h-20 resize-none" /></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-neutral-800 bg-[#0a0a0a]">
                    <div className="col-span-1 md:col-span-2 text-[10px] text-[#DC143C] font-bold mb-2 tracking-[0.2em] border-b border-neutral-800 pb-2">VISUAL ASSET MATRIX (JPG/PNG)</div>
                    
                    <div className="flex flex-col gap-2 border border-neutral-800 p-3 bg-black">
                      <label className="text-[9px] text-neutral-400 font-bold tracking-widest flex justify-between">
                        <span>MAIN ASSET</span> <span className="text-[#DC143C]">3:4 RATIO</span>
                      </label>
                      {invForm.img && !invFile && (
                        <div className="flex items-center gap-2 mb-2"><img src={invForm.img} alt="Main" className="w-8 h-8 object-cover border border-neutral-700" /><span className="text-green-500 text-[8px]">LOADED</span></div>
                      )}
                      <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setInvFile(e.target.files[0])} required={!isInvEditing && !invForm.img}
                        className="text-[9px] text-neutral-400 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[9px] file:font-black file:bg-[#DC143C] file:text-black cursor-pointer w-full" />
                    </div>

                    <div className="flex flex-col gap-2 border border-neutral-800 p-3 bg-black">
                      <label className="text-[9px] text-neutral-400 font-bold tracking-widest flex justify-between">
                        <span>MACRO SHOT 01</span> <span>1:1 RATIO</span>
                      </label>
                      {invForm.macro1 && !macro1File && (
                        <div className="flex items-center gap-2 mb-2"><img src={invForm.macro1} alt="Macro 1" className="w-8 h-8 object-cover border border-neutral-700" /><span className="text-green-500 text-[8px]">LOADED</span></div>
                      )}
                      <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setMacro1File(e.target.files[0])} required={!isInvEditing && !invForm.macro1}
                        className="text-[9px] text-neutral-400 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[9px] file:font-black file:bg-neutral-800 file:text-white cursor-pointer w-full" />
                    </div>

                    <div className="flex flex-col gap-2 border border-neutral-800 p-3 bg-black">
                      <label className="text-[9px] text-neutral-400 font-bold tracking-widest flex justify-between">
                        <span>MACRO SHOT 02</span> <span>1:1 RATIO</span>
                      </label>
                      {invForm.macro2 && !macro2File && (
                        <div className="flex items-center gap-2 mb-2"><img src={invForm.macro2} alt="Macro 2" className="w-8 h-8 object-cover border border-neutral-700" /><span className="text-green-500 text-[8px]">LOADED</span></div>
                      )}
                      <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setMacro2File(e.target.files[0])} required={!isInvEditing && !invForm.macro2}
                        className="text-[9px] text-neutral-400 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[9px] file:font-black file:bg-neutral-800 file:text-white cursor-pointer w-full" />
                    </div>

                    <div className="flex flex-col gap-2 border border-neutral-800 p-3 bg-black">
                      <label className="text-[9px] text-neutral-400 font-bold tracking-widest flex justify-between">
                        <span>MACRO SHOT 03</span> <span>1:1 RATIO</span>
                      </label>
                      {invForm.macro3 && !macro3File && (
                        <div className="flex items-center gap-2 mb-2"><img src={invForm.macro3} alt="Macro 3" className="w-8 h-8 object-cover border border-neutral-700" /><span className="text-green-500 text-[8px]">LOADED</span></div>
                      )}
                      <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setMacro3File(e.target.files[0])} required={!isInvEditing && !invForm.macro3}
                        className="text-[9px] text-neutral-400 file:mr-2 file:py-1 file:px-2 file:border-0 file:text-[9px] file:font-black file:bg-neutral-800 file:text-white cursor-pointer w-full" />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button type="submit" disabled={isProcessing} className="flex-1 bg-[#DC143C] text-black font-black py-4 hover:bg-white transition-colors disabled:opacity-50 tracking-[0.2em]">{isProcessing ? 'UPLOADING...' : (isInvEditing ? 'COMMIT OVERRIDE' : 'EXECUTE ADDITION')}</button>
                    {isInvEditing && <button type="button" onClick={cancelInvEdit} disabled={isProcessing} className="px-8 border border-neutral-700 text-neutral-400 hover:text-white transition-colors">ABORT</button>}
                  </div>
                </form>
              </div>

              <div className="w-full xl:w-1/2 border border-neutral-800 bg-black flex flex-col h-fit">
                <div className="bg-neutral-900 border-b border-neutral-800 p-4 text-[10px] tracking-widest text-neutral-500 flex justify-between"><span>ASSET LEDGER</span><span>ENTRIES: {(inventory || []).length}</span></div>
                <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
                  <table className="w-full text-left text-[10px] uppercase tracking-widest whitespace-nowrap">
                    <thead className="text-neutral-600 border-b border-neutral-800 sticky top-0 bg-black">
                      <tr><th className="p-4">ID</th><th className="p-4">Designation</th><th className="p-4 text-center">Class</th><th className="p-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                      {(inventory || []).map((asset) => (
                        <tr key={asset.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50 transition-colors">
                          <td className="p-4 text-[#DC143C]">SGN-{asset.id}</td>
                          <td className="p-4 font-bold text-white flex items-center gap-3">
                            <img src={asset.img} className="w-6 h-6 object-cover grayscale opacity-50" alt="" />
                            {asset.name}
                          </td>
                          <td className="p-4 text-center">
                            {asset.type === 'limited' ? (
                              <button onClick={() => viewVaultKeys(asset)} className="bg-white text-black px-2 py-1 hover:bg-[#DC143C] hover:text-white transition-colors">VIEW KEYS</button>
                            ) : <span className="text-neutral-500">LOCAL</span>}
                          </td>
                          <td className="p-4 text-right space-x-4">
                            <button 
                              onClick={() => { setIsInvEditing(true); setInvForm(asset); setInvFile(null); setMacro1File(null); setMacro2File(null); setMacro3File(null); }} 
                              className="text-neutral-400 hover:text-white transition-colors"
                            >EDIT</button>
                            {/* [NEW] The Delete button now triggers the PIN modal, rather than the browser window.confirm */}
                            <button onClick={() => handleInvDelete(asset.id)} className="text-[#DC143C] hover:text-white transition-colors">DEL</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* MODULE: ARTISTS                            */}
          {/* ========================================== */}
          {activeModule === 'artists' && (
            <motion.div key="art" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col xl:flex-row gap-8">
              
              <div className="w-full xl:w-1/2 bg-black border border-neutral-800 p-6 h-fit">
                <h2 className="text-lg font-black uppercase mb-6 border-b border-neutral-800 pb-2 text-[#DC143C]">{isArtistEditing ? 'Modify Personnel Record' : 'Initialize New Creator'}</h2>
                <form onSubmit={handleArtistSubmit} className="flex flex-col gap-6 text-xs uppercase tracking-widest">
                  <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-800">
                    <div className="col-span-2 text-[10px] text-neutral-500 mb-2">Creator Identity</div>
                    
                    <div className="flex flex-col gap-2 col-span-2">
                      <label className="text-neutral-500">Full Name (Sourced from Ledger)</label>
                      {availableCreators.length > 0 ? (
                        <select required name="name" value={artistForm.name} onChange={(e) => handleInputChange(e, setArtistForm)} className="bg-black border border-neutral-700 p-3 text-white outline-none focus:border-[#DC143C] uppercase">
                          <option value="" disabled>-- SELECT FROM ACTIVE LEDGER --</option>
                          {availableCreators.map(creator => (<option key={creator} value={creator}>{creator}</option>))}
                        </select>
                      ) : <div className="bg-neutral-900 border border-neutral-800 p-3 text-neutral-600 text-center font-mono tracking-widest text-[10px]">ERROR: NO CREATORS FOUND.</div>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-neutral-500">Tier / Classification</label>
                      <select name="tier" value={artistForm.tier} onChange={(e) => handleInputChange(e, setArtistForm)} className="bg-black border border-neutral-700 p-2 text-white outline-none">
                        <option value="TIER-S CREATOR">Tier-S Creator</option>
                        <option value="TIER-A DESIGNER">Tier-A Designer</option>
                        <option value="COLLECTIVE STUDIO">Collective Studio</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-neutral-500">Signature Style</label>
                      <input required type="text" name="signature" value={artistForm.signature} onChange={(e) => handleInputChange(e, setArtistForm)} className="bg-transparent border border-neutral-700 p-2 text-white outline-none focus:border-[#DC143C] font-serif italic" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 border border-neutral-800">
                    <div className="col-span-2 text-[10px] text-neutral-500 mb-2">Creator Preferences</div>
                    
                    <div className="flex flex-col gap-2 col-span-2">
                      <label className="text-neutral-500">Fav. Clothing (Sourced from Ledger)</label>
                      {availableClothing.length > 0 ? (
                        <select required name="favoriteClothing" value={artistForm.favoriteClothing} onChange={(e) => handleInputChange(e, setArtistForm)} className="bg-black border border-neutral-700 p-3 text-white outline-none focus:border-[#DC143C] uppercase">
                          <option value="" disabled>-- SELECT FROM ACTIVE LEDGER --</option>
                          {availableClothing.map(clothing => (<option key={clothing} value={clothing}>{clothing}</option>))}
                        </select>
                      ) : <div className="bg-neutral-900 border border-neutral-800 p-3 text-neutral-600 text-center font-mono tracking-widest text-[10px]">ERROR: NO ASSETS FOUND.</div>}
                    </div>

                    <div className="flex flex-col gap-2 col-span-2">
                      <label className="text-neutral-500">Fav. Color (Hex)</label>
                      <div className="flex gap-2">
                        <input type="color" name="favoriteColorHex" value={artistForm.favoriteColorHex} onChange={(e) => handleInputChange(e, setArtistForm)} className="w-10 h-10 bg-black border border-neutral-700 cursor-pointer" />
                        <input required type="text" name="favoriteColorHex" value={artistForm.favoriteColorHex} onChange={(e) => handleInputChange(e, setArtistForm)} className="bg-transparent border border-neutral-700 p-2 text-white outline-none flex-1 focus:border-[#DC143C]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-4 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 mb-2">Creator Portrait (Upload JPG/PNG)</div>
                    <div className="flex flex-col gap-3">
                      {artistForm.photo && !artistFile && (
                        <div className="flex gap-4 items-center">
                          <img src={artistForm.photo} alt="Current" className="w-16 h-16 object-cover border border-neutral-700" />
                          <span className="text-neutral-500 text-[9px]">ACTIVE IMAGE LOADED</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={(e) => setArtistFile(e.target.files[0])} 
                        className="bg-transparent border border-neutral-700 p-2 text-white outline-none focus:border-[#DC143C] 
                                   file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-black file:bg-[#DC143C] file:text-black hover:file:bg-white transition-colors cursor-pointer" 
                        required={!isArtistEditing} 
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button type="submit" disabled={isProcessing || availableCreators.length === 0 || availableClothing.length === 0} className="flex-1 bg-[#DC143C] text-black font-black py-4 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-[0.2em]">{isProcessing ? 'UPLOADING...' : (isArtistEditing ? 'COMMIT OVERRIDE' : 'EXECUTE ADDITION')}</button>
                    {isArtistEditing && <button type="button" onClick={cancelArtistEdit} disabled={isProcessing} className="px-8 border border-neutral-700 text-neutral-400 hover:text-white transition-colors">ABORT</button>}
                  </div>
                </form>
              </div>

              <div className="w-full xl:w-1/2 border border-neutral-800 bg-black flex flex-col h-fit">
                <div className="bg-neutral-900 border-b border-neutral-800 p-4 text-[10px] tracking-widest text-neutral-500 flex justify-between"><span>PERSONNEL ROSTER</span><span>ENTRIES: {(artists || []).length}</span></div>
                <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
                  <table className="w-full text-left text-[10px] uppercase tracking-widest whitespace-nowrap">
                    <thead className="text-neutral-600 border-b border-neutral-800 sticky top-0 bg-black">
                      <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Tier</th><th className="p-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                      {(artists || []).map((artist) => (
                        <tr key={artist.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50 transition-colors">
                          <td className="p-4 text-[#DC143C]">ID-{artist.id}</td>
                          <td className="p-4 font-bold text-white flex items-center gap-3">
                            <img src={artist.photo} className="w-6 h-6 object-cover grayscale opacity-50 rounded-full" alt="" />
                            {artist.name}
                          </td>
                          <td className="p-4 text-neutral-500">{artist.tier}</td>
                          <td className="p-4 text-right space-x-4">
                            <button onClick={() => { setIsArtistEditing(true); setArtistForm(artist); setArtistFile(null); }} className="text-neutral-400 hover:text-white transition-colors">EDIT</button>
                            <button onClick={() => handleArtistDelete(artist.id)} className="text-[#DC143C] hover:text-white transition-colors">DEL</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AdminDashboard;