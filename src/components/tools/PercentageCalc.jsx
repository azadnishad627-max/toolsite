import React, { useState, useMemo } from 'react';
import {
  Percent,
  Calculator,
  Copy,
  Check,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Receipt,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../3d/TiltCard';

/**
 * Format numeric value nicely for display
 */
function formatCalcResult(num, maxDecimals = 4) {
  if (isNaN(num) || num === null || !isFinite(num)) return '0';
  return Number(num.toFixed(maxDecimals)).toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals
  });
}

function formatCurrency(num) {
  if (isNaN(num) || num === null || !isFinite(num)) return '$0.00';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PercentageCalc() {
  const [copiedCard, setCopiedCard] = useState(null);

  // Card 1: What is X% of Y?
  const [card1X, setCard1X] = useState('15');
  const [card1Y, setCard1Y] = useState('200');

  // Card 2: X is what % of Y?
  const [card2X, setCard2X] = useState('30');
  const [card2Y, setCard2Y] = useState('200');

  // Card 3: % Increase / Decrease from X to Y
  const [card3X, setCard3X] = useState('100');
  const [card3Y, setCard3Y] = useState('150');

  // Card 4: Tip & Split Calculator
  const [billAmount, setBillAmount] = useState('85.00');
  const [tipPercent, setTipPercent] = useState('18');
  const [splitCount, setSplitCount] = useState('2');

  const copyToClipboard = (cardId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedCard(cardId);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  // Computations
  // Card 1
  const result1 = useMemo(() => {
    const x = parseFloat(card1X);
    const y = parseFloat(card1Y);
    if (isNaN(x) || isNaN(y)) return { val: 0, str: '0', formula: '' };
    const val = (x / 100) * y;
    return {
      val,
      str: formatCalcResult(val),
      formula: `(${card1X} ÷ 100) × ${card1Y} = ${formatCalcResult(val)}`
    };
  }, [card1X, card1Y]);

  // Card 2
  const result2 = useMemo(() => {
    const x = parseFloat(card2X);
    const y = parseFloat(card2Y);
    if (isNaN(x) || isNaN(y) || y === 0) return { val: 0, str: '0', formula: '' };
    const val = (x / y) * 100;
    return {
      val,
      str: `${formatCalcResult(val)}%`,
      formula: `(${card2X} ÷ ${card2Y}) × 100 = ${formatCalcResult(val)}%`
    };
  }, [card2X, card2Y]);

  // Card 3
  const result3 = useMemo(() => {
    const x = parseFloat(card3X);
    const y = parseFloat(card3Y);
    if (isNaN(x) || isNaN(y) || x === 0) {
      return { diff: 0, percent: 0, isIncrease: true, diffStr: '0', formula: '', multiplier: '1' };
    }
    const diff = y - x;
    const percent = (diff / Math.abs(x)) * 100;
    const isIncrease = diff >= 0;
    const multiplier = (y / x).toFixed(2);
    return {
      diff,
      percent: Math.abs(percent),
      isIncrease,
      diffStr: formatCalcResult(Math.abs(diff)),
      percentStr: `${formatCalcResult(Math.abs(percent))}%`,
      multiplier,
      formula: `((${card3Y} - ${card3X}) ÷ ${card3X}) × 100 = ${formatCalcResult(percent)}%`
    };
  }, [card3X, card3Y]);

  // Card 4: Tip & Split
  const result4 = useMemo(() => {
    const bill = parseFloat(billAmount) || 0;
    const tip = parseFloat(tipPercent) || 0;
    const people = Math.max(1, parseInt(splitCount, 10) || 1);

    const tipTotal = bill * (tip / 100);
    const billTotal = bill + tipTotal;
    const tipPerPerson = tipTotal / people;
    const totalPerPerson = billTotal / people;

    return {
      tipTotal,
      billTotal,
      tipPerPerson,
      totalPerPerson,
      people
    };
  }, [billAmount, tipPercent, splitCount]);

  return (
    <div className="space-y-8">
      {/* 3D TiltCard Header */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Percent className="w-4 h-4" />
              Financial & Quantitative Precision
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Percentage & Ratio Engine
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Compute percentage values, relative ratios, delta differences, and tip split breakdowns with zero latency and clean step-by-step arithmetic.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCard1X('15'); setCard1Y('200');
                setCard2X('30'); setCard2Y('200');
                setCard3X('100'); setCard3Y('150');
                setBillAmount('85.00'); setTipPercent('18'); setSplitCount('2');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Reset All Cards
            </button>
          </div>
        </div>
      </TiltCard>

      {/* 4 Calculation Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: What is X% of Y? */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" /> Mode 1
              </span>
              <button
                onClick={() => { setCard1X(''); setCard1Y(''); }}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
              What is <span className="text-indigo-400">X%</span> of <span className="text-purple-400">Y</span>?
            </h3>

            {/* Inputs Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Percentage (X %)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={card1X}
                    onChange={(e) => setCard1X(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 text-xs font-mono">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Total Value (Y)</label>
                <input
                  type="number"
                  step="any"
                  value={card1Y}
                  onChange={(e) => setCard1Y(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Result</span>
              <button
                onClick={() => copyToClipboard('card1', `${card1X}% of ${card1Y} = ${result1.str}`)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedCard === 'card1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCard === 'card1' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {result1.str}
            </div>
            {result1.formula && (
              <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-white/5 truncate">
                {result1.formula}
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: X is what % of Y? */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" /> Mode 2
              </span>
              <button
                onClick={() => { setCard2X(''); setCard2Y(''); }}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
              <span className="text-cyan-400">X</span> is what <span className="text-indigo-400">%</span> of <span className="text-purple-400">Y</span>?
            </h3>

            {/* Inputs Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Part Value (X)</label>
                <input
                  type="number"
                  step="any"
                  value={card2X}
                  onChange={(e) => setCard2X(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Total Value (Y)</label>
                <input
                  type="number"
                  step="any"
                  value={card2Y}
                  onChange={(e) => setCard2Y(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Percentage Share</span>
              <button
                onClick={() => copyToClipboard('card2', `${card2X} is ${result2.str} of ${card2Y}`)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedCard === 'card2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCard === 'card2' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono">
              {result2.str}
            </div>
            {result2.formula && (
              <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-white/5 truncate">
                {result2.formula}
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: % Increase / Decrease from X to Y */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Mode 3
              </span>
              <button
                onClick={() => { setCard3X(''); setCard3Y(''); }}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
              % Change from <span className="text-amber-400">X</span> to <span className="text-emerald-400">Y</span>
            </h3>

            {/* Inputs Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Initial Value (X)</label>
                <input
                  type="number"
                  step="any"
                  value={card3X}
                  onChange={(e) => setCard3X(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Final Value (Y)</label>
                <input
                  type="number"
                  step="any"
                  value={card3Y}
                  onChange={(e) => setCard3Y(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Change Delta</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    result3.isIncrease
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {result3.isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {result3.isIncrease ? 'Increase' : 'Decrease'}
                </span>
              </div>

              <button
                onClick={() => copyToClipboard('card3', `${result3.isIncrease ? '+' : '-'}${result3.percentStr} (diff: ${result3.diffStr})`)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedCard === 'card3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCard === 'card3' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <span
                className={`text-2xl font-extrabold font-mono ${
                  result3.isIncrease ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result3.isIncrease ? '+' : '-'}{result3.percentStr}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (Difference: {result3.diffStr})
              </span>
            </div>

            {result3.formula && (
              <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-white/5 truncate">
                {result3.formula}
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: Tip & Split Calculator */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" /> Mode 4: Tip & Bill Split
              </span>
              <button
                onClick={() => { setBillAmount('0'); setTipPercent('15'); setSplitCount('1'); }}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Reset
              </button>
            </div>

            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
              Restaurant Tip & Group Split
            </h3>

            {/* Inputs Grid */}
            <div className="space-y-3">
              {/* Bill Amount */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Bill Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tip Percent Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-400">Tip Percentage</label>
                  <span className="text-xs font-mono font-bold text-indigo-400">{tipPercent}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {['10', '15', '18', '20', '25'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTipPercent(t)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                        tipPercent === t
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {t}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={tipPercent}
                    onChange={(e) => setTipPercent(e.target.value)}
                    placeholder="Custom"
                    className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Split Count */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Split Between People
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={splitCount}
                    onChange={(e) => setSplitCount(e.target.value)}
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="px-3 py-1 rounded-lg bg-slate-950 border border-white/10 font-mono text-xs font-bold text-white min-w-[50px] text-center">
                    {splitCount} {parseInt(splitCount, 10) === 1 ? 'person' : 'people'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Result Area */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center pb-2 border-b border-white/5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Tip</span>
                <span className="text-base font-bold text-purple-400 font-mono">
                  {formatCurrency(result4.tipTotal)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Bill</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {formatCurrency(result4.billTotal)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tip / Person</span>
                <span className="text-sm font-bold text-indigo-300 font-mono">
                  {formatCurrency(result4.tipPerPerson)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total / Person</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {formatCurrency(result4.totalPerPerson)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
