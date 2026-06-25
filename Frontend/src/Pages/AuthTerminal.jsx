import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';

const AuthTerminal = ({ inventory, setCurrentOperative }) => {
  const [authMode, setAuthMode] = useState('login'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '', nickname: '', password: '', favoriteClothing: '', favoriteColorHex: '#DC143C', signature: ''
  });
  
  const [resendTimer, setResendTimer] = useState(0);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Safely fallback if inventory is undefined
  const availableClothing = [...new Set((inventory || []).map(item => item.name).filter(name => name && name.trim() !== ''))];

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleResendLink = async () => {
    if (resendTimer > 0) return;
    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: form.email,
    });

    if (error) {
      setErrorMsg(`TRANSMISSION FAILED: ${error.message.toUpperCase()}`);
    } else {
      setSuccessMsg("NEW LINK DISPATCHED. CHECK SPAM/JUNK FOLDER.");
      setResendTimer(60); 
    }
    setIsProcessing(false);
  };

  const executeAuth = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Hard Stop if bot detected or captcha failed (applies to both Login & Signup)
    if (!captchaToken) {
        setErrorMsg("SECURITY PROTOCOL FAILED. PLEASE VERIFY HUMANITY.");
        setIsProcessing(false);
        return;
    }

    try {
      if (authMode === 'login') {
        // ==========================================
        // LOGIN PROTOCOL (Now heavily secured)
        // ==========================================
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
          options: {
            captchaToken: captchaToken // [NEW] Pass the token during login
          }
        });

        if (authError || !authData.user) {
          setErrorMsg("ACCESS DENIED. CREDENTIALS UNRECOGNIZED OR UNVERIFIED.");
          setCaptchaToken(null); // Reset token so they verify again
        } else {
          const { data: dossier } = await supabase.from('operatives').select('*').eq('auth_id', authData.user.id).single(); 
          if (dossier) {
            setCurrentOperative(dossier);
            navigate('/'); 
          } else {
            setErrorMsg("DOSSIER CORRUPTED.");
          }
        }
      } 
      
      else if (authMode === 'signup') {
        // ==========================================
        // DOSSIER SUBMISSION PROTOCOL
        // ==========================================
        const { data: existingUser } = await supabase.from('operatives').select('nickname').ilike('nickname', form.nickname);
        if (existingUser && existingUser.length > 0) {
          setErrorMsg("ALIAS ALREADY BOUND TO ANOTHER OPERATIVE.");
          setIsProcessing(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            captchaToken: captchaToken
          }
        });

        if (authError) {
          const message = authError.message ? authError.message.toUpperCase() : "EMAIL ALREADY EXISTS OR CIPHER TOO WEAK";
          setErrorMsg(`REGISTRATION ERROR: ${message}`);
          setCaptchaToken(null); // Reset token on failure
        } else if (authData.user) {
          
          const { data: ops } = await supabase.from('operatives').select('id');
          const num = ops && ops.length > 0 ? Math.max(...ops.map(o => parseInt(o.id.split('-')[1], 10) || 0)) + 1 : 1;
          const newId = `OP-${String(num).padStart(3, '0')}`;

          const newOperative = { 
            id: newId, 
            auth_id: authData.user.id, 
            nickname: form.nickname, 
            favoriteClothing: form.favoriteClothing,
            favoriteColorHex: form.favoriteColorHex,
            signature: form.signature,
            last_updated: null 
          };
          
          const { error: insertError } = await supabase.from('operatives').insert([newOperative]);

          if (insertError) {
            setErrorMsg("DATABASE ERROR. DOSSIER CREATION FAILED.");
          } else {
            setAuthMode('awaiting');
            setResendTimer(60);
          }
        }
      }
    } catch (err) {
      setErrorMsg("SYSTEM MALFUNCTION.");
      setCaptchaToken(null);
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center pt-20 px-4 font-mono">
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0" style={{ backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-black border border-neutral-800 p-8 relative z-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#DC143C]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#DC143C]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#DC143C]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#DC143C]" />

        <div className="text-center mb-8 border-b border-neutral-800 pb-6">
          <p className="text-[#DC143C] text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">Signatura Network</p>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            {authMode === 'login' && 'Operative Login'}
            {authMode === 'signup' && 'Initialize Dossier'}
            {authMode === 'awaiting' && 'Awaiting Verification'}
          </h1>
        </div>

        {errorMsg && <div className="mb-6 p-3 bg-red-900/20 border border-[#DC143C] text-[#DC143C] text-[10px] text-center tracking-widest uppercase animate-pulse">{errorMsg}</div>}
        {successMsg && <div className="mb-6 p-3 bg-green-900/20 border border-green-500 text-green-500 text-[10px] text-center tracking-widest uppercase">{successMsg}</div>}

        {authMode === 'awaiting' ? (
          <motion.div key="awaiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 text-center">
            <div className="border border-neutral-800 bg-neutral-900/50 p-6">
              <p className="text-white text-xs leading-relaxed uppercase tracking-widest mb-4">
                A verification link has been dispatched to:<br/>
                <span className="text-[#DC143C] font-bold block mt-2">{form.email}</span>
              </p>
              <p className="text-neutral-500 text-[10px] uppercase tracking-widest">
                Check your inbox (and spam folder). Click the link to securely activate your identity.
              </p>
            </div>

            <button 
              type="button" 
              onClick={handleResendLink} 
              disabled={resendTimer > 0 || isProcessing}
              className="text-[10px] text-neutral-500 hover:text-white transition-colors underline disabled:opacity-50 disabled:no-underline disabled:hover:text-neutral-500"
            >
              {resendTimer > 0 ? `AWAITING TRANSMISSION REFRESH (${resendTimer}S)` : 'DID NOT RECEIVE? RESEND LINK'}
            </button>

            <button onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="w-full mt-4 bg-transparent border border-neutral-700 text-white font-black py-4 hover:border-white transition-colors tracking-[0.2em] uppercase text-xs">
              RETURN TO LOGIN
            </button>
          </motion.div>
        ) : (
          <form onSubmit={executeAuth} className="flex flex-col gap-5 text-xs uppercase tracking-widest">
            <motion.div key="inputs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-neutral-500">Registered Gmail</label>
                <input required type="email" name="email" value={form.email} onChange={handleInputChange} className="bg-transparent border border-neutral-700 p-3 text-white outline-none focus:border-[#DC143C]" placeholder="operative@gmail.com" />
              </div>

              {authMode === 'signup' && (
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-500">Operative Nickname</label>
                  <input required type="text" name="nickname" value={form.nickname} onChange={handleInputChange} className="bg-transparent border border-neutral-700 p-3 text-white outline-none focus:border-[#DC143C]" placeholder="e.g. Ghost_Protocol" />
                </div>
              )}

              <div className="flex flex-col gap-2 relative">
                <label className="text-neutral-500">Access Cipher (Password)</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleInputChange} className="w-full bg-transparent border border-neutral-700 p-3 pr-16 text-white outline-none focus:border-[#DC143C]" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-500 hover:text-white transition-colors">{showPassword ? 'HIDE' : 'SHOW'}</button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="flex flex-col gap-5 overflow-hidden border-t border-neutral-800 pt-5 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-neutral-500">Favorite Asset (From Ledger)</label>
                    <select required name="favoriteClothing" value={form.favoriteClothing} onChange={handleInputChange} className="bg-black border border-neutral-700 p-3 text-white outline-none focus:border-[#DC143C] uppercase">
                      <option value="" disabled>-- SELECT ASSET --</option>
                      {availableClothing.map(clothing => (<option key={clothing} value={clothing}>{clothing}</option>))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-neutral-500">Aesthetic Marker (Hex Color)</label>
                    <div className="flex gap-2">
                      <input type="color" name="favoriteColorHex" value={form.favoriteColorHex} onChange={handleInputChange} className="w-12 h-12 bg-black border border-neutral-700 cursor-pointer" />
                      <input required type="text" name="favoriteColorHex" value={form.favoriteColorHex} onChange={handleInputChange} className="bg-transparent border border-neutral-700 p-3 text-white outline-none flex-1 focus:border-[#DC143C]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-neutral-500">Digital Signature</label>
                    <input required type="text" name="signature" value={form.signature} onChange={handleInputChange} className="bg-transparent border border-neutral-700 p-3 text-white outline-none focus:border-[#DC143C] font-serif italic capitalize" placeholder="Your styled alias" />
                  </div>
                </div>
              )}

              {/* [NEW] Placed outside so it renders for BOTH Login and Signup */}
              <div className="mt-2 flex justify-center">
                <Turnstile 
                  siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  options={{ theme: 'dark' }}
                />
              </div>

            </motion.div>

            {/* [NEW] The button is locked during login as well if CAPTCHA isn't ready */}
            <button 
              type="submit" 
              disabled={isProcessing || !captchaToken} 
              className="w-full mt-4 bg-[#DC143C] text-black font-black py-4 hover:bg-white transition-colors disabled:opacity-50 tracking-[0.2em]"
            >
              {isProcessing ? 'PROCESSING...' : (authMode === 'login' ? 'INITIATE HANDSHAKE' : 'SUBMIT DOSSIER')}
            </button>
          </form>
        )}

        {authMode !== 'awaiting' && (
          <div className="mt-6 text-center text-[10px] text-neutral-500 tracking-widest border-t border-neutral-800 pt-4">
            {authMode === 'login' ? "NO DOSSIER FOUND? " : "DOSSIER ALREADY REGISTERED? "}
            <button 
              onClick={() => { 
                setAuthMode(authMode === 'login' ? 'signup' : 'login'); 
                setErrorMsg(''); 
                setSuccessMsg(''); 
                setCaptchaToken(null); // Reset token when flipping modes
              }} 
              className="text-[#DC143C] hover:text-white transition-colors font-bold underline decoration-[#DC143C]"
            >
              {authMode === 'login' ? 'INITIALIZE HERE' : 'LOGIN HERE'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthTerminal;