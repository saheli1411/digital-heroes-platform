'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CharityPayload {
  name: string;
  description: string;
  logo_url?: string;
  featured?: boolean;
  events?: Array<{ title: string; date: string; description?: string }>;
}

/**
 * Fetch all listed charities with optional keyword filtering and spotlight priority (§ 08.2)
 */
export async function getCharities(searchTerm?: string) {
  const supabase = await createServerSupabase();

  let query = supabase
    .from('charities')
    .select('*')
    .order('featured', { ascending: false })
    .order('name', { ascending: true });

  if (searchTerm && searchTerm.trim() !== '') {
    query = query.ilike('name', `%${searchTerm.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load charities: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch featured spotlight charities for the homepage showcase (§ 08.2)
 */
export async function getFeaturedCharities() {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load featured charities: ${error.message}`);
  }

  return data || [];
}

/**
 * Process an independent donation not tied to subscription or gameplay (§ 08.1)
 */
export async function processIndependentDonation(charityId: string, amount: number) {
  if (amount <= 0) {
    throw new Error('Donation amount must be greater than zero.');
  }

  const supabase = await createServerSupabase();

  // Fetch current donation sum
  const { data: charity, error: fetchError } = await supabase
    .from('charities')
    .select('total_donations_received')
    .eq('id', charityId)
    .single();

  if (fetchError || !charity) {
    throw new Error('Charity not found.');
  }

  const newTotal = (Number(charity.total_donations_received) || 0) + Number(amount);

  const { error: updateError } = await supabase
    .from('charities')
    .update({ total_donations_received: newTotal })
    .eq('id', charityId);

  if (updateError) {
    throw new Error(`Failed to process donation: ${updateError.message}`);
  }

  revalidatePath('/charities');
  revalidatePath('/dashboard');
  return { success: true, newTotal };
}

/**
 * Admin: Add a new charity to the directory (§ 11)
 */
export async function createCharity(payload: CharityPayload) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify Admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Administrative access required.');
  }

  const { data, error } = await supabase
    .from('charities')
    .insert({
      name: payload.name,
      description: payload.description,
      logo_url: payload.logo_url || null,
      featured: payload.featured ?? false,
      events: payload.events || [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create charity: ${error.message}`);
  }

  revalidatePath('/charities');
  revalidatePath('/admin');
  return data;
}

/**
 * Admin: Update charity details, media, and upcoming events (§ 11)
 */
export async function updateCharity(charityId: string, payload: Partial<CharityPayload>) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Administrative access required.');
  }

  const { data, error } = await supabase
    .from('charities')
    .update(payload)
    .eq('id', charityId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update charity: ${error.message}`);
  }

  revalidatePath('/charities');
  revalidatePath('/admin');
  return data;
}

/**
 * Admin: Remove a charity listing (§ 11)
 */
export async function deleteCharity(charityId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Administrative access required.');
  }

  const { error } = await supabase
    .from('charities')
    .delete()
    .eq('id', charityId);

  if (error) {
    throw new Error(`Failed to delete charity: ${error.message}`);
  }

  revalidatePath('/charities');
  revalidatePath('/admin');
  return { success: true };
}