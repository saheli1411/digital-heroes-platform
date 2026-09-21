'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  HeartHandshake, 
  Trophy, 
  Sparkles, 
  ArrowUpRight, 
  Lock, 
  Layers 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 border-t border-white/10 text-slate-400 text-sm overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Mission Column */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 shadow-md shadow-emerald-500/20">
                DH
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                DIGITAL HEROES
              </span>
            </div>
            
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Transforming individual athletic rounds into collective social impact. Compete in monthly algorithmic prize pools while routing guaranteed support directly to verified causes worldwide.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> 10%+ Minimum Subscription Charity Guarantee
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold">
              Platform & Play
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/charities" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-slate-500" />
                  Verified Charities Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-slate-500" />
                  Athlete Dashboard & Score Log
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  Monthly & Yearly Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-slate-200 text-slate-500 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Admin Simulation Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Prize Mechanics & Transparency */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold">
              Draw Mechanics & Auditing
            </h4>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tier 1 (5-Match Jackpot):</span>
                <span className="font-mono text-emerald-400 font-bold">40% + Rollover</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tier 2 (4-Match Pool):</span>
                <span className="font-mono text-white font-medium">35%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tier 3 (3-Match Pool):</span>
                <span className="font-mono text-white font-medium">25%</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                Proof-verified winner payouts & FIFO 5-score rolling storage
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Digital Heroes (Level 1 PRD Implementation). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Stableford Rules
            </span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Proof Verification Policy
            </span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              PCI Compliance
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}