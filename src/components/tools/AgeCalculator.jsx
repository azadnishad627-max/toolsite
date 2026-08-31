import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Gift,
  Heart,
  Sparkles,
  Compass,
  Star,
  Activity,
  Award,
  Zap,
  RotateCcw,
  Moon,
  Sun,
  Flame,
  Droplets,
  Wind
} from 'lucide-react';
import TiltCard from '../3d/TiltCard';

// Western Zodiac Sign Finder
const getWesternZodiac = (month, day) => {
  // month is 1-indexed (1 = Jan, 12 = Dec)
  if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) {
    return { name: 'Capricorn', symbol: '♑', element: 'Earth', trait: 'Ambitious, disciplined & patient', icon: 'Mountain' };
  }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: 'Aquarius', symbol: '♒', element: 'Air', trait: 'Innovative, original & visionary', icon: 'Wind' };
  }
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return { name: 'Pisces', symbol: '♓', element: 'Water', trait: 'Empathetic, artistic & intuitive', icon: 'Droplets' };
  }
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: 'Aries', symbol: '♈', element: 'Fire', trait: 'Courageous, energetic & passionate', icon: 'Flame' };
  }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: 'Taurus', symbol: '♉', element: 'Earth', trait: 'Reliable, patient & devoted', icon: 'Mountain' };
  }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: 'Gemini', symbol: '♊', element: 'Air', trait: 'Curious, adaptable & quick-witted', icon: 'Wind' };
  }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: 'Cancer', symbol: '♋', element: 'Water', trait: 'Intuitive, sentimental & protective', icon: 'Droplets' };
  }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: 'Leo', symbol: '♌', element: 'Fire', trait: 'Dramatic, confident & charismatic', icon: 'Flame' };
  }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: 'Virgo', symbol: '♍', element: 'Earth', trait: 'Analytical, practical & loyal', icon: 'Mountain' };
  }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: 'Libra', symbol: '♎', element: 'Air', trait: 'Diplomatic, gracious & peaceful', icon: 'Wind' };
  }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: 'Scorpio', symbol: '♏', element: 'Water', trait: 'Resourceful, powerful & brave', icon: 'Droplets' };
  }
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: 'Sagittarius', symbol: '♐', element: 'Fire', trait: 'Optimistic, generous & enthusiastic', icon: 'Flame' };
  }
  return { name: 'Capricorn', symbol: '♑', element: 'Earth', trait: 'Ambitious & patient', icon: 'Mountain' };
};

// Chinese Zodiac Finder
const CHINESE_ZODIAC_ANIMALS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
];

