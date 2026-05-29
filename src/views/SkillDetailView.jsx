import { useApp } from '../context/AppContext';
import { useClerkAuth } from '../lib/auth';
import { buySingleSkill, subscribeVaultPro } from '../lib/stripe';
import { recordDownload } from '../lib/supabase';
import BugReportModal from '../components/BugReportModal';
import * as Icons from 'lucide-react';
import { ArrowLeft, Star, Download, Zap, Lock, Gift, CheckCircle, Calendar, User, Tag, Bug } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SkillDetailView() {
  const { selectedSkill, goRepo, data } = useApp();
  const { isSignedIn, user, signInRedirect } = useClerkAuth();
  const [isOwned, setIsOwned] = useState(false);
  const [hasPro, setHasPro] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showBugModal, setShowBugModal] = useState(false);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  // Load skill from URL param if context doesn't have it (e.g. after Stripe redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const urlSkillId = urlParams.get('skill');
  const justPurchased = urlParams.get('downloaded') === '1';

  const skill = selectedSkill || (urlSkillId ? data.skills.find((s) => s.id === urlSkillId) : null);
  if (!skill) return null;

  const Icon = Icons[skill.icon] || Icons.Circle;
  const colorMap = {
    cyan: { bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.2)', text: '#22d3ee' },
    violet: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', text: '#a78bfa' },
    amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
    rose: { bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', text: '#f43f5e' },
    green: { bg: 'var(--green-bg)', border: 'rgba(52,211,153,0.2)', text: 'var(--green)' },
  };
  const theme = colorMap[skill.color] || colorMap.cyan;

  const tierMap = {
    free: { label: 'Free', bg: 'var(--green-bg)', color: 'var(--green)', border: 'rgba(52,211,153,0.2)' },
    paid: { label: '$9 or Pro', bg: 'var(--amber-bg)', color: 'var(--amber)', border: 'rgba(245,158,11,0.2)' },
    pro: { label: 'Pro', bg: 'rgba(167,139,250,0.12)', color: 'var(--violet)', border: 'rgba(167,139,250,0.2)' },
  };
  const tier = tierMap[skill.tier] || tierMap.free;

  // Check ownership on mount
  useEffect(() => {
    if (!isSignedIn || !user) {
      setChecking(false);
      return;
    }
    async function check() {
      try {
        const pro = await hasVaultProSubscription(user.id);
        setHasPro(pro);
        if (pro) { setIsOwned(true); setChecking(false); return; }
        if (skill.tier === 'paid') {
          const owned = await hasUserPurchasedSkill(user.id, skill.id);
          setIsOwned(owned);
        }
      } catch (err) {
        console.error('[SkillDetail] Ownership check failed:', err);
      } finally {
        setChecking(false);
      }
    }
    check();
  }, [isSignedIn, user, skill.id, skill.tier]);

  // Auto-download after successful purchase redirect
  useEffect(() => {
    if (justPurchased && !autoDownloaded && !checking) {
      // Just purchased — trust Stripe's confirmation and trigger download
      setAutoDownloaded(true);
      const link = document.createElement('a');
      link.href = `/skills/${skill.id}.zip`;
      link.download = `${skill.id}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (user) {
        recordDownload({ userId: user.id, skillId: skill.id }).catch((err) => {
          console.error('[SkillDetail] Failed to record download:', err);
        });
      }
      // Clean URL so refresh doesn't re-trigger
      const url = new URL(window.location.href);
      url.searchParams.delete('downloaded');
      window.history.replaceState({}, '', url);
    }
  }, [justPurchased, autoDownloaded, checking, skill.id, user]);

  const handleAction = async () => {
    if (!isSignedIn) {
      signInRedirect('/');
      return;
    }

    // If not owned and not free → payment required
    if (skill.tier !== 'free' && !isOwned && !hasPro) {
      try {
        if (skill.tier === 'paid') {
          await buySingleSkill(skill.id, user.id);
        } else if (skill.tier === 'pro') {
          await subscribeVaultPro(user.id, skill.id);
        }
      } catch (err) {
        console.error('Checkout error:', err);
        alert('Payment failed. Please try again.');
      }
      return;
    }

    // Free or owned → trigger real download
    const downloadUrl = `/skills/${skill.id}.zip`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${skill.id}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Record download in Supabase
    try {
      await recordDownload({ userId: user.id, skillId: skill.id });
    } catch (err) {
      console.error('[SkillDetail] Failed to record download:', err);
    }
  };

  const getButtonContent = () => {
    if (skill.tier !== 'free' && !isOwned && !hasPro) {
      if (skill.tier === 'paid') return ['Buy — $9 or Pro'];
      return ['Get Vault Pro'];
    }
    if (autoDownloaded) return ['Downloaded ✓'];
    return ['Download'];
  };

  return (
    <div style={page}>
      <nav style={nav}>
        <div style={navInner}>
          <button onClick={goRepo} style={backBtn}>
            <ArrowLeft size={18} /> Back to Skills
          </button>
          <div style={logoWrap}>
            <div style={logoIcon}>
              <Icon size={20} color="#fff" />
            </div>
            <span style={logoText}>SkillVault</span>
          </div>
        </div>
      </nav>

      <div style={content}>
        <div style={card}>
          <div style={header}>
            <div style={{ ...iconBox, background: theme.bg, borderColor: theme.border }}>
              <Icon size={32} color={theme.text} strokeWidth={2} />
            </div>
            <div style={headerText}>
              <div style={topRow}>
                <h1 style={title}>{skill.name}</h1>
                <span style={{ ...tierBadge, background: tier.bg, color: tier.color, borderColor: tier.border }}>
                  {skill.tier === 'free' && <Gift size={11} style={{ marginRight: 4 }} />}
                  {skill.tier === 'paid' && <Zap size={11} style={{ marginRight: 4 }} />}
                  {skill.tier === 'pro' && <Lock size={11} style={{ marginRight: 4 }} />}
                  {tier.label}
                </span>
              </div>
              <div style={metaRow}>
                <span style={meta}><Star size={14} fill="var(--amber)" color="var(--amber)" /> {skill.rating}</span>
                <span style={meta}><Download size={14} /> {skill.installs?.toLocaleString()} installs</span>
                <span style={meta}><Calendar size={14} /> v{skill.version}</span>
                <span style={meta}><User size={14} /> {skill.author}</span>
              </div>
            </div>
          </div>

          <div style={body}>
            <h2 style={sectionTitle}>About This Skill</h2>
            <p style={description}>{skill.description}</p>

            {skill.worksWith && skill.worksWith.length > 0 && (
              <>
                <h2 style={sectionTitle}>Works With</h2>
                <div style={tagsWrap}>
                  {skill.worksWith.map((p) => (
                    <span key={p} style={worksWithPillDetail}>{p}</span>
                  ))}
                </div>
              </>
            )}

            <h2 style={sectionTitle}>Tags</h2>
            <div style={tagsWrap}>
              {skill.tags.map((tag) => (
                <span key={tag} style={tagPill}><Tag size={12} /> {tag}</span>
              ))}
            </div>

            <h2 style={sectionTitle}>Status</h2>
            <div style={statusRow}>
              <span style={{ ...statusBadge, background: 'var(--green-bg)', color: 'var(--green)' }}>
                <CheckCircle size={12} /> {skill.status}
              </span>
            </div>
          </div>

          <div style={ctaWrap}>
            <button onClick={handleAction} disabled={checking} style={{
              ...ctaBtn,
              background: skill.tier === 'free' || isOwned || hasPro ? 'var(--green-bg)' : tier.bg,
              color: skill.tier === 'free' || isOwned || hasPro ? 'var(--green)' : tier.color,
              borderColor: skill.tier === 'free' || isOwned || hasPro ? 'rgba(52,211,153,0.25)' : tier.border,
            }}>
              {getButtonContent()}
            </button>
            {checking && <span style={checkingText}>Checking ownership...</span>}
            <button onClick={() => setShowBugModal(true)} style={bugBtn}>
              <Bug size={14} /> Report a Bug
            </button>
          </div>

          {showBugModal && (
            <BugReportModal skillName={skill.name} onClose={() => setShowBugModal(false)} />
          )}
        </div>
      </div>
    </div>
  );
}

const page = { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' };
const nav = { background: 'rgba(11,12,16,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 };
const navInner = { maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const backBtn = { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' };
const logoWrap = { display: 'flex', alignItems: 'center', gap: 10 };
const logoIcon = { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const logoText = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' };

const content = { maxWidth: 800, margin: '0 auto', padding: '40px 24px', width: '100%', flex: 1 };
const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 40, display: 'flex', flexDirection: 'column', gap: 28 };

const header = { display: 'flex', gap: 20, alignItems: 'flex-start' };
const iconBox = { width: 72, height: 72, borderRadius: 'var(--radius-lg)', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const headerText = { flex: 1, minWidth: 0 };
const topRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 };
const title = { fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 };
const tierBadge = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 12px', borderRadius: 100, border: '1px solid', display: 'flex', alignItems: 'center', flexShrink: 0 };
const metaRow = { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' };
const meta = { fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 };

const body = { display: 'flex', flexDirection: 'column', gap: 20 };
const sectionTitle = { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 };
const description = { fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' };
const tagsWrap = { display: 'flex', flexWrap: 'wrap', gap: 8 };
const tagPill = { fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 5 };
const worksWithPillDetail = { fontSize: 13, fontWeight: 700, color: 'var(--accent)', background: 'rgba(99,102,241,0.1)', padding: '5px 14px', borderRadius: 100, border: '1px solid rgba(99,102,241,0.2)' };
const statusRow = { display: 'flex', gap: 8 };
const statusBadge = { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5 };

const ctaWrap = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 10 };
const ctaBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '14px 24px', borderRadius: 'var(--radius-md)', border: '1px solid', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s' };
const checkingText = { fontSize: 13, color: 'var(--text-muted)' };
const bugBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s', marginTop: 4 };
