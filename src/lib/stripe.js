/**
 * Stripe Checkout integration for SkillVault
 * Loads Stripe.js SDK and redirects to Checkout sessions
 */

const STRIPE_PK = 'pk_live_7r4zn5DDO3LOT6odQTm3WHqi';
const PRICE_SINGLE_SKILL = 'price_1Ta4flIOVif6Dy1OEVfhQD15';
const PRICE_VAULT_PRO = 'price_1Ta4g4IOVif6Dy1O2MJynjMz';

let stripePromise = null;

function getStripe() {
  if (!stripePromise) {
    if (!window.Stripe) {
      return Promise.reject(new Error('Stripe.js not loaded'));
    }
    stripePromise = Promise.resolve(window.Stripe(STRIPE_PK));
  }
  return stripePromise;
}

export async function redirectToCheckout(priceId, metadata = {}) {
  const stripe = await getStripe();

  const payload = {
    price_id: priceId,
    user_id: metadata.userId || null,
    skill_id: metadata.skillId || null,
    mode: metadata.mode || 'payment',
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

  const { url } = await res.json();
  if (url) {
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
  });
}

export function subscribeVaultPro(userId) {
  return redirectToCheckout(PRICE_VAULT_PRO, {
    userId,
    mode: 'subscription',
  });
}

export { PRICE_SINGLE_SKILL, PRICE_VAULT_PRO };