const getChineseZodiac = (year) => {
  const index = (year - 4) % 12;
  const safeIndex = index >= 0 ? index : (index + 12) % 12;
  return CHINESE_ZODIAC_ANIMALS[safeIndex];
};

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function AgeCalculator() {
  // Format today as YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [birthDateStr, setBirthDateStr] = useState('2000-01-01');
  const [targetDateStr, setTargetDateStr] = useState(todayStr);

  // Quick reset to today
  const handleResetTargetDate = () => {
    setTargetDateStr(todayStr);
  };

  // Preset birthdays
  const setPresetBirthDate = (yearsAgo) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - yearsAgo);
    setBirthDateStr(d.toISOString().split('T')[0]);
  };

  // Calculations
  const calculation = useMemo(() => {
    if (!birthDateStr || !targetDateStr) return null;

    const [bY, bM, bD] = birthDateStr.split('-').map(Number);
    const [tY, tM, tD] = targetDateStr.split('-').map(Number);

    const birthDate = new Date(bY, bM - 1, bD);
    const targetDate = new Date(tY, tM - 1, tD);

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) return null;

    // Check if target is before birth
    const isFuture = targetDate.getTime() < birthDate.getTime();
    if (isFuture) {
      return { error: 'Target date must be on or after the date of birth.' };
    }

    // 1. Precise Years, Months, Days breakdown
    let years = tY - bY;
    let months = tM - bM;
    let days = tD - bD;

    if (days < 0) {
      months -= 1;
      // Get days in previous month of target
      const prevMonthDays = new Date(tY, tM - 1, 0).getDate();
      days += prevMonthDays;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // 2. Absolute time differences
    const totalMs = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDaysInWeek = totalDays % 7;
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // 3. Day of week born
    const dayOfWeekBorn = DAYS_OF_WEEK[birthDate.getDay()];

    // 4. Zodiac Signs
    const westernZodiac = getWesternZodiac(bM, bD);
    const chineseZodiac = getChineseZodiac(bY);

    // 5. Next Birthday Countdown
    let nextBdayYear = tY;
    let nextBday = new Date(nextBdayYear, bM - 1, bD);
    if (nextBday.getTime() < targetDate.getTime()) {
      nextBdayYear += 1;
      nextBday = new Date(nextBdayYear, bM - 1, bD);
    }

    const nextBdayDiffMs = nextBday.getTime() - targetDate.getTime();
    const nextBdayTotalDays = Math.round(nextBdayDiffMs / (1000 * 60 * 60 * 24));

    // Next birthday in months & days
    let nextBdayMonths = nextBday.getMonth() - targetDate.getMonth();
    let nextBdayDays = nextBday.getDate() - targetDate.getDate();
    if (nextBdayDays < 0) {
      nextBdayMonths -= 1;
      const prevMonthDays = new Date(nextBdayYear, nextBday.getMonth(), 0).getDate();
      nextBdayDays += prevMonthDays;
    }
    if (nextBdayMonths < 0) {
      nextBdayMonths += 12;
    }

    const turningAge = nextBdayYear - bY;
    const nextBdayDayOfWeek = DAYS_OF_WEEK[nextBday.getDay()];

    // 6. Fun Life Statistics
    const approxHeartbeats = Math.round(totalDays * 105000); // avg 73 bpm
    const approxBreaths = Math.round(totalDays * 23040); // avg 16 breaths/min
    const approxSleepYears = (years / 3).toFixed(1);

    // 7. Milestones
    const milestones = [
      { label: '10,000 Days on Earth', date: new Date(birthDate.getTime() + 10000 * 86400000) },
      { label: '15,000 Days on Earth', date: new Date(birthDate.getTime() + 15000 * 86400000) },
      { label: '20,000 Days on Earth', date: new Date(birthDate.getTime() + 20000 * 86400000) },
      { label: '30,000 Days on Earth', date: new Date(birthDate.getTime() + 30000 * 86400000) },
    ].map((m) => {
      const isPast = m.date.getTime() <= targetDate.getTime();
      return {
        ...m,
        dateStr: m.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        isPast,
      };
    });

    return {
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      remainingDaysInWeek,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      dayOfWeekBorn,
      westernZodiac,
      chineseZodiac,
      nextBdayTotalDays,
      nextBdayMonths,
      nextBdayDays,
      turningAge,
      nextBdayDayOfWeek,
      approxHeartbeats,
      approxBreaths,
      approxSleepYears,
      milestones,
    };
  }, [birthDateStr, targetDateStr]);

  return (
    <div className="space-y-8">
      {/* 3D Header Section */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Calendar className="w-4 h-4" />
              Chronological & Astrology Calculator
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Precision Age & Life Milestones
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Calculate exact years, months, and days lived, next birthday countdowns, birth weekday, life telemetry, and zodiac alignments.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Quick Sample:</span>
            {[18, 21, 25, 30, 40].map((age) => (
              <button
                key={age}
                onClick={() => setPresetBirthDate(age)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all"
              >
                {age}y
              </button>
            ))}
          </div>
        </div>
      </TiltCard>

      {/* Date Pickers Form */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDateStr}
              max={targetDateStr}
              onChange={(e) => setBirthDateStr(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
            />
          </div>

          {/* Calculate Age As Of Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Calculate Age As Of Date
              </label>
              {targetDateStr !== todayStr && (
                <button
                  onClick={handleResetTargetDate}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Today
                </button>
              )}
            </div>
            <input
              type="date"
              value={targetDateStr}
              min={birthDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {calculation && !calculation.error && (
        <div className="space-y-6">
          {/* Primary Age Big Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/40 border border-purple-500/30 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Exact Chronological Age
                </span>
                <div className="flex flex-wrap items-baseline gap-3 mt-2">
                  <span className="text-4xl md:text-5xl font-black font-['Space_Grotesk'] text-white">
                    {calculation.years}
                  </span>
                  <span className="text-lg font-bold text-slate-400">Years,</span>

                  <span className="text-4xl md:text-5xl font-black font-['Space_Grotesk'] text-purple-300">
                    {calculation.months}
                  </span>
                  <span className="text-lg font-bold text-slate-400">Months,</span>

                  <span className="text-4xl md:text-5xl font-black font-['Space_Grotesk'] text-cyan-300">
                    {calculation.days}
                  </span>
                  <span className="text-lg font-bold text-slate-400">Days</span>
                </div>

                <p className="text-sm text-slate-300 mt-3 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  You were born on a <strong className="text-white font-bold">{calculation.dayOfWeekBorn}</strong>.
                </p>
              </div>

              {/* Next Birthday Spotlight */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col justify-between md:min-w-[260px]">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-purple-400" />
                    Next Birthday
                  </span>
                  <span className="font-mono text-cyan-400">Turning {calculation.turningAge}</span>
                </div>

                <div className="my-2">
                  <div className="text-2xl md:text-3xl font-extrabold font-['Space_Grotesk'] text-white">
                    {calculation.nextBdayTotalDays === 0 ? (
                      <span className="text-emerald-400">Today! 🎉</span>
                    ) : (
                      `${calculation.nextBdayTotalDays} Days`
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {calculation.nextBdayMonths > 0 && `${calculation.nextBdayMonths} months, `}
                    {calculation.nextBdayDays} days away on a {calculation.nextBdayDayOfWeek}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aggregate Units Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Months', val: calculation.totalMonths.toLocaleString(), desc: `plus ${calculation.days} days`, icon: Calendar, color: 'text-indigo-400' },
              { label: 'Total Weeks', val: calculation.totalWeeks.toLocaleString(), desc: `plus ${calculation.remainingDaysInWeek} days`, icon: Clock, color: 'text-cyan-400' },
              { label: 'Total Days', val: calculation.totalDays.toLocaleString(), desc: 'days on Earth', icon: Sun, color: 'text-amber-400' },
              { label: 'Total Hours', val: calculation.totalHours.toLocaleString(), desc: 'hours elapsed', icon: Zap, color: 'text-purple-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                      {stat.val}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{stat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Astrological & Life Telemetry Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Western Zodiac Card */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4" />
                  Western Zodiac Sign
                </span>
                <span className="text-2xl font-serif text-purple-300">
                  {calculation.westernZodiac.symbol}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                  {calculation.westernZodiac.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                    Element: {calculation.westernZodiac.element}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-white/5">
                {calculation.westernZodiac.trait}
              </p>
            </div>

            {/* Chinese Zodiac & Life Energy */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Chinese Zodiac Sign
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                  Lunar Year
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                  Year of the {calculation.chineseZodiac}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Symbol of wisdom, perseverance, and vitality in Eastern tradition.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Total Minutes Lived:</span>
                  <span className="font-mono text-purple-300">{calculation.totalMinutes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Total Seconds Lived:</span>
                  <span className="font-mono text-cyan-300">{calculation.totalSeconds.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Biometric Estimation */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Biometric Estimates
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Est. Heartbeats:</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ~{(calculation.approxHeartbeats / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span>Est. Breaths Taken:</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ~{(calculation.approxBreaths / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Time Spent Asleep:</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ~{calculation.approxSleepYears} Years
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {calculation && calculation.error && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <span>{calculation.error}</span>
        </div>
      )}
    </div>
  );
}
