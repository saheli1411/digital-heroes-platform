'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Internal helper to authenticate and assert administrator privilege (§ 03, § 11)
 */
async function assertAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Administrative access required.');
  }

  return { supabase, user };
}

/**
 * 01. User & Subscription Management (§ 11.1)
 * Fetch users with their subscription status, plan, and selected charity
 */
export async function getAdminUsers() {
  const { supabase } = await assertAdmin();

  const { data, error } = await supabase
    .from('profiles')
    .select('*, charities(id, name)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch platform users: ${error.message}`);
  }

  return data || [];
}

/**
 * 01. User & Subscription Management (§ 11.1)
 * Update a user's role or subscription status (active, lapsed, cancelled)
 */
export async function updateUserSubscription(
  userId: string,
  payload: {
    subscription_status?: 'active' | 'inactive' | 'lapsed' | 'cancelled';
    subscription_plan?: 'monthly' | 'yearly';
    role?: 'subscriber' | 'admin';
  }
) {
  const { supabase } = await assertAdmin();

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return data;
}

/**
 * 01. User & Subscription Management (§ 11.1)
 * Administrative override for editing or correcting a user's golf score
 */
export async function adminUpdateGolfScore(scoreId: string, newScore: number) {
  const { supabase } = await assertAdmin();

  if (newScore < 1 || newScore > 45) {
    throw new Error('Stableford score must be within 1–45 range.');
  }

  const { data, error } = await supabase
    .from('golf_scores')
    .update({ score: newScore })
    .eq('id', scoreId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update score: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return data;
}

/**
 * 04. Winner Verification & Payout Review (§ 09, § 11.4)
 * Fetch all winners awaiting review or with pending payout status
 */
export async function getPendingWinners() {
  const { supabase } = await assertAdmin();

  const { data, error } = await supabase
    .from('draw_winners')
    .select('*, profiles(full_name), draws(draw_date, winning_numbers)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load winners list: ${error.message}`);
  }

  return data || [];
}

/**
 * 04. Winner Verification (§ 09, § 11.4)
 * Approve or reject a winner's uploaded score proof
 */
export async function verifyWinnerProof(
  winnerId: string,
  verificationStatus: 'approved' | 'rejected'
) {
  const { supabase } = await assertAdmin();

  const { data, error } = await supabase
    .from('draw_winners')
    .update({ verification_status: verificationStatus })
    .eq('id', winnerId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update verification status: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return data;
}

/**
 * 04. Payout Management (§ 09, § 11.4)
 * Mark an approved winner's payout as completed (Pending -> Paid)
 */
export async function markWinnerPayoutCompleted(winnerId: string) {
  const { supabase } = await assertAdmin();

  // Verify that the entry has been approved first
  const { data: winner } = await supabase
    .from('draw_winners')
    .select('verification_status')
    .eq('id', winnerId)
    .single();

  if (winner?.verification_status !== 'approved') {
    throw new Error('Cannot complete payout before score proof is approved.');
  }

  const { data, error } = await supabase
    .from('draw_winners')
    .update({ payout_status: 'paid' })
    .eq('id', winnerId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update payout status: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return data;
}

/**
 * 05. Reports & Analytics Summary Engine (§ 11.5)
 * Aggregate real-time metrics across users, prize pools, and charitable distributions
 */
export async function getAdminPlatformMetrics() {
  const { supabase } = await assertAdmin();

  // 1. Total users and active subscribers
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: activeSubscribers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active');

  // 2. Prize pool and charity totals from draws
  const { data: draws } = await supabase
    .from('draws')
    .select('jackpot_pool, pool_4_match, pool_3_match, charity_pool')
    .eq('status', 'published');

  const totalPrizePoolAwarded =
    draws?.reduce(
      (sum, d) =>
        sum +
        (Number(d.jackpot_pool) || 0) +
        (Number(d.pool_4_match) || 0) +
        (Number(d.pool_3_match) || 0),
      0
    ) || 0;

  const totalCharityFromDraws =
    draws?.reduce((sum, d) => sum + (Number(d.charity_pool) || 0), 0) || 0;

  // 3. Direct independent donations
  const { data: charities } = await supabase
    .from('charities')
    .select('total_donations_received');

  const directCharityDonations =
    charities?.reduce(
      (sum, c) => sum + (Number(c.total_donations_received) || 0),
      0
    ) || 0;

  return {
    totalUsers: totalUsers || 0,
    activeSubscribers: activeSubscribers || 0,
    totalPrizePoolAwarded,
    totalCharityGenerated: totalCharityFromDraws + directCharityDonations,
    directCharityDonations,
    publishedDrawsCount: draws?.length || 0,
  };
}