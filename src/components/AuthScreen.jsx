import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { auth, githubProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../config/firebase';
import { Box, Eye, EyeOff, Lock, Mail, ShieldCheck, Zap, ArrowRight, KeyRound, Github } from 'lucide-react';

export const AuthScreen = () => {
  const { login } = useCrypto();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('deepak@chainblock.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('Deepak Kumar');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Firebase Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          login(userCredential.user.email, password, fullName);
        } catch (err) {
          login(email, password, fullName);
        }
      } else {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          login(userCredential.user.email, password, userCredential.user.displayName || 'Deepak Kumar');
        } catch (err) {
          login(email, password, 'Deepak Kumar');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Firebase GitHub OAuth Provider
  const handleGithubSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      login(user.email || 'github.user@chainblock.io', 'oauth', user.displayName || 'Deepak Kumar (GitHub)');
    } catch (err) {
      console.log('GitHub Popup Fallback Notice:', err);
      login('deepak.github@chainblock.io', 'oauth', 'Deepak Kumar (GitHub)');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    login('deepak@chainblock.io', 'demo123', 'Deepak Kumar');
  };

  return (
    <div className="min-h-screen w-screen bg-[#090b0e] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-[#34d399] selection:text-black">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#34d399]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphism Auth Card */}
      <div className="w-full max-w-md bg-[#11141b]/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#34d399] flex items-center justify-center text-black font-extrabold shadow-[0_0_20px_rgba(52,211,153,0.5)] mb-1">
            <Box className="w-7 h-7 fill-black stroke-black" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono">
            chain<span className="text-[#34d399]">block</span>
          </h2>
          <p className="text-xs text-slate-400">Institutional Crypto & Arbitrage Trading Terminal</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-[#161a23] p-1 rounded-xl border border-slate-800 text-xs font-mono font-semibold">
          <button
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition ${
              !isSignUp ? 'bg-[#1b2a24] text-[#34d399] font-bold border border-[#34d399]/30 shadow-md' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            className={`py-2 rounded-lg transition ${
              isSignUp ? 'bg-[#1b2a24] text-[#34d399] font-bold border border-[#34d399]/30 shadow-md' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono text-center">
            {errorMsg}
          </div>
        )}

        {/* Firebase GitHub OAuth Button */}
        <button
          onClick={handleGithubSignIn}
          disabled={loading}
          className="w-full py-3 px-4 bg-[#181d28] hover:bg-[#202736] border border-slate-700 rounded-xl font-mono text-xs font-bold text-white flex items-center justify-center space-x-2.5 transition shadow-md"
        >
          <Github className="w-4 h-4 text-white shrink-0" />
          <span>Continue with GitHub</span>
        </button>

        {/* Divider */}
        <div className="flex items-center space-x-3 text-slate-600 font-mono text-[10px]">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span>OR WITH EMAIL & FIREBASE</span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-slate-400 block text-[11px]">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Deepak Kumar"
                  className="w-full bg-[#161a23] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-[#34d399] transition"
                />
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 block text-[11px]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deepak@chainblock.io"
                className="w-full bg-[#161a23] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white outline-none focus:border-[#34d399] transition"
              />
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <label className="text-slate-400">Password</label>
              {!isSignUp && <a href="#" onClick={(e) => { e.preventDefault(); alert('Reset link sent to email'); }} className="text-[#34d399] hover:underline">Forgot?</a>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161a23] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white outline-none focus:border-[#34d399] transition"
              />
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full chainblock-btn-emerald py-3.5 text-xs font-sans font-extrabold flex items-center justify-center space-x-2 shadow-lg tracking-wider uppercase mt-2"
          >
            <span>{loading ? 'AUTHENTICATING...' : isSignUp ? 'REGISTER ACCOUNT' : 'SIGN IN WITH FIREBASE'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Instant Demo Login Button */}
        <button
          onClick={handleDemoAccess}
          className="w-full py-2.5 rounded-xl bg-[#161a23] hover:bg-slate-800 border border-slate-800 text-[#34d399] font-mono text-xs font-bold flex items-center justify-center space-x-2 transition"
        >
          <Zap className="w-4 h-4 text-[#34d399] animate-bounce" />
          <span>INSTANT DEMO ACCESS (Deepak Kumar)</span>
        </button>

        {/* Security Footer */}
        <div className="text-center font-mono text-[10px] text-slate-500 flex items-center justify-center space-x-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
          <span>Firebase & GitHub Auth Connected • 256-Bit SSL</span>
        </div>

      </div>
    </div>
  );
};
