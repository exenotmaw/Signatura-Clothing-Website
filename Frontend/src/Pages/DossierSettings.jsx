import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';

const DossierSettings = ({ inventory, currentOperative, setCurrentOperative, vaultKeys, setVaultKeys }) => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    nickname: '', newPassword: '', favoriteClothing: '', favoriteColorHex: '', signature: '' 
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [canUpdateRestricted, setCanUpdateRestricted] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  const [captchaToken, setCaptchaToken] = useState(null);

  // ==========================================
  // DESTRUCTIVE ACTION SECURITY MODAL STATES
  // ==========================================
  const [securityModal, setSecurityModal] = useState({ isOpen: false, type: null, data: null });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');

  const availableClothing = [...new Set(inventory.map(item => item.name).filter(name => name && name.trim() !== ''))];
  const myAssets = vaultKeys.filter(k => k.claimed_by === currentOperative?.nickname);

  useEffect(() => {
    if (!currentOperative) {
      navigate('/auth');
      return;
    }

    setForm({
      nickname: currentOperative.nickname,
      newPassword: '', 
      favoriteClothing: currentOperative.favoriteClothing,
      favoriteColorHex: currentOperative.favoriteColorHex || '#DC143C',
      signature: currentOperative.signature
    });

    if (currentOperative.last_updated) {
      const diffDays = Math.floor(Math.abs(new Date() - new Date(currentOperative.last_updated)) / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        setCanUpdateRestricted(false);
        setDaysLeft(90 - diffDays);
      } else {
        setCanUpdateRestricted(true);
      }
    }
  }, [currentOperative, navigate]);

  const handleInputChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg(''); setSuccessMsg('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentOperative(null);
    navigate('/');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const isNicknameChanged = form.nickname.trim() !== currentOperative.nickname;
    const isPasswordChanged = form.newPassword.trim() !== '';

    if ((isNicknameChanged || isPasswordChanged) && !canUpdateRestricted) {
      setErrorMsg("RESTRICTED PROTOCOLS (NICKNAME/PASSWORD) ARE LOCKED.");
      setIsProcessing(false);
      return;
    }

    try {
      if (isPasswordChanged) {
        const { error: authError } = await supabase.auth.updateUser({ password: form.newPassword });
        if (authError) throw new Error("PASSWORD RE-ENCRYPTION FAILED.");
      }

      if (isNicknameChanged) {
        const { data: dupCheck } = await supabase.from('operatives').select('nickname').ilike('nickname', form.nickname);
        if (dupCheck && dupCheck.length > 0) throw new Error("ALIAS ALREADY BOUND TO ANOTHER OPERATIVE.");
      }

      const payload = {
        nickname: form.nickname.trim(), // Ensure clean strings
        favoriteClothing: form.favoriteClothing,
        favoriteColorHex: form.favoriteColorHex,
        signature: form.signature
      };

      if (isNicknameChanged || isPasswordChanged) {
        payload.last_updated = new Date().toISOString();
      }

      // 1. Update the Main Dossier
      const { data, error } = await supabase.from('operatives').update(payload).eq('id', currentOperative.id).select();
      if (error) throw new Error("DATABASE SYNC FAILED.");

      // ==========================================
      // [NEW] 2. VAULT KEY SYNC PROTOCOL
      // ==========================================
      // If the alias changed, hunt down all keys owned by the old alias and update them to the new one.
      if (isNicknameChanged) {
        const { error: vaultError } = await supabase.from('vault_keys')
          .update({ claimed_by: form.nickname.trim() })
          .eq('claimed_by', currentOperative.nickname);
          
        if (vaultError) throw new Error("FAILED TO SYNC VAULT KEYS WITH NEW ALIAS.");
        
        // If you are using React Query or local state to store vaultKeys, update the UI instantly
        if (setVaultKeys) {
            setVaultKeys(prev => prev.map(k => k.claimed_by === currentOperative.nickname ? { ...k, claimed_by: form.nickname.trim() } : k));
        }
      }

      setCurrentOperative(data[0]);
      setForm(prev => ({ ...prev, newPassword: '' })); 
      setSuccessMsg("DOSSIER UPDATED SECURELY.");
      
      if (isNicknameChanged || isPasswordChanged) {
        setCanUpdateRestricted(false);
        setDaysLeft(90);
      }

    } catch (err) {
      setErrorMsg(err.message);
    }
    setIsProcessing(false);
  };

  // ==========================================
  // DESTRUCTIVE ACTION HANDLERS
  // ==========================================
  
  // 1. Trigger the Modal instead of window.confirm
  const initiateUnbind = (keyHash, serialNum, assetName) => {
    setSecurityModal({ isOpen: true, type: 'unbind', data: { keyHash, serialNum, assetName } });
    setConfirmPassword('');
    setModalError('');
  };

  const initiateDelete = () => {
    setSecurityModal({ isOpen: true, type: 'delete', data: null });
    setConfirmPassword('');
    setModalError('');
  };

  // 2. Process the Password Verification
  const executeDestructiveAction = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setModalError('');

    try {
      // First: Verify their password against Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: confirmPassword,
        options: {
          captchaToken: captchaToken,
        }
      });

      if (authError) {
        console.error("SUPABASE REJECTION DATA:", authError);
        throw new Error(`SYSTEM HALT: ${authError.message}`);
      }

      // Second: If Cipher is correct, execute the requested action
      if (securityModal.type === 'unbind') {
        const { keyHash, assetName } = securityModal.data;
        const { error } = await supabase.from('vault_keys').update({ claimed_by: null }).eq('key_hash', keyHash);
        if (error) throw new Error("DATABASE FAILED TO SEVER BINDING.");
        
        if (typeof setVaultKeys === 'function') {
          setVaultKeys(prev => prev.map(k => k.key_hash === keyHash ? { ...k, claimed_by: null } : k));
        } else {
          window.location.reload();
        }
        setSuccessMsg(`SUCCESS: ${assetName} RELEASED TO GLOBAL POOL.`);
      } 
      
      else if (securityModal.type === 'delete') {
        // Release all bound assets first
        await supabase.from('vault_keys').update({ claimed_by: null }).eq('claimed_by', currentOperative.nickname);
        // Delete dossier profile
        await supabase.from('operatives').delete().eq('id', currentOperative.id);
        // Purge session
        await supabase.auth.signOut(); 
        setCurrentOperative(null);
        alert("DOSSIER TERMINATED.");
        navigate('/');
        return; // Exit completely
      }

      // Close modal on success
      setSecurityModal({ isOpen: false, type: null, data: null });

    } catch (err) {
      setModalError(err.message);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-4 font-mono relative">
      <div className="max-w-[800px] mx-auto">
        
        <div className="mb-12 border-b-2 border-[#DC143C] pb-6 flex justify-between items-end">
          <div><p className="text-[#DC143C] text-[10px] tracking-[0.3em] font-bold">Protocol Active</p><h1 className="text-4xl font-black uppercase">Account Settings</h1></div>
          <button onClick={handleLogout} className="border border-neutral-700 text-neutral-400 px-4 py-2 text-[10px] uppercase hover:text-white hover:border-white transition-colors">LOGOUT SESSION</button>
        </div>

        {/* VAULT ASSET MANAGEMENT */}
        <div className="mb-12">
          <h3 className="text-white font-black tracking-widest uppercase mb-4 border-l-4 border-white pl-4">Vault Asset Management</h3>
          <div className="flex flex-col gap-2">
            {myAssets.length > 0 ? myAssets.map(keyData => {
              const asset = inventory.find(i => i.id === keyData.asset_id);
              return (
                <div key={keyData.key_hash} className="bg-black border border-neutral-800 p-4 flex justify-between items-center">
                  <div><p className="text-white font-bold uppercase">{asset ? asset.name : 'CLASSIFIED'}</p><p className="text-[#DC143C] text-[10px] tracking-widest font-bold">SN: {keyData.serial_number}</p></div>
                  <button onClick={() => initiateUnbind(keyData.key_hash, keyData.serial_number, asset?.name)} className="border border-neutral-600 text-neutral-400 px-4 py-2 text-[9px] uppercase hover:border-[#DC143C] hover:text-[#DC143C] transition-all">UNBIND ASSET</button>
                </div>
              );
            }) : <div className="bg-black border border-dashed border-neutral-800 p-8 text-center text-neutral-600 text-[10px]">NO ASSETS BOUND.</div>}
          </div>
        </div>

        {/* DOSSIER SETTINGS FORM */}
        <div className="bg-black border border-neutral-800 p-8 mb-12">
          <h3 className="text-white font-black tracking-widest uppercase mb-6 border-l-4 border-white pl-4">Identity & Aesthetics</h3>
          {errorMsg && <div className="mb-6 p-3 bg-red-900/20 text-[#DC143C] text-[10px] text-center">{errorMsg}</div>}
          {successMsg && <div className="mb-6 p-3 bg-green-900/20 text-green-500 text-[10px] text-center">{successMsg}</div>}

          <form onSubmit={handleUpdate} className="flex flex-col gap-6 text-xs uppercase tracking-widest">
            
            <div className={`border border-neutral-800 p-6 ${!canUpdateRestricted ? 'bg-neutral-900/50' : ''}`}>
              <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                <span className="text-[10px] text-[#DC143C] font-bold">RESTRICTED PROTOCOLS</span>
                {!canUpdateRestricted && <span className="text-[9px] text-neutral-500 bg-black px-2 py-1 border border-neutral-800">LOCKED: {daysLeft} DAYS LEFT</span>}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-500">Alias (Nickname)</label>
                  <input required type="text" name="nickname" value={form.nickname} onChange={handleInputChange} disabled={!canUpdateRestricted} className="bg-transparent border border-neutral-700 p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-[#DC143C]" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-500">Update Cipher (Leave blank to keep current password)</label>
                  <input type="password" name="newPassword" value={form.newPassword} onChange={handleInputChange} disabled={!canUpdateRestricted} className="bg-transparent border border-neutral-700 p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-[#DC143C]" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="border border-neutral-800 p-6">
              <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                <span className="text-[10px] text-white font-bold">AESTHETIC PROTOCOLS (NO COOLDOWN)</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-500">Asset</label>
                  <select required name="favoriteClothing" value={form.favoriteClothing} onChange={handleInputChange} className="bg-black border border-neutral-700 p-3 text-white uppercase focus:border-[#DC143C]">
                    {availableClothing.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-500">Hex Code</label>
                  <div className="flex gap-2">
                    <input type="color" name="favoriteColorHex" value={form.favoriteColorHex} onChange={handleInputChange} className="w-12 h-12 bg-black border border-neutral-700 cursor-pointer" />
                    <input required type="text" name="favoriteColorHex" value={form.favoriteColorHex} onChange={handleInputChange} className="bg-transparent border border-neutral-700 p-3 flex-1 text-white focus:border-[#DC143C]" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-neutral-500">Signature</label>
                <input required type="text" name="signature" value={form.signature} onChange={handleInputChange} className="bg-transparent border border-neutral-700 p-3 font-serif italic focus:border-[#DC143C]" />
              </div>
            </div>

            <button type="submit" disabled={isProcessing} className="bg-[#DC143C] text-black font-black py-4 uppercase tracking-[0.2em] hover:bg-white transition-colors disabled:opacity-50">
              {isProcessing ? 'UPDATING...' : 'UPDATE CHANGES'}
            </button>
          </form>
        </div>

        <div className="border border-neutral-800 p-8 flex justify-between items-center bg-black">
           <div><h3 className="text-[#DC143C] font-black uppercase">ACCOUNT TERMINATION</h3></div>
           <button onClick={initiateDelete} className="border border-[#DC143C] text-[#DC143C] px-8 py-4 font-black uppercase text-[10px] hover:bg-[#DC143C] hover:text-black transition-colors">DELETE ACCOUNT</button>
        </div>
      </div>

      {/* ========================================== */}
      {/* SECURITY OVERRIDE MODAL */}
      {/* ========================================== */}
      <AnimatePresence>
        {securityModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#050505] border border-[#DC143C] p-8 shadow-2xl relative"
            >
              <div className="text-center mb-6 border-b border-neutral-800 pb-4">
                <p className="text-[#DC143C] font-black tracking-[0.3em] uppercase text-xl animate-pulse">Warning</p>
                <p className="text-neutral-400 text-[10px] uppercase tracking-widest mt-2">Destructive Action Requested</p>
              </div>

              <div className="mb-6 text-center text-xs text-white uppercase tracking-widest leading-loose">
                {securityModal.type === 'unbind' ? (
                  <>You are about to sever ownership of <br/><span className="font-black text-[#DC143C]">{securityModal.data.assetName} [SN: {securityModal.data.serialNum}]</span>.</>
                ) : (
                  <>You are about to permanently purge your Asset. All asset bindings will be severed. This cannot be undone.</>
                )}
              </div>

              {modalError && <div className="mb-4 p-2 bg-red-900/20 text-[#DC143C] text-[10px] text-center">{modalError}</div>}

              <form onSubmit={executeDestructiveAction} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-500 text-[10px] uppercase">Re-Enter Cipher to Confirm</label>
                  <input 
                    required type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setModalError(''); }}
                    className="bg-transparent border border-neutral-700 p-3 text-white outline-none focus:border-[#DC143C]" placeholder="••••••••" 
                  />
                </div>

                {/* INJECTED TURNSTILE WIDGET */}
                <div className="flex justify-center my-2">
                  <Turnstile 
                    siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY} 
                    onSuccess={(token) => setCaptchaToken(token)}
                    options={{ theme: 'dark' }}
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={() => { setSecurityModal({ isOpen: false, type: null, data: null }); setCaptchaToken(null); }} className="flex-1 border border-neutral-700 text-neutral-400 text-xs py-3 uppercase hover:text-white transition-colors">
                    Abort
                  </button>
                  <button type="submit" disabled={isProcessing || !captchaToken} className="flex-1 bg-[#DC143C] text-black font-black text-xs py-3 uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isProcessing ? 'Verifying...' : 'Execute'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DossierSettings;