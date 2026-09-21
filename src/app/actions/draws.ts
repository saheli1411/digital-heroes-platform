'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function executeDrawEngine(mode: 'random' | 'algorithmic', isPublish: boolean = false) {
  const supabase = await createServerSupabase();

  // 1. Fetch unallocated rollover jackpot from prior published draws
  const { data: lastDraw } = await supabase
    .from('draws')
    .select('id, jackpot_pool')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let rolloverAmount = 0;
  if (lastDraw) {
    const { count: fiveTierWinners } = await supabase
      .from('draw_winners')
      .select('id', { count: 'exact' })
      .eq('draw_id', lastDraw.id)
      .eq('match_tier', '5_match');

    if (fiveTierWinners === 0) {
      rolloverAmount = Number(lastDraw.jackpot_pool) || 0;
    }
  }

  // 2. Generate 5 Winning Numbers (1 to 45)
  let winningNumbers: number[] = [];
  if (mode === 'random') {
    const set = new Set<number>();
    while (set.size < 5) set.add(Math.floor(Math.random() * 45) + 1);
    winningNumbers = Array.from(set).sort((a, b) => a - b);
  } else {
    // Algorithmic: Weighted by real user score frequencies
    const { data: allScores } = await supabase.from('golf_scores').select('score');
    const freq: Record<number, number> = {};
    allScores?.forEach((s) => (freq[s.score] = (freq[s.score] || 0) + 1));

    const sortedByFreq = Object.keys(freq)
      .map(Number)
      .sort((a, b) => freq[b] - freq[a]);

    winningNumbers = sortedByFreq.slice(0, 5);
    while (winningNumbers.length < 5) {
      const candidate = Math.floor(Math.random() * 45) + 1;
      if (!winningNumbers.includes(candidate)) winningNumbers.push(candidate);
    }
    winningNumbers.sort((a, b) => a - b);
  }

  // 3. Pool Calculations based on Active Subscribers (§ 07)
  const { count: activeCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('subscription_status', 'active');

  const subscribers = Math.max(activeCount || 0, 25); // Benchmark baseline
  const pricePerSub = 25.0; // $25 standard tier
  const grossMonthly = subscribers * pricePerSub;

  const charityPool = grossMonthly * 0.10; // 10% minimum to charity
  const prizePool = grossMonthly * 0.60;   // 60% to rewards

  const pool5 = (prizePool * 0.40) + rolloverAmount;
  const pool4 = prizePool * 0.35;
  const pool3 = prizePool * 0.25;

  // 4. Identify Matching Subscribers
  const { data: userScores } = await supabase
    .from('golf_scores')
    .select('user_id, score');

  const scorecardMap: Record<string, number[]> = {};
  userScores?.forEach((entry) => {
    if (!scorecardMap[entry.user_id]) scorecardMap[entry.user_id] = [];
    scorecardMap[entry.user_id].push(entry.score);
  });

  const winners = {
    tier5: [] as string[],
    tier4: [] as string[],
    tier3: [] as string[],
  };

  Object.entries(scorecardMap).forEach(([uid, scores]) => {
    const hits = scores.filter((val) => winningNumbers.includes(val)).length;
    if (hits === 5) winners.tier5.push(uid);
    else if (hits === 4) winners.tier4.push(uid);
    else if (hits === 3) winners.tier3.push(uid);
  });

  // 5. Persist if Admin triggers "Publish"
  if (isPublish) {
    const { data: insertedDraw, error: drawError } = await supabase
      .from('draws')
      .insert({
        draw_type: mode,
        winning_numbers: winningNumbers,
        jackpot_pool: pool5,
        pool_4_match: pool4,
        pool_3_match: pool3,
        charity_pool: charityPool,
        status: 'published',
      })
      .select()
      .single();

    if (drawError) throw new Error(drawError.message);

    const winnerInserts = [
      ...winners.tier5.map((uid) => ({
        draw_id: insertedDraw.id,
        user_id: uid,
        match_tier: '5_match',
        prize_amount: pool5 / (winners.tier5.length || 1),
      })),
      ...winners.tier4.map((uid) => ({
        draw_id: insertedDraw.id,
        user_id: uid,
        match_tier: '4_match',
        prize_amount: pool4 / (winners.tier4.length || 1),
      })),
      ...winners.tier3.map((uid) => ({
        draw_id: insertedDraw.id,
        user_id: uid,
        match_tier: '3_match',
        prize_amount: pool3 / (winners.tier3.length || 1),
      })),
    ];

    if (winnerInserts.length > 0) {
      await supabase.from('draw_winners').insert(winnerInserts);
    }
    revalidatePath('/admin');
    revalidatePath('/dashboard');
  }

  return {
    winningNumbers,
    pools: { pool5, pool4, pool3, charityPool, rolloverApplied: rolloverAmount },
    winnersCount: {
      tier5: winners.tier5.length,
      tier4: winners.tier4.length,
      tier3: winners.tier3.length,
    },
  };
}