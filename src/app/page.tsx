'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, HeartHandshake, ShieldCheck, Sparkles, ArrowRight, Activity } from 'lucide-react';

export default function HomePage() {
  const previewScores = [38, 41, 36, 44, 39];

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] ambient-glow-emerald pointer-events-none" />
      <div className="absolute top-96 -left-32 w-[500px] h-[500px] ambient-glow-cyan pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" /> Reimagined Philanthropy Through Sports
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-8"
        >
          Where Every Good Score <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Funds A Better World.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Enter your last 5 Stableford scores to enter transparent algorithmic prize pools—all while routing 10%+ of your subscription directly to verified global charities.
        </motion.p>

        {/* Live Visual Pill Deck (Simulating the 5-Score Draw Entry) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex flex-col items-center glass-panel-glow p-6 rounded-3xl mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-mono">
            Active Rolling Scorecard Entry
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center">
            {previewScores.map((score, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 flex flex-col items-center justify-center font-mono shadow-inner"
              >
                <span className="text-lg sm:text-xl font-black text-emerald-400">{score}</span>
                <span className="text-[10px] text-slate-500 font-sans">#0{idx + 1}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/subscribe"
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
          >
            Join the Monthly Draw <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/charities"
            className="flex items-center justify-center glass-panel hover:bg-slate-800/80 text-slate-200 font-medium px-8 py-4 rounded-xl transition-all"
          >
            Explore Registered Causes
          </Link>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Rolling 5-Score Vault</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Strict FIFO algorithmic storage. Enter your genuine Stableford rounds (1–45). Older scores cycle out automatically, keeping your entry fresh for every draw.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Charity-First Economics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every subscriber selects a verified cause. At least 10% of subscription revenue funds social good directly, with full transparency tracking on your dashboard.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Algorithmic Draws & Rollovers</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tiered prize distribution (40% for 5-match, 35% for 4-match, 25% for 3-match). If the 5-match jackpot is unclaimed, it rolls over automatically to next month.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <footer className="border-t border-white/5 py-12 text-center text-xs text-slate-500">
        <div className="flex justify-center items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PCI-DSS Compliant • Proof-Verified Payouts • Transparent Auditing</span>
        </div>
        <p>© 2026 Digital Heroes. Purpose-driven sports innovation.</p>
      </footer>
    </main>
  );
}