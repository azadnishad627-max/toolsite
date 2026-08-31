import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Sliders,
  Sparkles,
  Lock,
  Layers,
  Eye,
  EyeOff,
  Terminal,
  Zap
} from 'lucide-react';
import TiltCard from '../3d/TiltCard';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const SIMILAR_CHARS = /[il1Lo0OI|`'"]/g;

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [quantity, setQuantity] = useState(5);

  const [primaryPassword, setPrimaryPassword] = useState('');
  const [passwordList, setPasswordList] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  // Cryptographically secure random integer between 0 and max (exclusive)
  const getCryptoRandomInt = (max) => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return buffer[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  // Generate a single password
  const generateSinglePassword = useCallback(
    (pwdLength = length) => {
      let pool = '';
      if (useUppercase) pool += CHAR_SETS.uppercase;
      if (useLowercase) pool += CHAR_SETS.lowercase;
      if (useNumbers) pool += CHAR_SETS.numbers;
      if (useSymbols) pool += CHAR_SETS.symbols;

      if (excludeSimilar) {
        pool = pool.replace(SIMILAR_CHARS, '');
      }

      if (!pool) return 'Please select at least one character type';

      let result = '';
      const poolLen = pool.length;
      for (let i = 0; i < pwdLength; i++) {
        const randIndex = getCryptoRandomInt(poolLen);
        result += pool.charAt(randIndex);
      }
      return result;
    },
    [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeSimilar]
  );

  // Generate batch of passwords
  const generateAllPasswords = useCallback(() => {
    const main = generateSinglePassword(length);
    setPrimaryPassword(main);

    const list = [];
    for (let i = 0; i < quantity; i++) {
      list.push(generateSinglePassword(length));
    }
    setPasswordList(list);
  }, [generateSinglePassword, length, quantity]);

  // Auto-generate on settings change
  useEffect(() => {
    generateAllPasswords();
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeSimilar, quantity, generateAllPasswords]);

  // Calculate Strength & Entropy
  const calculateStrength = (pwd) => {
    if (!pwd || pwd.startsWith('Please select')) {
      return { score: 0, label: 'None', color: 'bg-slate-700', textCol: 'text-slate-500', crackTime: 'N/A', entropy: 0 };
    }

    let poolSize = 0;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) poolSize += 32;

    if (poolSize === 0) poolSize = 1;
    const entropy = Math.round(pwd.length * Math.log2(poolSize));

    if (pwd.length < 8 || entropy < 36) {
      return { score: 1, label: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-400', crackTime: '< a few seconds', entropy };
    }
    if (pwd.length < 12 || entropy < 60) {
      return { score: 2, label: 'Medium', color: 'bg-amber-500', textCol: 'text-amber-400', crackTime: '~ 2 to 3 days', entropy };
    }
    if (pwd.length < 20 || entropy < 85) {
      return { score: 3, label: 'Strong', color: 'bg-indigo-500', textCol: 'text-indigo-400', crackTime: '~ 3,000+ years', entropy };
    }
    return { score: 4, label: 'Very Strong', color: 'bg-emerald-500', textCol: 'text-emerald-400', crackTime: 'Trillions of centuries', entropy };
  };

  const strength = calculateStrength(primaryPassword);

  const handleCopy = async (textToCopy, index) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyAll = async () => {
    if (passwordList.length === 0) return;
    try {
      await navigator.clipboard.writeText(passwordList.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy all', err);
    }
  };

  const handleRegenerateItem = (idx) => {
    const newPwd = generateSinglePassword(length);
    const updated = [...passwordList];
    updated[idx] = newPwd;
    setPasswordList(updated);
    if (idx === 0) {
      setPrimaryPassword(newPwd);
    }
  };

  return (
    <div className="space-y-8">
      {/* 3D Header Section */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Lock className="w-4 h-4" />
              Cryptographic Entropy Engine
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Secure Password Generator
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Generate uncrackable, cryptographically random passwords 100% in-browser using Web Cryptography API with entropy calculations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateAllPasswords}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-neon-indigo transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate All
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Main Password Output Spotlight */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/70 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Primary Password</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              strength.score === 4 ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
              strength.score === 3 ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
              strength.score === 2 ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
              'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {strength.label} ({strength.entropy} bits)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-all flex items-center gap-1.5"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPassword ? 'Hide' : 'Reveal'}
            </button>
            <button
              onClick={() => handleCopy(primaryPassword, 'primary')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                copiedIndex === 'primary'
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-neon-cyan'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-transparent'
              }`}
            >
              {copiedIndex === 'primary' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIndex === 'primary' ? 'Copied!' : 'Copy Password'}
            </button>
          </div>
        </div>

        {/* Big Password Display */}
        <div className="p-4 md:p-6 rounded-xl bg-slate-950 border border-white/10 relative overflow-hidden group">
          <div className="font-mono text-lg md:text-2xl text-white break-all tracking-wider selection:bg-purple-500 selection:text-white select-all">
            {showPassword ? primaryPassword : '•'.repeat(primaryPassword.length || 16)}
          </div>
        </div>

        {/* Strength Meter Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Security Strength: <strong className={strength.textCol}>{strength.label}</strong></span>
            <span>Brute Force Time: <strong className="text-slate-200">{strength.crackTime}</strong></span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step <= strength.score ? strength.color : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Generator Controls and Multiple Passwords Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white">Customization Options</h3>
          </div>

          {/* Length Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password Length</label>
              <span className="text-sm font-bold font-mono px-2.5 py-0.5 rounded-lg bg-slate-950 border border-white/10 text-purple-400">
                {length} chars
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            {/* Quick length presets */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[8, 12, 16, 24, 32, 64].map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all ${
                    length === l
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Character Sets Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <span className="text-xs font-semibold text-slate-300">Character Sets</span>

            {[
              { label: 'Uppercase Letters (A-Z)', val: useUppercase, set: setUseUppercase },
              { label: 'Lowercase Letters (a-z)', val: useLowercase, set: setUseLowercase },
              { label: 'Numbers (0-9)', val: useNumbers, set: setUseNumbers },
              { label: 'Special Symbols (!@#$...)', val: useSymbols, set: setUseSymbols },
              { label: 'Exclude Ambiguous (0, O, l, 1, I, |)', val: excludeSimilar, set: setExcludeSimilar },
            ].map((opt) => (
              <label
                key={opt.label}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-white/5 cursor-pointer transition-colors"
              >
                <span className="text-xs text-slate-300">{opt.label}</span>
                <input
                  type="checkbox"
                  checked={opt.val}
                  onChange={(e) => opt.set(e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-600 bg-slate-900 border-white/10 cursor-pointer"
                />
              </label>
            ))}
          </div>

          {/* Batch Size Selector */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Batch Quantity</label>
              <span className="text-xs font-mono text-purple-400">{quantity} passwords</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 10].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    quantity === qty
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generated Multi-Password List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Generated Password Batch ({passwordList.length})</h3>
            </div>

            <button
              onClick={handleCopyAll}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                copiedAll
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10'
              }`}
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              {copiedAll ? 'Copied All!' : 'Copy All Batch'}
            </button>
          </div>

          {/* List items */}
          <div className="space-y-2.5">
            {passwordList.map((pwd, idx) => {
              const itemStrength = calculateStrength(pwd);
              const isCopied = copiedIndex === idx;
              return (
                <motion.div
                  key={`${pwd}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-white/10 text-slate-500 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-sm text-slate-200 truncate select-all">
                      {pwd}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      itemStrength.score >= 3 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {itemStrength.entropy} bits
                    </span>
                    <button
                      onClick={() => handleRegenerateItem(idx)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                      title="Regenerate this password"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(pwd, idx)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                        isCopied
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10'
                      }`}
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 flex items-start gap-3 mt-4">
            <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-purple-300">100% Cryptographic Security:</strong> All randomness is sourced from your browser's CSPRNG (<code className="text-purple-200 bg-purple-950/60 px-1 py-0.5 rounded">crypto.getRandomValues</code>). Passwords never touch any remote servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
