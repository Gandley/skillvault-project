export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { skillName, userEmail, description } = req.body;

  if (!skillName || !userEmail || !description) {
    return res.status(400).json({ error: 'Missing required fields: skillName, userEmail, description' });
  }

  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) {
    console.error('[BugReport] AGENTMAIL_API_KEY not configured');
    return res.status(500).json({ error: 'Bug reporting is not configured' });
  }

  const emailBody = `BUG REPORT — SkillVault
========================

Skill Name:   ${skillName}
User Email:   ${userEmail}
Submitted At: ${new Date().toISOString()}

--- Issue Description ---

${description}

========================
Source: SkillVault Bug Report System
`;

  try {
    const response = await fetch(
      'https://api.agentmail.to/v0/inboxes/skillvault@agentmail.to/messages/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          to: ['skillvault@agentmail.to'],
          subject: `Bug Report: ${skillName}`,
          text: emailBody,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[BugReport] AgentMail API error:', err);
      return res.status(502).json({ error: 'Failed to send bug report' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[BugReport] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
