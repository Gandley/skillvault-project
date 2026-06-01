/**
 * Creates a Stripe Customer Portal session for subscription management.
 * POST /api/billing-portal { clerk_user_id, return_url }
 */

import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY_LIVE
);

const SUPABASE_URL = 'https://xeuydbzqwapwqxmzkgup.supabase.co';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const { clerk_user_id, return_url } = req.body;

  if (!clerk_user_id) return res.status(400).json({ error: 'Missing clerk_user_id' });

  try {
    // Find a completed Stripe session for this user to get the customer ID
    const purchaseRes = await fetch(
      `${SUPABASE_URL}/rest/v1/purchases?clerk_user_id=eq.${encodeURIComponent(clerk_user_id)}&status=eq.completed&select=stripe_session_id&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );
    const purchases = await purchaseRes.json();

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ error: 'No purchases found for this user' });
    }

    // Retrieve Stripe session to get customer ID
    const session = await stripe.checkout.sessions.retrieve(purchases[0].stripe_session_id);
    const customerId = session.customer;

    if (!customerId) {
      return res.status(404).json({ error: 'No Stripe customer ID found' });
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || 'https://vaultofskills.com',
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('[billing-portal] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
