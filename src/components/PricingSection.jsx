import { Check, Zap, Crown, Gift } from 'lucide-react';
import { useClerkAuth } from '../lib/auth';
import { buySingleSkill, subscribeVaultPro } from '../lib/stripe';

export default function PricingSection() {
  const { isSignedIn, user, signInRedirect } = useClerkAuth();

  const handleFree = () => {
    signInRedirect(window.location.pathname + window.location.search);
  };

  const handlePaid = async () => {
    if (!isSignedIn || !user) {
      signInRedirect(window.location.pathname + window.location.search);
      return;
    }
    try {
      await buySingleSkill(null, user.id);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  const handlePro = async () => {
    if (!isSignedIn || !user) {
      signInRedirect(window.location.pathname + window.location.search);
      return;
    }
    try {
      await subscribeVaultPro(user.id);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div style={section}>
      <style>{`
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 960px) { .pricing-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div style={header}>
        <span style={badge}><Gift size={14} /> Flexible Pricing</span>
        <h2 style={title}>Choose Your Access Level</h2>
        <p style={subtitle}>Start free, scale as you grow. Every skill is built for production.</p>
      </div>

      <div className="pricing-grid">
        {/* Free */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={{ ...iconWrap, background: 'var(--green-bg)', color: 'var(--green)' }}>
              <Gift size={22} />
            </div>
            <h3 style={cardTitle}>Free</h3>
            <p style={cardDesc}>Get started with core skills — requires account.</p>
          </div>
          <div style={priceWrap}>
            <span style={price}>$0</span>
            <span style={priceNote}> forever</span>
          </div>
          <ul style={featureList}>
            {[
              '12 free skills',
              'Account required for download',
              'Community support',
              'Basic documentation',
            ].map((f) => (
              <li key={f} style={featureItem}>
                <Check size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                <span style={featureText}>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={handleFree} style={{ ...btn, background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
            Get Started Free
          </button>
        </div>

        {/* Pay Per Skill */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={{ ...iconWrap, background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              <Zap size={22} />
            </div>
            <h3 style={cardTitle}>Pay-Per-Skill</h3>
            <p style={cardDesc}>Buy only what you need. Full ownership, one-time fee.</p>
          </div>
          <div style={priceWrap}>
            <span style={price}>$9</span>
            <span style={priceNote}> per skill</span>
          </div>
          <ul style={featureList}>
            {[
              '12 premium skills available',
              'One-time purchase, lifetime access',
              'Requires account',
              'Email + chat support',
            ].map((f) => (
              <li key={f} style={featureItem}>
                <Check size={16} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                <span style={featureText}>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={handlePaid} style={{ ...btn, background: 'var(--amber-bg)', color: 'var(--amber)', borderColor: 'rgba(245,158,11,0.3)' }}>
            Browse Skills
          </button>
        </div>

        {/* Pro — Recommended */}
        <div style={{ ...card, ...recommendedCard }}>
          <div style={recommendedBadge}>Recommended</div>
          <div style={cardHeader}>
            <div style={{ ...iconWrap, background: 'rgba(167,139,250,0.18)', color: 'var(--violet)' }}>
              <Crown size={22} />
            </div>
            <h3 style={{ ...cardTitle, color: 'var(--violet)' }}>Vault Pro</h3>
            <p style={cardDesc}>Unlimited access to everything — present and future.</p>
          </div>
          <div style={priceWrap}>
            <span style={{ ...price, color: 'var(--violet)' }}>$27</span>
            <span style={priceNote}>/month</span>
          </div>
          <ul style={featureList}>
            {[
              'All 37 skills + future additions',
              'New skills added monthly',
              'Priority support',
              'Advanced documentation & examples',
              'Early access to beta features',
            ].map((f) => (
              <li key={f} style={featureItem}>
                <Check size={16} style={{ color: 'var(--violet)', flexShrink: 0 }} />
                <span style={featureText}>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={handlePro} style={{ ...btn, background: 'var(--violet)', color: '#0b0c10', borderColor: 'var(--violet)', fontWeight: 700 }}>
            Go Pro
          </button>
        </div>
      </div>
    </div>
  );
}

const section = { maxWidth: 1280, margin: '0 auto', padding: '60px 24px 40px' };

const header = { textAlign: 'center', marginBottom: 40 };

const badge = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 14px', borderRadius: 100,
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
  marginBottom: 16,
};

const title = { fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 10 };

const subtitle = { fontSize: 16, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto', lineHeight: 1.5 };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 };

const card = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
  padding: '28px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', transition: 'all 0.25s',
};

const recommendedCard = {
  borderColor: 'rgba(167,139,250,0.25)',
  boxShadow: '0 0 0 1px rgba(167,139,250,0.08), 0 8px 32px rgba(0,0,0,0.35)',
  background: 'linear-gradient(180deg, #1e2030 0%, #1a1c24 100%)',
};

const recommendedBadge = {
  position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
  background: 'var(--violet)', color: '#0b0c10', fontSize: 12, fontWeight: 700,
  padding: '5px 16px', borderRadius: '0 0 12px 12px', textTransform: 'uppercase', letterSpacing: '0.04em',
};

const cardHeader = { display: 'flex', flexDirection: 'column', gap: 10 };

const iconWrap = {
  width: 48, height: 48, borderRadius: 'var(--radius-md)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const cardTitle = { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' };

const cardDesc = { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 };

const priceWrap = { display: 'flex', alignItems: 'baseline', gap: 6 };

const price = { fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 };

const priceNote = { fontSize: 15, color: 'var(--text-muted)', fontWeight: 500 };

const featureList = { display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', padding: 0, margin: 0, flex: 1 };

const featureItem = { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4 };

const featureText = { paddingTop: 1 };

const btn = {
  display: 'block', width: '100%', textAlign: 'center', padding: '12px 20px', borderRadius: 'var(--radius-md)',
  border: '1px solid', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)',
  textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s', background: 'none', color: 'inherit',
};
