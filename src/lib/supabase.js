/**
 * Supabase client for SkillVault
 * Used for: purchase tracking, user data, subscription status
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xeuydbzqwapwqxmzkgup.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DAtZ1BPeDnAadseLI50S0w_1iflbK7M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Record a purchase in the database
 */
export async function recordPurchase({ userId, skillId, stripeSessionId, amount, status = 'pending' }) {
  const { data, error } = await supabase
    .from('purchases')
    .insert([
      {
        clerk_user_id: userId,
        skill_id: skillId,
        stripe_session_id: stripeSessionId,
        amount,
        status,
        purchased_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all purchases for a user
 */
export async function getUserPurchases(userId) {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('purchased_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Check if user has purchased a specific skill
 */
export async function hasUserPurchasedSkill(userId, skillId) {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('clerk_user_id', userId)
    .eq('skill_id', skillId)
    .eq('status', 'completed')
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Update purchase status (called from webhook or success page)
 */
export async function updatePurchaseStatus(stripeSessionId, status) {
  const { data, error } = await supabase
    .from('purchases')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_session_id', stripeSessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upsert user profile
 */
export async function upsertUserProfile({ userId, email, name, avatarUrl, subscriptionStatus = 'none' }) {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_user_id: userId,
        email,
        name,
        avatar_url: avatarUrl,
        subscription_status: subscriptionStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Check if user has active Vault Pro subscription
 */
export async function hasVaultProSubscription(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.subscription_status === 'active';
}

/**
 * Record a skill download
 */
export async function recordDownload({ userId, skillId }) {
  const { data, error } = await supabase
    .from('downloads')
    .insert([
      {
        clerk_user_id: userId,
        skill_id: skillId,
        downloaded_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
