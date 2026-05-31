/**
 * Server-side purchase sync
 * Called from success.html after Stripe checkout completes.
 * Uses SUPABASE_SERVICE_KEY to bypass RLS and write to the DB.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY_LIVE
);

const SUPABASE_URL = 'https://xeuydbzqwapwqxmzkgup.supabase.co';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  // Require service key — if not set, return a soft error so UI can degrade gracefully
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    console.warn('[sync-purchase] SUPABASE_SERVICE_KEY not set — skipping DB write');
    return res.status(200).json({ success: false, reason: 'db_not_configured' });
  }

  const supabase = createClient(SUPABASE_URL, serviceKey);

  try {
    // Retrieve the Stripe session to verify payment and get metadata
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Session not paid' });
    }

    const clerkUserId = session.metadata?.clerk_user_id || null;
    const skillId = session.metadata?.skill_id || null;
    const mode = session.mode; // 'payment' or 'subscription'
    const amount = session.amount_total || 0;

    // Upsert purchase record (idempotent — safe to call multiple times)
    const { error: purchaseErr } = await supabase
      .from('purchases')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          skill_id: skillId,
          stripe_session_id: session_id,
          amount,
          status: 'completed',
          purchased_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'stripe_session_id' }
      );

    if (purchaseErr) {
      console.error('[sync-purchase] Purchase upsert error:', purchaseErr);
    }

    // For Pro subscriptions: mark user as active subscriber
    if (mode === 'subscription' && clerkUserId) {
      const { error: userErr } = await supabase
        .from('users')
        .upsert(
          {
            clerk_user_id: clerkUserId,
            subscription_status: 'active',
            stripe_subscription_id: session.subscription || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'clerk_user_id' }
        );

      if (userErr) {
        console.error('[sync-purchase] User subscription update error:', userErr);
      }
    }

    return res.status(200).json({ success: true, mode, skillId, clerkUserId });
  } catch (err) {
    console.error('[sync-purchase] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
