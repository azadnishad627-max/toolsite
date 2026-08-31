import React, { useState, useMemo } from 'react';
import {
  Scale,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Ruler,
  Weight,
  Thermometer,
  Gauge,
  Maximize,
  Beaker,
  HardDrive,
  Clock,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../3d/TiltCard';

// Unit Definitions & Conversion Ratios
const CATEGORIES = {
  length: {
    label: 'Length',
    icon: Ruler,
    baseUnit: 'm',
    units: {
      mm: { name: 'Millimeter (mm)', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001, symbol: 'mm' },
      cm: { name: 'Centimeter (cm)', toBase: (v) => v * 0.01, fromBase: (v) => v / 0.01, symbol: 'cm' },
      m: { name: 'Meter (m)', toBase: (v) => v, fromBase: (v) => v, symbol: 'm' },
      km: { name: 'Kilometer (km)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000, symbol: 'km' },
      inch: { name: 'Inch (in)', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254, symbol: 'in' },
      foot: { name: 'Foot (ft)', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048, symbol: 'ft' },
      yard: { name: 'Yard (yd)', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144, symbol: 'yd' },
      mile: { name: 'Mile (mi)', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344, symbol: 'mi' }
    },
    defaultFrom: 'm',
    defaultTo: 'foot'
  },
  weight: {
    label: 'Weight',
    icon: Weight,
    baseUnit: 'g',
    units: {
      mg: { name: 'Milligram (mg)', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001, symbol: 'mg' },
      g: { name: 'Gram (g)', toBase: (v) => v, fromBase: (v) => v, symbol: 'g' },
      kg: { name: 'Kilogram (kg)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000, symbol: 'kg' },
      lb: { name: 'Pound (lb)', toBase: (v) => v * 453.59237, fromBase: (v) => v / 453.59237, symbol: 'lb' },
      oz: { name: 'Ounce (oz)', toBase: (v) => v * 28.349523125, fromBase: (v) => v / 28.349523125, symbol: 'oz' },
      ton: { name: 'Metric Ton (t)', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000, symbol: 't' }
    },
    defaultFrom: 'kg',
    defaultTo: 'lb'
  },
  temperature: {
    label: 'Temperature',
    icon: Thermometer,
    baseUnit: 'C',
    units: {
      Celsius: {
        name: 'Celsius (°C)',
        toBase: (v) => v,
        fromBase: (v) => v,
        symbol: '°C'
      },
      Fahrenheit: {
        name: 'Fahrenheit (°F)',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
        symbol: '°F'
      },
      Kelvin: {
        name: 'Kelvin (K)',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
        symbol: 'K'
      }
    },
    defaultFrom: 'Celsius',
    defaultTo: 'Fahrenheit'
  },
  speed: {
    label: 'Speed',
    icon: Gauge,
    baseUnit: 'm/s',
    units: {
      'm/s': { name: 'Meters per second (m/s)', toBase: (v) => v, fromBase: (v) => v, symbol: 'm/s' },
      'km/h': { name: 'Kilometers per hour (km/h)', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6, symbol: 'km/h' },
      mph: { name: 'Miles per hour (mph)', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704, symbol: 'mph' },
      knots: { name: 'Knots (kn)', toBase: (v) => v * 0.5144444444, fromBase: (v) => v / 0.5144444444, symbol: 'kn' }
    },
    defaultFrom: 'km/h',
    defaultTo: 'mph'
  },
  area: {
    label: 'Area',
    icon: Maximize,
    baseUnit: 'm2',
    units: {
      'mm²': { name: 'Square Millimeter (mm²)', toBase: (v) => v * 1e-6, fromBase: (v) => v / 1e-6, symbol: 'mm²' },
      'cm²': { name: 'Square Centimeter (cm²)', toBase: (v) => v * 0.0001, fromBase: (v) => v / 0.0001, symbol: 'cm²' },
      'm²': { name: 'Square Meter (m²)', toBase: (v) => v, fromBase: (v) => v, symbol: 'm²' },
      'km²': { name: 'Square Kilometer (km²)', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000, symbol: 'km²' },
      acre: { name: 'Acre (ac)', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224, symbol: 'ac' },
      hectare: { name: 'Hectare (ha)', toBase: (v) => v * 10000, fromBase: (v) => v / 10000, symbol: 'ha' },
      'sq ft': { name: 'Square Foot (sq ft)', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304, symbol: 'sq ft' },
      'sq mile': { name: 'Square Mile (sq mi)', toBase: (v) => v * 2589988.110336, fromBase: (v) => v / 2589988.110336, symbol: 'sq mi' }
    },
    defaultFrom: 'm²',
    defaultTo: 'sq ft'
  },
  volume: {
    label: 'Volume',
    icon: Beaker,
    baseUnit: 'l',
    units: {
      ml: { name: 'Milliliter (ml)', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001, symbol: 'ml' },
      l: { name: 'Liter (l)', toBase: (v) => v, fromBase: (v) => v, symbol: 'l' },
      gallon: { name: 'Gallon (US gal)', toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784, symbol: 'gal' },
      cup: { name: 'Cup (US cup)', toBase: (v) => v * 0.2365882365, fromBase: (v) => v / 0.2365882365, symbol: 'cup' },
      tbsp: { name: 'Tablespoon (US tbsp)', toBase: (v) => v * 0.01478676478, fromBase: (v) => v / 0.01478676478, symbol: 'tbsp' },
      tsp: { name: 'Teaspoon (US tsp)', toBase: (v) => v * 0.00492892159, fromBase: (v) => v / 0.00492892159, symbol: 'tsp' }
    },
    defaultFrom: 'l',
    defaultTo: 'gallon'
  },
  data: {
    label: 'Data Storage',
    icon: HardDrive,
    baseUnit: 'byte',
    units: {
      bit: { name: 'Bit (b)', toBase: (v) => v * 0.125, fromBase: (v) => v / 0.125, symbol: 'b' },
      byte: { name: 'Byte (B)', toBase: (v) => v, fromBase: (v) => v, symbol: 'B' },
      KB: { name: 'Kilobyte (KB)', toBase: (v) => v * 1024, fromBase: (v) => v / 1024, symbol: 'KB' },
      MB: { name: 'Megabyte (MB)', toBase: (v) => v * 1024 * 1024, fromBase: (v) => v / (1024 * 1024), symbol: 'MB' },
      GB: { name: 'Gigabyte (GB)', toBase: (v) => v * Math.pow(1024, 3), fromBase: (v) => v / Math.pow(1024, 3), symbol: 'GB' },
      TB: { name: 'Terabyte (TB)', toBase: (v) => v * Math.pow(1024, 4), fromBase: (v) => v / Math.pow(1024, 4), symbol: 'TB' },
      PB: { name: 'Petabyte (PB)', toBase: (v) => v * Math.pow(1024, 5), fromBase: (v) => v / Math.pow(1024, 5), symbol: 'PB' }
    },
    defaultFrom: 'GB',
    defaultTo: 'MB'
  },
  time: {
    label: 'Time',
    icon: Clock,
    baseUnit: 'sec',
    units: {
      ms: { name: 'Millisecond (ms)', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001, symbol: 'ms' },
      sec: { name: 'Second (s)', toBase: (v) => v, fromBase: (v) => v, symbol: 's' },
      min: { name: 'Minute (min)', toBase: (v) => v * 60, fromBase: (v) => v / 60, symbol: 'min' },
      hour: { name: 'Hour (hr)', toBase: (v) => v * 3600, fromBase: (v) => v / 3600, symbol: 'hr' },
      day: { name: 'Day (d)', toBase: (v) => v * 86400, fromBase: (v) => v / 86400, symbol: 'd' },
      week: { name: 'Week (wk)', toBase: (v) => v * 604800, fromBase: (v) => v / 604800, symbol: 'wk' },
      month: { name: 'Month (30.4 days)', toBase: (v) => v * 2629800, fromBase: (v) => v / 2629800, symbol: 'mo' },
      year: { name: 'Year (365.25 days)', toBase: (v) => v * 31557600, fromBase: (v) => v / 31557600, symbol: 'yr' }
    },
    defaultFrom: 'hour',
    defaultTo: 'min'
  }
};

/**
 * Format numeric output cleanly
 */
function formatNumber(num) {
  if (isNaN(num) || num === null || num === undefined) return '0';
  if (num === 0) return '0';

  const absNum = Math.abs(num);
  if (absNum < 0.00001 || absNum >= 1e10) {
    return num.toExponential(6);
  }

  // Format with smart decimals (up to 6 digits, omit trailing zeroes)
  return Number(num.toFixed(6)).toLocaleString('en-US', {
    maximumFractionDigits: 6
  });
}

export default function UnitConverter() {
  const [categoryKey, setCategoryKey] = useState('length');
  const [fromUnit, setFromUnit] = useState(CATEGORIES.length.defaultFrom);
  const [toUnit, setToUnit] = useState(CATEGORIES.length.defaultTo);
  const [inputValue, setInputValue] = useState('1');
  const [copied, setCopied] = useState(false);

  const category = CATEGORIES[categoryKey];

  // Switch category
  const handleCategoryChange = (key) => {
    setCategoryKey(key);
    setFromUnit(CATEGORIES[key].defaultFrom);
    setToUnit(CATEGORIES[key].defaultTo);
  };

  // Swap From & To
  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Calculate Conversion Result
  const conversionResult = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return { numeric: 0, formatted: '0', formula: '' };

    const fromDef = category.units[fromUnit];
    const toDef = category.units[toUnit];
    if (!fromDef || !toDef) return { numeric: 0, formatted: '0', formula: '' };

    const baseVal = fromDef.toBase(num);
    const converted = toDef.fromBase(baseVal);

    // Calculate formula text
    let formula = '';
    if (categoryKey === 'temperature') {
      if (fromUnit === 'Celsius' && toUnit === 'Fahrenheit') formula = `(${inputValue} × 9/5) + 32`;
      else if (fromUnit === 'Fahrenheit' && toUnit === 'Celsius') formula = `(${inputValue} - 32) × 5/9`;
      else if (fromUnit === 'Celsius' && toUnit === 'Kelvin') formula = `${inputValue} + 273.15`;
      else if (fromUnit === 'Kelvin' && toUnit === 'Celsius') formula = `${inputValue} - 273.15`;
      else if (fromUnit === 'Fahrenheit' && toUnit === 'Kelvin') formula = `(${inputValue} - 32) × 5/9 + 273.15`;
      else if (fromUnit === 'Kelvin' && toUnit === 'Fahrenheit') formula = `(${inputValue} - 273.15) × 9/5 + 32`;
      else formula = `${inputValue}`;
    } else {
      const oneBase = fromDef.toBase(1);
      const ratio = toDef.fromBase(oneBase);
      formula = `1 ${fromDef.symbol} ≈ ${formatNumber(ratio)} ${toDef.symbol}`;
    }

    return {
      numeric: converted,
      formatted: formatNumber(converted),
      formula
    };
  }, [categoryKey, category, fromUnit, toUnit, inputValue]);

  // Calculate All Units Table in Active Category
  const allConversions = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return [];

    const fromDef = category.units[fromUnit];
    if (!fromDef) return [];

    const baseVal = fromDef.toBase(num);
    return Object.entries(category.units).map(([key, def]) => {
      const converted = def.fromBase(baseVal);
      return {
        key,
        name: def.name,
        symbol: def.symbol,
        value: formatNumber(converted),
        isCurrent: key === toUnit
      };
    });
  }, [category, fromUnit, toUnit, inputValue]);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${inputValue} ${category.units[fromUnit]?.symbol || ''} = ${conversionResult.formatted} ${category.units[toUnit]?.symbol || ''}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 3D TiltCard Header */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Scale className="w-4 h-4" />
              Scientific & Engineering Metrics
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Universal Unit Converter
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Convert across 8 categories including length, weight, speed, temperature, data storage, volume, and time with high precision arithmetic.
            </p>
          </div>

          {/* Active Category Display */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/80 border border-white/10 shrink-0">
            {React.createElement(category.icon, { className: 'w-5 h-5 text-indigo-400' })}
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Active Mode</span>
              <span className="text-xs font-bold text-white">{category.label}</span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Main Workbench Container */}
      <div className="space-y-6">
        {/* Category Selector Pills */}
        <div className="p-2 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {Object.entries(CATEGORIES).map(([key, item]) => {
            const Icon = item.icon;
            const isActive = categoryKey === key;
            return (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-neon-indigo'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Interactive Converter Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/70 border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* FROM COLUMN */}
            <div className="md:col-span-5 space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                From Unit
              </label>

              <div className="relative">
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-semibold appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer pr-10"
                >
                  {Object.entries(category.units).map(([key, def]) => (
                    <option key={key} value={key}>
                      {def.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-4 pointer-events-none" />
              </div>

              {/* Number Input */}
              <input
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value..."
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-lg font-mono font-bold placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* SWAP BUTTON (CENTER) */}
            <div className="md:col-span-1 flex justify-center pt-4 md:pt-6">
              <button
                onClick={handleSwap}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white border border-white/10 transition-all hover:scale-110 shadow-md"
                title="Swap Units"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* TO COLUMN */}
            <div className="md:col-span-5 space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                To Unit
              </label>

              <div className="relative">
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-semibold appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer pr-10"
                >
                  {Object.entries(category.units).map(([key, def]) => (
                    <option key={key} value={key}>
                      {def.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-4 pointer-events-none" />
              </div>

              {/* Result Readout */}
              <div className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between overflow-hidden">
                <span className="text-lg font-mono font-bold text-emerald-400 truncate">
                  {conversionResult.formatted}
                </span>
                <span className="text-xs font-semibold text-slate-400 ml-2 font-mono shrink-0">
                  {category.units[toUnit]?.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Summary & Formula Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Conversion Formula
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                {conversionResult.formula}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Result'}
              </button>

              <button
                onClick={() => setInputValue('1')}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all"
                title="Reset to 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* All Units Real-Time Grid */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Equivalent {category.label} Values
            </h3>
            <span className="text-xs text-slate-400">
              For {inputValue || '0'} {category.units[fromUnit]?.symbol}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {allConversions.map((item) => (
              <div
                key={item.key}
                onClick={() => setToUnit(item.key)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                  item.isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-neon-indigo'
                    : 'bg-slate-950 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[130px]">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono px-1.5 py-0.5 rounded bg-slate-900">
                    {item.symbol}
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-white mt-1 truncate">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
