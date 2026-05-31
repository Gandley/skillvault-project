/**
 * Server-side access checker — bypasses Supabase RLS using service key.
 * GET /api/check-access?clerk_user_id=xxx&skill_id=xxx
 * Returns: { isPro, isOwned, purchases }
 */

const SUPABASE_URL = 'https://xeuydbzqwapwqxmzkgup.supabase.co';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    return res.status(200).json({ isPro: false, isOwned: false, purchases: [] });
  }

  const { clerk_user_id, skill_id } = req.query;
  if (!clerk_user_id) {
    return res.status(400).json({ error: 'Missing clerk_user_id' });
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  try {
    // Check Pro subscription
    const userRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?clerk_user_id=eq.${encodeURIComponent(clerk_user_id)}&select=subscription_status`,
      { headers }
    );
    const userData = await userRes.json();
    const isPro = userData?.[0]?.subscription_status === 'active';

    // Check individual skill ownership (if skill_id provided)
    let isOwned = false;
    if (skill_id) {
      const purchaseRes = await fetch(
        `${SUPABASE_URL}/rest/v1/purchases?clerk_user_id=eq.${encodeURIComponent(clerk_user_id)}&skill_id=eq.${encodeURIComponent(skill_id)}&status=eq.completed&select=id`,
        { headers }
      );
      const purchaseData = await purchaseRes.json();
      isOwned = Array.isArray(purchaseData) && purchaseData.length > 0;
    }

    // Get all purchases for My Skills view
    const allPurchasesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/purchases?clerk_user_id=eq.${encodeURIComponent(clerk_user_id)}&status=eq.completed&order=purchased_at.desc`,
      { headers }
    );
    const purchases = await allPurchasesRes.json();

    return res.status(200).json({
      isPro,
      isOwned,
      purchases: Array.isArray(purchases) ? purchases : [],
    });
  } catch (err) {
    console.error('[check-access] Error:', err.message);
    return res.status(500).json({ error: err.message, isPro: false, isOwned: false, purchases: [] });
  }
}
