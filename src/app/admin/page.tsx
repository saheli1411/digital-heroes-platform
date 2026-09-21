'use client';

import { useState, useEffect } from 'react';
import { executeDrawEngine } from '@/app/actions/draws';
import { createClient } from '@/lib/supabase/client';
import { Settings, Play, Database, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [simulation, setSimulation] = useState<any>(null);
  const [mode, setMode] = useState<'random' | 'algorithmic'>('algorithmic');
  const [loading, setLoading] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, prizePool: 0, charityTotal: 0 });

  const loadAdminData = async () => {
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: drawsData } = await supabase.from('draws').select('jackpot_pool, charity_pool');
    
    const prizeSum = drawsData?.reduce((acc, d) => acc + (Number(d.jackpot_pool) || 0), 0) || 0;
    const charitySum = drawsData?.reduce((acc, d) => acc + (Number(d.charity_pool) || 0), 0) || 0;

    setStats({ users: usersCount || 0, prizePool: prizeSum, charityTotal: charitySum });

    const { data: winners } = await supabase
      .from('draw_winners')
      .select('*, profiles(full_name)')
      .eq('verification_status', 'under_review');
    setPendingVerifications(winners || []);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRunDraw = async (isPublish: boolean) => {
    setLoading(true);
    try {
      const res = await executeDrawEngine(mode, isPublish);
      setSimulation(res);
      if (isPublish) {
        alert('Draw published to production ledger!');
        await loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Error running draw');
    } finally {
      setLoading(false);
    }
  };

  const verifyWinner = async (winnerId: string, status: 'approved' | 'rejected') => {
    await supabase.from('draw_winners').update({ verification_status: status }).eq('id', winnerId);
    await loadAdminData();
  };

  const markPayout = async (winnerId: string) => {
    await supabase.from('draw_winners').update({ payout_status: 'paid' }).eq('id', winnerId);
    await loadAdminData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-400" /> Admin Command Engine
          </h1>
          <p className="text-sm text-slate-400">Complete control across draw simulations, winner audits, and charity ledgers.</p>
        </header>

        {/* 05: Reports & Analytics (§ 11) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-xs text-slate-400 uppercase font-mono">Total Platform Athletes</p>
            <p className="text-3xl font-black mt-2 text-white">{stats.users}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-xs text-slate-400 uppercase font-mono">Gross Prize Pools Awarded</p>
            <p className="text-3xl font-black mt-2 text-emerald-400">${stats.prizePool.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-xs text-slate-400 uppercase font-mono">Total Charitable Capital</p>
            <p className="text-3xl font-black mt-2 text-cyan-400">${stats.charityTotal.toFixed(2)}</p>
          </div>
        </section>

        {/* 02: Draw Engine & Simulation (§ 06, § 07, § 11) */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold">Monthly Draw Engine Operations</h2>
              <p className="text-xs text-slate-400">Simulate allocations before officially publishing winning tiers.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('random')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'random' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
              >
                Random Lottery
              </button>
              <button
                onClick={() => setMode('algorithmic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'algorithmic' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
              >
                Algorithmic Weighted
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleRunDraw(false)}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Run Simulation
            </button>
            <button
              onClick={() => handleRunDraw(true)}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Database className="w-4 h-4" /> Publish Live Draw
            </button>
          </div>

          {simulation && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-mono text-slate-400 uppercase">Simulated 5-Ball Outcome:</h3>
              <div className="flex gap-3">
                {simulation.winningNumbers.map((n: number) => (
                  <span key={n} className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
                    {n}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Tier 1 (5-Match / 40% + Rollover):</span>
                  <p className="text-base text-white font-bold">${simulation.pools.pool5.toFixed(2)} ({simulation.winnersCount.tier5} winners)</p>
                </div>
                <div>
                  <span className="text-slate-500">Tier 2 (4-Match / 35%):</span>
                  <p className="text-base text-white font-bold">${simulation.pools.pool4.toFixed(2)} ({simulation.winnersCount.tier4} winners)</p>
                </div>
                <div>
                  <span className="text-slate-500">Tier 3 (3-Match / 25%):</span>
                  <p className="text-base text-white font-bold">${simulation.pools.pool3.toFixed(2)} ({simulation.winnersCount.tier3} winners)</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 04: Winner Verification (§ 09, § 11) */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold">Winner Verification & Payout Queue</h2>
          {pendingVerifications.length === 0 ? (
            <p className="text-xs text-slate-400">No winning screenshot proofs currently awaiting review.</p>
          ) : (
            <div className="space-y-3">
              {pendingVerifications.map((item) => (
                <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-white">{item.profiles?.full_name}</p>
                    <p className="text-xs text-emerald-400">{item.match_tier} Tier — ${Number(item.prize_amount).toFixed(2)}</p>
                    {item.proof_screenshot_url && (
                      <a href={item.proof_screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 underline mt-1 block">
                        Inspect Uploaded Screenshot
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => verifyWinner(item.id, 'approved')}
                      className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => verifyWinner(item.id, 'rejected')}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => markPayout(item.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-lg"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}