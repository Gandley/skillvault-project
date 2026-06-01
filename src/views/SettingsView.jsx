import { useState, useEffect } from 'react';
import { useClerkAuth } from '../lib/auth';
import { hasVaultProSubscription } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft, Crown, User, CreditCard, Download, LogOut,
  Mail, Shield, ExternalLink, ChevronRight, Clock,
} from 'lucide-react';

export default function SettingsView() {
  const { isSignedIn, user, signOut } = useClerkAuth();
  const { goRepo } = useApp();
  const [isPro, setIsPro] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (!isSignedIn || !user) { setLoading(false); return; }

    async function load() {
      try {
        const [proStatus, dlRes] = await Promise.all([
          hasVaultProSubscription(user.id),
          fetch(`/api/check-access?clerk_user_id=${encodeURIComponent(user.id)}`),
        ]);
        setIsPro(proStatus);
        const dlData = await dlRes.json();
        setDownloads(dlData.purchases || []);
      } catch (err) {
        console.error('[Settings] load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isSignedIn, user]);

  const handleBillingPortal = async () => {
    if (!user) return;
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_user_id: user.id,
          return_url: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not open billing portal. Please try again.');
      }
    } catch (err) {
      console.error('[Settings] billing portal error:', err);
      alert('Could not open billing portal. Please try again.');
    } finally {
      setLoadingPortal(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div style={page}>
        <div style={emptyState}>
          <Shield size={48} color="var(--text-muted)" />
          <h2 style={emptyTitle}>Sign In Required</h2>
          <p style={emptyText}>Sign in to view your settings.</p>
          <a href="/login.html?return_url=/" style={btnPrimary}>Sign In</a>
        </div>
      </div>
    );
  }

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const avatar = user?.imageUrl || null;

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'membership', label: 'Membership', icon: Crown },
    { id: 'downloads', label: 'Download History', icon: Download },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  return (
    <div style={page}>
      {/* Top nav */}
      <nav style={topNav}>
        <div style={navInner}>
          <button onClick={goRepo} style={backBtn}>
            <ArrowLeft size={18} /> Back to Skills
          </button>
          <span style={navTitle}>Settings</span>
        </div>
      </nav>

      <div style={layout}>
        {/* Sidebar */}
        <aside style={sidebar}>
          <div style={sidebarProfile}>
            {avatar
              ? <img src={avatar} alt={displayName} style={avatarImg} />
              : <div style={avatarFallback}>{displayName.charAt(0).toUpperCase()}</div>
            }
            <div>
              <div style={sidebarName}>{displayName}</div>
              <div style={sidebarEmail}>{email}</div>
            </div>
          </div>
          <nav style={sidebarNav}>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                style={{
                  ...sidebarItem,
                  background: activeSection === id ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: activeSection === id ? 'var(--accent)' : 'var(--text-secondary)',
                  borderColor: activeSection === id ? 'rgba(99,102,241,0.25)' : 'transparent',
                }}
              >
                <Icon size={16} />
                {label}
                {activeSection === id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={main}>
          {loading ? (
            <div style={loadingWrap}>
              <div style={spinner} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</span>
            </div>
          ) : (
            <>
              {/* PROFILE */}
              {activeSection === 'profile' && (
                <section style={section}>
                  <h2 style={sectionTitle}>Profile</h2>
                  <p style={sectionSub}>Your account info from Clerk.</p>
                  <div style={card}>
                    <div style={fieldRow}>
                      <div style={fieldIcon}><User size={18} color="var(--text-muted)" /></div>
                      <div>
                        <div style={fieldLabel}>Display Name</div>
                        <div style={fieldValue}>{displayName}</div>
                      </div>
                    </div>
                    <div style={divider} />
                    <div style={fieldRow}>
                      <div style={fieldIcon}><Mail size={18} color="var(--text-muted)" /></div>
                      <div>
                        <div style={fieldLabel}>Email</div>
                        <div style={fieldValue}>{email}</div>
                      </div>
                    </div>
                    <div style={divider} />
                    <div style={fieldRow}>
                      <div style={fieldIcon}><Crown size={18} color={isPro ? '#a78bfa' : 'var(--text-muted)'} /></div>
                      <div>
                        <div style={fieldLabel}>Plan</div>
                        <div style={{
                          ...fieldValue,
                          color: isPro ? '#a78bfa' : 'var(--text-secondary)',
                          fontWeight: isPro ? 700 : 400,
                        }}>
                          {isPro ? '✦ Vault Pro' : 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p style={noteText}>
                    To update your name or email, visit your{' '}
                    <a href="https://accounts.clerk.dev/user" target="_blank" rel="noreferrer" style={link}>
                      Clerk account <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />
                    </a>
                  </p>
                </section>
              )}

              {/* MEMBERSHIP */}
              {activeSection === 'membership' && (
                <section style={section}>
                  <h2 style={sectionTitle}>Membership</h2>
                  <p style={sectionSub}>Your current plan and billing.</p>

                  <div style={{ ...card, borderColor: isPro ? 'rgba(167,139,250,0.3)' : 'var(--border)' }}>
                    <div style={planHeader}>
                      <div style={planIconWrap}>
                        <Crown size={22} color={isPro ? '#a78bfa' : 'var(--text-muted)'} />
                      </div>
                      <div>
                        <div style={planName}>{isPro ? 'Vault Pro' : 'Free Plan'}</div>
                        <div style={planDesc}>
                          {isPro
                            ? 'Unlimited access to all skills in the vault.'
                            : 'Access to all free skills. Upgrade for the full library.'}
                        </div>
                      </div>
                      <span style={{
                        ...planBadge,
                        background: isPro ? 'rgba(167,139,250,0.12)' : 'var(--bg-secondary)',
                        color: isPro ? '#a78bfa' : 'var(--text-muted)',
                        borderColor: isPro ? 'rgba(167,139,250,0.25)' : 'var(--border)',
                      }}>
                        {isPro ? 'Active' : 'Free'}
                      </span>
                    </div>
                  </div>

                  {isPro ? (
                    <button
                      onClick={handleBillingPortal}
                      disabled={loadingPortal}
                      style={billingBtn}
                    >
                      <CreditCard size={16} />
                      {loadingPortal ? 'Opening...' : 'Manage Billing & Subscription'}
                      <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                    </button>
                  ) : (
                    <div style={upgradeCard}>
                      <Crown size={24} color="#a78bfa" />
                      <div>
                        <div style={upgradeTitle}>Upgrade to Vault Pro</div>
                        <div style={upgradeDesc}>Unlock every skill in the vault — current and future.</div>
                      </div>
                      <a href="/pricing.html" style={upgradeCta}>
                        View Plans
                      </a>
                    </div>
                  )}
                </section>
              )}

              {/* DOWNLOADS */}
              {activeSection === 'downloads' && (
                <section style={section}>
                  <h2 style={sectionTitle}>Download History</h2>
                  <p style={sectionSub}>Skills you've purchased and can re-download anytime.</p>

                  {downloads.length === 0 ? (
                    <div style={emptySmall}>
                      <Download size={32} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>No purchases yet.</span>
                    </div>
                  ) : (
                    <div style={downloadList}>
                      {downloads.map((p) => (
                        <div key={p.id || p.skill_id} style={downloadRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <div style={dlIcon}><Download size={16} color="var(--accent)" /></div>
                            <div>
                              <div style={dlSkillId}>{p.skill_id}</div>
                              {p.purchased_at && (
                                <div style={dlDate}>
                                  <Clock size={11} style={{ marginRight: 3 }} />
                                  {new Date(p.purchased_at).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            style={redownloadBtn}
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `/skills/${p.skill_id}.zip`;
                              link.download = `${p.skill_id}.zip`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ACCOUNT */}
              {activeSection === 'account' && (
                <section style={section}>
                  <h2 style={sectionTitle}>Account</h2>
                  <p style={sectionSub}>Manage your account access.</p>

                  <div style={card}>
                    <div style={accountRow}>
                      <div>
                        <div style={accountLabel}>Sign Out</div>
                        <div style={accountDesc}>Sign out of your SkillVault account on this device.</div>
                      </div>
                      <button onClick={signOut} style={signOutBtn}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>

                  <div style={{ ...card, marginTop: 16, borderColor: 'rgba(244,63,94,0.15)' }}>
                    <div style={accountRow}>
                      <div>
                        <div style={{ ...accountLabel, color: '#f43f5e' }}>Delete Account</div>
                        <div style={accountDesc}>
                          Permanently delete your account and all data. This cannot be undone.
                          Contact{' '}
                          <a href="mailto:support@vaultofskills.com" style={link}>
                            support@vaultofskills.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const page = { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' };

const topNav = { background: 'rgba(11,12,16,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 };
const navInner = { maxWidth: 1280, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 };
const navTitle = { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' };
const backBtn = { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' };

const layout = { maxWidth: 1100, margin: '40px auto', padding: '0 24px', display: 'flex', gap: 28, alignItems: 'flex-start', width: '100%' };

const sidebar = { width: 240, flexShrink: 0, position: 'sticky', top: 80 };
const sidebarProfile = { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 12 };
const avatarImg = { width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 };
const avatarFallback = { width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 };
const sidebarName = { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 };
const sidebarEmail = { fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 };
const sidebarNav = { display: 'flex', flexDirection: 'column', gap: 4 };
const sidebarItem = { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'all 0.15s', width: '100%' };

const main = { flex: 1, minWidth: 0 };
const section = { display: 'flex', flexDirection: 'column', gap: 16 };
const sectionTitle = { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' };
const sectionSub = { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: -8 };

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' };
const fieldRow = { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px' };
const fieldIcon = { width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 };
const fieldLabel = { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' };
const fieldValue = { fontSize: 15, color: 'var(--text-primary)', fontWeight: 500 };
const divider = { height: 1, background: 'var(--border)', margin: '0 20px' };
const noteText = { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 };

const planHeader = { display: 'flex', alignItems: 'center', gap: 14, padding: '20px' };
const planIconWrap = { width: 44, height: 44, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const planName = { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 };
const planDesc = { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 };
const planBadge = { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 12px', borderRadius: 100, border: '1px solid', flexShrink: 0, marginLeft: 'auto' };

const billingBtn = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s' };

const upgradeCard = { display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius-lg)' };
const upgradeTitle = { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 };
const upgradeDesc = { fontSize: 13, color: 'var(--text-secondary)' };
const upgradeCta = { marginLeft: 'auto', padding: '9px 18px', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 };

const downloadList = { display: 'flex', flexDirection: 'column', gap: 8 };
const downloadRow = { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' };
const dlIcon = { width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const dlSkillId = { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 };
const dlDate = { fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' };
const redownloadBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(52,211,153,0.25)', background: 'var(--green-bg)', color: 'var(--green)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 };
const emptySmall = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' };

const accountRow = { display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' };
const accountLabel = { fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 };
const accountDesc = { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 };
const signOutBtn = { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0, marginLeft: 'auto' };

const emptyState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 24px', textAlign: 'center' };
const emptyTitle = { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' };
const emptyText = { fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 400 };
const btnPrimary = { display: 'inline-block', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', marginTop: 8 };

const loadingWrap = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '80px 0' };
const spinner = { width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };

const link = { color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 2 };
