/**
 * Server-side purchase sync — uses Supabase REST API directly (no JS client)
 * Called from success.html after Stripe checkout completes.
 */

import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY_LIVE
);

const SUPABASE_URL = 'https://xeuydbzqwapwqxmzkgup.supabase.co';

async function supabasePost(path, body, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function supabasePatch(path, query, body, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}?${query}`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function supabaseGet(path, query, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}?${query}`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    console.warn('[sync-purchase] SUPABASE_SERVICE_KEY not set');
    return res.status(200).json({ success: false, reason: 'db_not_configured' });
  }

  try {
    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Session not paid' });
    }

    const clerkUserId = session.metadata?.clerk_user_id || null;
    const skillId = session.metadata?.skill_id || null;
    const mode = session.mode;
    const amount = session.amount_total || 0;
    const now = new Date().toISOString();

    // Check if this session was already synced
    const existing = await supabaseGet(
      'purchases',
      `stripe_session_id=eq.${encodeURIComponent(session_id)}&select=id`,
      serviceKey
    );

    if (existing && existing.length > 0) {
      // Already synced — just update status to completed
      await supabasePatch(
        'purchases',
        `stripe_session_id=eq.${encodeURIComponent(session_id)}`,
        { status: 'completed', updated_at: now },
        serviceKey
      );
    } else {
      // Fresh insert
      await supabasePost('purchases', {
        clerk_user_id: clerkUserId,
        skill_id: skillId,
        stripe_session_id: session_id,
        amount,
        status: 'completed',
        purchased_at: now,
        updated_at: now,
      }, serviceKey);
    }

    // For Pro subscriptions — update or create user record
    if (mode === 'subscription' && clerkUserId) {
      // Grab the Stripe customer ID from the session so billing portal works later
      const stripeCustomerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || null;

      const existingUser = await supabaseGet(
        'users',
        `clerk_user_id=eq.${encodeURIComponent(clerkUserId)}&select=clerk_user_id`,
        serviceKey
      );

      const userPayload = {
        subscription_status: 'active',
        updated_at: now,
        ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
      };

      if (existingUser && existingUser.length > 0) {
        await supabasePatch(
          'users',
          `clerk_user_id=eq.${encodeURIComponent(clerkUserId)}`,
          userPayload,
          serviceKey
        );
      } else {
        await supabasePost('users', {
          clerk_user_id: clerkUserId,
          ...userPayload,
        }, serviceKey);
      }
    }

    return res.status(200).json({ success: true, mode, skillId, clerkUserId });
  } catch (err) {
    console.error('[sync-purchase] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
