/**
 * Creates a Stripe Customer Portal session for subscription management.
 * POST /api/billing-portal { clerk_user_id, return_url }
 *
 * Strategy for finding the Stripe customer ID:
 *   1. Check users table for stripe_customer_id (populated after first sync post-deploy)
 *   2. Scan purchases table for stripe_session_id entries and retrieve customer from Stripe
 *   3. If found via #2, back-fill users table so next call uses #1
 */

import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY_TEST
);

const SUPABASE_URL = 'https://xeuydbzqwapwqxmzkgup.supabase.co';

async function sbGet(path, query, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}?${query}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  return res.json();
}

async function sbPatch(path, query, body, serviceKey) {
  await fetch(`${SUPABASE_URL}/rest/v1/${path}?${query}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { clerk_user_id, return_url } = req.body;
  if (!clerk_user_id) {
    return res.status(400).json({ error: 'Missing clerk_user_id' });
  }

  const returnUrl = return_url || 'https://vaultofskills.com';

  try {
    let customerId = null;

    // ── Strategy 1: users table stripe_customer_id ──────────────────────────
    try {
      const users = await sbGet(
        'users',
        `clerk_user_id=eq.${encodeURIComponent(clerk_user_id)}&select=stripe_customer_id`,
        serviceKey
      );
      if (Array.isArray(users) && users[0]?.stripe_customer_id) {
        customerId = users[0].stripe_customer_id;
        console.log('[billing-portal] Found customer via users table:', customerId);
      }
    } catch (err) {
      console.warn('[billing-portal] users table lookup failed:', err.message);
    }

    // ── Strategy 2: scan purchases → retrieve Stripe session ─────────────────
    if (!customerId) {
      const purchases = await sbGet(
        'purchases',
        `clerk_user_id=eq.${encodeURIComponent(clerk_user_id)}&status=eq.completed&order=purchased_at.desc&select=stripe_session_id`,
        serviceKey
      );

      if (!Array.isArray(purchases) || purchases.length === 0) {
        return res.status(404).json({
          error: 'No completed purchases found. Make sure your subscription has been processed.',
        });
      }

      // Try each session until we find one with a customer
      for (const p of purchases) {
        if (!p.stripe_session_id || p.stripe_session_id === 'unknown') continue;
        try {
          const session = await stripe.checkout.sessions.retrieve(p.stripe_session_id);
          const cid = typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id || null;
          if (cid) {
            customerId = cid;
            console.log('[billing-portal] Found customer via session:', customerId);
            break;
          }
        } catch (err) {
          console.warn('[billing-portal] Session retrieve failed:', p.stripe_session_id, err.message);
        }
      }
    }

    if (!customerId) {
      return res.status(404).json({
        error: 'Could not locate your Stripe customer record. Please contact support@vaultofskills.com.',
      });
    }

    // ── Back-fill users table so strategy 1 works next time ──────────────────
    sbPatch(
      'users',
      `clerk_user_id=eq.${encodeURIComponent(clerk_user_id)}`,
      { stripe_customer_id: customerId, updated_at: new Date().toISOString() },
      serviceKey
    ).catch(() => {}); // best-effort, don't block

    // ── Create billing portal session ─────────────────────────────────────────
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('[billing-portal] Error:', err.message);

    // Surface useful hints for known Stripe errors
    if (err.message?.includes('No configuration')) {
      return res.status(500).json({
        error: 'Stripe billing portal is not configured. Visit https://dashboard.stripe.com/settings/billing/portal to set it up.',
      });
    }

    return res.status(500).json({ error: err.message });
  }
}
