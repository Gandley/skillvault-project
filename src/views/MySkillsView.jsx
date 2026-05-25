import { useState, useEffect } from 'react';
import { useClerkAuth } from '../lib/auth';
import { getUserPurchases, hasVaultProSubscription } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Download, Lock, Zap, Crown, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function MySkillsView() {
  const { isSignedIn, user } = useClerkAuth();
  const { data, goRepo } = useApp();
  const [purchases, setPurchases] = useState([]);
  const [hasPro, setHasPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [userPurchases, proStatus] = await Promise.all([
          getUserPurchases(user.id),
          hasVaultProSubscription(user.id),
        ]);
        setPurchases(userPurchases);
        setHasPro(proStatus);
      } catch (err) {
        console.error('[MySkills] Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return (
      <div style={container}>
        <div style={emptyState}>
          <Lock size={48} color="var(--text-muted)" />
          <h2 style={emptyTitle}>Sign In Required</h2>
          <p style={emptyText}>Sign in to see your purchased skills.</p>
          <a href="/login.html?return_url=/" style={btnPrimary}>Sign In</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={container}>
        <div style={loadingWrap}>
          <div style={spinner} />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading your skills...</span>
        </div>
      </div>
    );
  }

  const completedPurchases = purchases.filter((p) => p.status === 'completed');

  return (
    <div style={container}>
      <div style={header}>
        <button onClick={goRepo} style={backLink}>
          <ArrowLeft size={16} />
          Back to Skills
        </button>
        <h1 style={title}>My Skills</h1>
        <p style={subtitle}>Skills you own and can access anytime.</p>
      </div>

      {hasPro && (
        <div style={proBanner}>
          <Crown size={20} color="var(--violet)" />
          <span>Vault Pro Active — All skills unlocked</span>
        </div>
      )}

      {completedPurchases.length === 0 && !hasPro ? (
        <div style={emptyState}>
          <Zap size={48} color="var(--text-muted)" />
          <h2 style={emptyTitle}>No Skills Yet</h2>
          <p style={emptyText}>You haven't purchased any skills yet. Browse the library and start building.</p>
          <button onClick={goRepo} style={btnPrimary}>Browse Skills</button>
        </div>
      ) : (
        <div style={grid}>
          {completedPurchases.map((purchase) => {
            const skill = getSkillById(purchase.skill_id);
            if (!skill) return null;
            const Icon = Icons[skill.icon] || Icons.Circle;

            return (
              <div key={purchase.id} style={card}>
                <div style={cardTop}>
                  <div style={{ ...iconBox, background: 'var(--green-bg)', borderColor: 'rgba(52,211,153,0.2)' }}>
                    <Icon size={20} color="var(--green)" />
                  </div>
                  <span style={ownedBadge}>Owned</span>
                </div>
                <h3 style={cardTitle}>{skill.name}</h3>
                <p style={cardDesc}>{skill.description}</p>
                <div style={cardMeta}>
                  <span style={metaText}>Purchased {new Date(purchase.purchased_at).toLocaleDateString()}</span>
                </div>
                <button style={downloadBtn} onClick={() => alert('Download starting...')}>
                  <Download size={14} />
                  Download
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

  // Helper to get skill info from ID
  function getSkillById(id) {
    return data.skills.find((s) => s.id === id) || null;
  }

const container = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '40px 24px',
  minHeight: '80vh',
};

const header = {
  marginBottom: 32,
};

const backLink = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: 'var(--text-muted)',
  fontSize: 14,
  textDecoration: 'none',
  marginBottom: 16,
  transition: 'color 0.2s',
};

const title = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(28px, 4vw, 40px)',
  fontWeight: 700,
  color: 'var(--text-primary)',
  lineHeight: 1.1,
  marginBottom: 8,
};

const subtitle = {
  fontSize: 16,
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};

const proBanner = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 20px',
  borderRadius: 12,
  background: 'rgba(167,139,250,0.1)',
  border: '1px solid rgba(167,139,250,0.2)',
  color: 'var(--violet)',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 24,
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 20,
};

const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const cardTop = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const iconBox = {
  width: 40,
  height: 40,
  borderRadius: 'var(--radius-md)',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ownedBadge = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '3px 10px',
  borderRadius: 100,
  background: 'var(--green-bg)',
  color: 'var(--green)',
};

const cardTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 18,
  fontWeight: 600,
  color: 'var(--text-primary)',
  lineHeight: 1.3,
};

const cardDesc = {
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--text-secondary)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const cardMeta = {
  marginTop: 'auto',
  paddingTop: 12,
  borderTop: '1px solid var(--border)',
};

const metaText = {
  fontSize: 12,
  color: 'var(--text-muted)',
};

const downloadBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid rgba(52,211,153,0.25)',
  background: 'var(--green-bg)',
  color: 'var(--green)',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  marginTop: 8,
};

const emptyState = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  padding: '80px 24px',
  textAlign: 'center',
};

const emptyTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const emptyText = {
  fontSize: 15,
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
  maxWidth: 400,
};

const btnPrimary = {
  display: 'inline-block',
  padding: '12px 24px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'all 0.2s',
  marginTop: 8,
};

const loadingWrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  padding: '80px 0',
};

const spinner = {
  width: 36,
  height: 36,
  border: '3px solid var(--border)',
  borderTopColor: 'var(--accent)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};
