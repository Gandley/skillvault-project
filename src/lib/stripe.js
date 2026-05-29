/**
 * Stripe Checkout integration for SkillVault
 * Server-side checkout sessions via API route
 */

import { recordPurchase } from './supabase';

const PRICE_SINGLE_SKILL = 'price_1TcHl30lnf05XgL9LuczOlix';
const PRICE_VAULT_PRO = 'price_1TcHl60lnf05XgL9bKFF5D8l';

export async function redirectToCheckout(priceId, metadata = {}) {
  const payload = {
    price_id: priceId,
    user_id: metadata.userId || null,
    skill_id: metadata.skillId || null,
    mode: metadata.mode || 'payment',
    success_path: metadata.successPath || '/',
  };

  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Checkout creation failed');
  }

  const { url, session_id } = await res.json();
  if (url) {
    // Record pending purchase in Supabase with actual Stripe session ID
    if (metadata.userId) {
      recordPurchase({
        userId: metadata.userId,
        skillId: metadata.skillId || null,
        stripeSessionId: session_id || 'unknown',
        amount: metadata.mode === 'subscription' ? 2700 : 900,
        status: 'pending',
      }).catch((err) => {
        console.error('[Stripe] Failed to record purchase:', err);
      });
    }
    window.location.href = url;
  } else {
    throw new Error('No checkout URL returned');
  }
}

export function buySingleSkill(skillId, userId) {
  return redirectToCheckout(PRICE_SINGLE_SKILL, {
    skillId,
    userId,
    mode: 'payment',
    successPath: `/skill-detail?skill=${skillId}`,
  });
}

export function subscribeVaultPro(userId, skillId = null) {
  return redirectToCheckout(PRICE_VAULT_PRO, {
    userId,
    mode: 'subscription',
    successPath: skillId ? `/skill-detail?skill=${skillId}` : '/',
  });
}

export { PRICE_SINGLE_SKILL, PRICE_VAULT_PRO };
