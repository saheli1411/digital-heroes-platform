'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Check, ShieldCheck, HeartHandshake, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function SubscribePage() {
  const router = useRouter();
  const supabase = createClient();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [charityPercentage, setCharityPercentage] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available charities for selection (§ 08.1)
  useEffect(() => {
    async function loadCharities() {
      const { data, error } = await supabase.from('charities').select('id, name, description');
      if (data && data.length > 0) {
        setCharities(data);
        setSelectedCharityId(data[0].id);
      }
    }
    loadCharities();
  }, [supabase]);

  const monthlyPrice = 25;
  const yearlyPrice = 240; // $20/month equivalent (20% discount)

  const activePrice = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
  const monthlyEquivalent = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice / 12;
  const directCharityAmount = (activePrice * (charityPercentage / 100)).toFixed(2);

  const handleSubscribe = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // If not logged in, direct to login/signup modal or route
        router.push('/dashboard');
        return;
      }

      // Update subscriber's profile with active status, plan, and charity choices
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: billingCycle,
          charity_id: selectedCharityId,
          charity_percentage: charityPercentage,
          subscription_renewal_date: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 86400000).toISOString().split('T')[0],
        })
        .eq('id', user.id);

      if (error) throw error;

      // In production, integrate Stripe Checkout:
      // const res = await fetch('/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ billingCycle, charityId: selectedCharityId }) });
      // const { url } = await res.json();
      // window.location.href = url;

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Membership Access
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Choose Your <span className="text-emerald-400">Impact Plan</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Compete in monthly algorithmic prize pools while directing a portion of your subscription straight to a cause you believe in.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl items-center mt-6">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly Billing
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Breakdown & Impact Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Plan Card */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur relative overflow-hidden flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">Full Athlete Access</h3>
                  <p className="text-xs text-slate-400 mt-1">Complete draw eligibility & scorecard vault</p>
                </div>
                <span className="px-3 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
                  {billingCycle === 'monthly' ? 'Billed Monthly' : 'Billed Annually'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono text-white">${activePrice}</span>
                <span className="text-slate-400 text-sm font-mono">
                  / {billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
                {billingCycle === 'yearly' && (
                  <span className="text-xs text-emerald-400 font-medium ml-2">
                    (${monthlyEquivalent.toFixed(0)}/mo equivalent)
                  </span>
                )}
              </div>

              <ul className="space-y-3 pt-4 border-t border-slate-800 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>5-score rolling Stableford ledger (1–45)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Automatic entry into 3, 4, & 5-match prize tiers</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Eligible for rolling rollover jackpots</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Proof-verified payouts via secure portal</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cancel or adjust plans anytime from your dashboard.</span>
            </div>
          </div>

          {/* Charity & Contribution Allocation (§ 08.1) */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Direct Your Impact</h3>
                <p className="text-xs text-slate-400">Choose where your contribution goes</p>
              </div>
            </div>

            {/* Select Charity */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Select Cause Recipient
              </label>
              <select
                value={selectedCharityId}
                onChange={(e) => setSelectedCharityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Donation Percentage Slider (§ 08.1 - Minimum 10%) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Giving Proportion</span>
                <span className="text-emerald-400 font-bold">{charityPercentage}% (Min 10%)</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={charityPercentage}
                onChange={(e) => setCharityPercentage(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>10% Required</span>
                <span>Voluntary Max: 50%</span>
              </div>
            </div>

            {/* Real-time Giving Breakdown */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Membership Fee:</span>
                <span className="font-mono text-white font-medium">${activePrice}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Directly Donated to Cause:</span>
                <span className="font-mono text-emerald-400 font-bold">${directCharityAmount}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-400">Prize Pool Allocation:</span>
                <span className="font-mono text-cyan-400 font-medium">${(activePrice * 0.6).toFixed(2)}</span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                {errorMessage}
              </p>
            )}

            {/* Submit / Checkout Button */}
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Finalizing Enrollment...
                </>
              ) : (
                <>
                  Confirm Subscription <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}