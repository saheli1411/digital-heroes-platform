'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitScore, deleteScore } from '@/app/actions/scores';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Award, Calendar, CheckCircle2, Upload, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const supabase = createClient();
  const [scores, setScores] = useState<any[]>([]);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [date, setDate] = useState('');
  const [scoreVal, setScoreVal] = useState('');
  const [charityPercent, setCharityPercent] = useState(10);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // inside the component:
const router = useRouter();
const loadDashboardData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    router.push('/login'); // Redirect guests to login
    return;
  }
    const { data: prof } = await supabase.from('profiles').select('*, charities(name)').eq('id', user.id).single();
    setProfile(prof);
    if (prof?.charity_percentage) setCharityPercent(Number(prof.charity_percentage));

    const { data: sc } = await supabase.from('golf_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false });
    setScores(sc || []);

    const { data: win } = await supabase.from('draw_winners').select('*, draws(draw_date, winning_numbers)').eq('user_id', user.id);
    setWinnings(win || []);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');
    try {
      await submitScore(date, parseInt(scoreVal, 10));
      setStatusMsg('Score recorded! Oldest record automatically pruned if over 5.');
      setDate('');
      setScoreVal('');
      await loadDashboardData();
    } catch (err: any) {
      setStatusMsg(err.message || 'Error updating scorecard.');
    } finally {
      setLoading(false);
    }
  };

  const handleCharityUpdate = async (val: number) => {
    setCharityPercent(val);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ charity_percentage: val }).eq('id', user.id);
    }
  };

  const handleProofUpload = async (winnerId: string, file: File) => {
    const path = `proof_${winnerId}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadErr } = await supabase.storage.from('proofs').upload(path, file);
    if (uploadErr) return alert('Upload failed: ' + uploadErr.message);

    const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(path);
    await supabase.from('draw_winners').update({
      proof_screenshot_url: urlData.publicUrl,
      verification_status: 'under_review'
    }).eq('id', winnerId);

    alert('Score verification proof uploaded for admin review!');
    await loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header & Status Pill */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Athlete Performance Hub</h1>
            <p className="text-sm text-slate-400">Live draw eligibility, rolling scorecards, and charitable giving.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Status: {profile?.subscription_status || 'Active'}
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
              Renews: {profile?.subscription_renewal_date || 'In 30 days'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Score Entry & Rolling Log */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur">
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Log Stableford Score
              </h2>
              <p className="text-xs text-slate-400 mb-6">Enter official 1–45 score. Duplicate dates update existing records. Max 5 scores retained.</p>
              
              <form onSubmit={handleScoreSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Round Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Score (1–45)</label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    required
                    value={scoreVal}
                    onChange={(e) => setScoreVal(e.target.value)}
                    placeholder="e.g. 38"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? 'Saving...' : 'Enter Score'}
                  </button>
                </div>
              </form>
              {statusMsg && (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4" /> {statusMsg}
                </div>
              )}
            </section>

            {/* Current Active 5-Score Hand */}
            <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Current Active Draw Entry ({scores.length}/5)</h3>
                <span className="text-xs text-slate-500 font-mono">FIFO Queue</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[0, 1, 2, 3, 4].map((index) => {
                  const entry = scores[index];
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center min-h-[96px] ${
                        entry
                          ? 'bg-slate-900 border-slate-700 text-emerald-400'
                          : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                      }`}
                    >
                      {entry ? (
                        <>
                          <span className="text-2xl font-black font-mono">{entry.score}</span>
                          <span className="text-[10px] text-slate-400 mt-1">{entry.score_date}</span>
                          <button
                            onClick={async () => {
                              await deleteScore(entry.id);
                              await loadDashboardData();
                            }}
                            className="text-[10px] text-red-400 hover:underline mt-2"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <span className="text-xs">Empty Slot</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Charity Slider & Winnings Claim */}
          <div className="space-y-8">
            {/* Charity Split (§ 08.1) */}
            <section className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <h3 className="font-bold text-base mb-1">Charity Split Contribution</h3>
              <p className="text-xs text-slate-400 mb-4">Designated: <span className="text-emerald-400 font-medium">{profile?.charities?.name || 'Clean Water Horizons'}</span></p>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Giving Percentage</span>
                  <span className="text-emerald-400 font-bold">{charityPercent}% (Min 10%)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={charityPercent}
                  onChange={(e) => handleCharityUpdate(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Every monthly subscription automatically directs this proportion to your chosen cause.</p>
              </div>
            </section>

            {/* Winnings & Screenshot Verification (§ 09) */}
            <section className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Winnings & Proof Verification</h3>
              </div>
              {winnings.length === 0 ? (
                <p className="text-xs text-slate-400">No winnings logged yet. Keep your scorecard active for the next monthly draw!</p>
              ) : (
                <div className="space-y-4">
                  {winnings.map((win) => (
                    <div key={win.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-emerald-400">{win.match_tier.replace('_', ' ').toUpperCase()} WINNER</span>
                        <span>${Number(win.prize_amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Verification: <b className="text-white">{win.verification_status}</b></span>
                        <span>Payout: <b className="text-white">{win.payout_status}</b></span>
                      </div>
                      {win.verification_status === 'pending_upload' && (
                        <div className="pt-2">
                          <label className="flex items-center justify-center gap-2 w-full p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer text-slate-300">
                            <Upload className="w-3.5 h-3.5" /> Upload Golf App Screenshot
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleProofUpload(win.id, e.target.files[0])}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}