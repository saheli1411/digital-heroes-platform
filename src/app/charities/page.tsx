'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Heart, Calendar } from 'lucide-react';

export default function CharitiesPage() {
  const supabase = createClient();
  const [charities, setCharities] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('charities').select('*').then(({ data }) => setCharities(data || []));
  }, []);

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black">Registered Charity Causes</h1>
          <p className="text-slate-400 mt-1">Discover verified causes backed directly by subscriber participation.</p>
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search verified partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.description}</p>
              </div>

              {item.events?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Next Event: {item.events[0].title} ({item.events[0].date})
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}