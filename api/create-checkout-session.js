import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { price_id, skill_id, user_id, mode = 'payment', success_path = '/' } = req.body;

    if (!price_id) {
      return res.status(400).json({ error: 'Missing price_id' });
    }

    const metadata = {};
    if (user_id) metadata.clerk_user_id = user_id;
    if (skill_id) metadata.skill_id = skill_id;

    const session = await stripe.checkout.sessions.create({
      mode: mode === 'subscription' ? 'subscription' : 'payment',
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${req.headers.origin || 'https://skillvault-project-nu.vercel.app'}/success.html?session_id={CHECKOUT_SESSION_ID}&skill_id=${skill_id || ''}&redirect=${encodeURIComponent(success_path)}`,
      cancel_url: `${req.headers.origin || 'https://skillvault-project-nu.vercel.app'}/cancel.html?skill_id=${skill_id || ''}&redirect=${encodeURIComponent(success_path)}`,
    });

    return res.status(200).json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
