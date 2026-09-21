'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitScore(scoreDate: string, score: number) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('You must be signed in to log scores.');
  if (score < 1 || score > 45) throw new Error('Stableford score must be between 1 and 45.');

  // 1. Check if user has an active subscription (§ 04)
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_status !== 'active') {
    throw new Error('An active subscription is required to submit scores to the draw pool.');
  }

  // 2. Upsert score (handles "one score per date" constraint)
  const { error: upsertError } = await supabase
    .from('golf_scores')
    .upsert(
      { user_id: user.id, score_date: scoreDate, score },
      { onConflict: 'user_id,score_date' }
    );

  if (upsertError) throw new Error(upsertError.message);

  // 3. FIFO Rolling logic: Fetch scores descending by date
  const { data: userScores } = await supabase
    .from('golf_scores')
    .select('id')
    .eq('user_id', user.id)
    .order('score_date', { ascending: false });

  // 4. Retain only latest 5, delete older records
  if (userScores && userScores.length > 5) {
    const overflowIds = userScores.slice(5).map((entry) => entry.id);
    await supabase.from('golf_scores').delete().in('id', overflowIds);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteScore(scoreId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await supabase.from('golf_scores').delete().match({ id: scoreId, user_id: user.id });
  revalidatePath('/dashboard');
  return { success: true };
}