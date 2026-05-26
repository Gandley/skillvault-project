import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PackCard from '../components/PackCard';
import SkillCard from '../components/SkillCard';
import PricingSection from '../components/PricingSection';
import AuthNav from '../components/AuthNav';
import { useClerkAuth } from '../lib/auth';
import { subscribeVaultPro } from '../lib/stripe';
import * as Icons from 'lucide-react';
import { ArrowUpDown, Lock, Layers, Grid } from 'lucide-react';

export default function RepoView() {
  const { data, settings } = useApp();
  const { isSignedIn, user } = useClerkAuth();
  const [search, setSearch] = useState('');
  const [activePack, setActivePack] = useState('all');
  const [viewMode, setViewMode] = useState('packs'); // 'packs' or 'skills'
  const [sortBy, setSortBy] = useState('popular');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [expandedPackId, setExpandedPackId] = useState(null);
  const [platformFilters, setPlatformFilters] = useState([]);

  const PLATFORMS = ['OpenClaw', 'Claude', 'ChatGPT', 'n8n'];

  const togglePlatform = (p) => {
    setPlatformFilters((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleBannerPro = async () => {
    if (!isSignedIn || !user) {
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `/login.html?return_url=${returnUrl}`;
      return;
    }
    try {
      await subscribeVaultPro(user.id);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  const packs = data.skillPacks || [];

  // Filter packs by search
  const filteredPacks = packs.filter((pack) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      pack.name.toLowerCase().includes(q) ||
      pack.description.toLowerCase().includes(q) ||
      pack.skills.some((s) => s.name.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // Filter skills
  const allSkills = packs.flatMap((p) => p.skills);
  let filteredSkills = allSkills;

  if (activePack !== 'all') {
    const pack = packs.find((p) => p.id === activePack);
    filteredSkills = pack ? pack.skills : [];
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filteredSkills = filteredSkills.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  // Platform filter (multi-select — any match passes)
  if (platformFilters.length > 0) {
    filteredSkills = filteredSkills.filter((s) =>
      platformFilters.some((p) => (s.worksWith || []).includes(p))
    );
  }

  // Sort skills
  if (sortBy === 'popular') {
    filteredSkills.sort((a, b) => (b.installs || 0) - (a.installs || 0));
  } else if (sortBy === 'rating') {
    filteredSkills.sort((a, b) => {
      const ra = typeof a.rating === 'number' ? a.rating : 0;
      const rb = typeof b.rating === 'number' ? b.rating : 0;
      return rb - ra;
    });
  } else if (sortBy === 'newest') {
    filteredSkills.sort((a, b) => {
      const va = (a.version || '0.0.0').split('.').map(Number);
      const vb = (b.version || '0.0.0').split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if ((va[i] || 0) !== (vb[i] || 0)) return (vb[i] || 0) - (va[i] || 0);
      }
      return 0;
    });
  } else if (sortBy === 'name') {
    filteredSkills.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  const totalSkills = allSkills.length;
  const totalInstalls = allSkills.reduce((sum, s) => sum + (s.installs || 0), 0);

  return (
    <div style={page}>
      <style>{
        `
        .pack-card:hover { transform: translateY(-4px) scale(1.01); border-color: var(--border-subtle) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.06); }
        .pack-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 768px) { .pack-grid { grid-template-columns: 1fr; } }
        .skill-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        @media (max-width: 640px) { .skill-grid { grid-template-columns: 1fr; } }
        `
      }</style>

      {/* Sticky Upgrade Banner */}
      {!bannerDismissed && (
        <div style={banner}>
          <div style={bannerInner}>
            <div style={bannerLeft}>
              <Lock size={16} style={{ color: 'var(--violet)', flexShrink: 0 }} />
              <span>Get unlimited access to all 37 skills — <strong style={{ color: 'var(--violet)' }}>$27/month</strong></span>
            </div>
            <div style={bannerRight}>
              <button onClick={handleBannerPro} style={bannerBtn}>Go Pro</button>
              <button style={bannerClose} onClick={() => setBannerDismissed(true)}><span style={{ fontSize: 18, lineHeight: 1 }}>×</span></button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={navStyle}>
        <div style={navInner}>
          <div style={logoWrap}>
            <div style={logoIcon}>
              <Icons.Layers size={20} strokeWidth={2.2} />
            </div>
            <span style={logoText}>{settings.title || 'SkillVault'}</span>
          </div>

          <div style={searchWrap}>
            <Icons.Search size={16} color="#6b6f82" />
            <input
              type="text"
              placeholder="Search packs and skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
          </div>

          <div style={actionsWrap}>
            <AuthNav />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={hero}>
        <div style={heroInner}>
          <h1 style={heroTitle}>
            {settings.heroText || 'Discover & Deploy'}
            <br />
            <span style={{ color: 'var(--accent)' }}>AI-Powered Skills</span>
          </h1>
          <p style={heroSub}>{settings.description}</p>
          <div style={heroStats}>
            <div style={heroStat}>
              <span style={heroStatNum}>{totalInstalls.toLocaleString()}+</span>
              <span style={heroStatLabel}>installs</span>
            </div>
            <div style={heroStatDivider} />
            <div style={heroStat}>
              <span style={heroStatNum}>{totalSkills}</span>
              <span style={heroStatLabel}>skills</span>
            </div>
            <div style={heroStatDivider} />
            <div style={heroStat}>
              <span style={heroStatNum}>{(data.skillPacks || []).length}</span>
              <span style={heroStatLabel}>packs</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div style={viewToggleWrap}>
        <div style={viewToggle}>
          <button
            onClick={() => setViewMode('packs')}
            style={{
              ...toggleBtn,
              background: viewMode === 'packs' ? 'var(--accent)' : 'var(--bg-card)',
              color: viewMode === 'packs' ? '#fff' : 'var(--text-secondary)',
            }}
>
            <Layers size={14} />
            Packs
          </button>
          <button
            onClick={() => setViewMode('skills')}
            style={{
              ...toggleBtn,
              background: viewMode === 'skills' ? 'var(--accent)' : 'var(--bg-card)',
              color: viewMode === 'skills' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <Grid size={14} />
            All Skills
          </button>
        </div>
      </div>

      {/* Pack Filter (only in skills mode) */}
      {viewMode === 'skills' && (
        <div style={catWrap}>
          <div style={catScroll}>
            <button
              onClick={() => setActivePack('all')}
              style={{
                ...pill,
                background: activePack === 'all' ? 'var(--accent)' : 'var(--bg-card)',
                color: activePack === 'all' ? '#fff' : 'var(--text-secondary)',
                borderColor: activePack === 'all' ? 'var(--accent)' : 'var(--border)',
              }}
            >
              <Layers size={16} strokeWidth={2} />
              All Skills
            </button>
            {packs.map((pack) => {
              const Icon = Icons[pack.icon] || Icons.Circle;
              return (
                <button
                  key={pack.id}
                  onClick={() => setActivePack(pack.id)}
                  style={{
                    ...pill,
                    background: activePack === pack.id ? 'var(--accent)' : 'var(--bg-card)',
                    color: activePack === pack.id ? '#fff' : 'var(--text-secondary)',
                    borderColor: activePack === pack.id ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <Icon size={16} strokeWidth={2} />
                  {pack.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={main}>
        {viewMode === 'packs' ? (
          <>
            <div style={sectionHeader}>
              <div>
                <h2 style={sectionTitle}>Skill Packs</h2>
                <p style={sectionSub}>{filteredPacks.length} packs · {totalSkills} skills · {totalInstalls.toLocaleString()} installs</p>
              </div>
            </div>
            <div className="pack-grid">
              {filteredPacks.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  isExpanded={expandedPackId === pack.id}
                  onToggle={() => setExpandedPackId(expandedPackId === pack.id ? null : pack.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Platform filter */}
            <div style={platformFilterBar}>
              <span style={platformFilterLabel}>Works with:</span>
              <div style={platformFilterBtns}>
                {PLATFORMS.map((p) => {
                  const active = platformFilters.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      style={{
                        ...platformBtn,
                        background: active ? 'var(--accent)' : 'var(--bg-card)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        borderColor: active ? 'var(--accent)' : 'var(--border)',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                {platformFilters.length > 0 && (
                  <button
                    onClick={() => setPlatformFilters([])}
                    style={{ ...platformBtn, background: 'none', color: 'var(--text-muted)', borderColor: 'transparent', paddingLeft: 4 }}
                  >
                    Clear ×
                  </button>
                )}
              </div>
            </div>

            <div style={toolbar}>
              <div style={countText}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filteredSkills.length}</span>
                <span style={{ color: 'var(--text-muted)' }}>{' '}skill{filteredSkills.length !== 1 ? 's' : ''} found</span>
              </div>
              <div style={sortWrap}>
                <ArrowUpDown size={14} color="var(--text-muted)" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={sortSelect}>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>
            </div>

            <div className="skill-grid">
              {filteredSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>

            {filteredSkills.length === 0 && (
              <div style={empty}>
                <div style={emptyIcon}>🔍</div>
                <h3 style={emptyTitle}>No skills found</h3>
                <p style={emptyDesc}>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pricing */}
      <PricingSection />

      {/* Footer */}
      <footer style={footer}>
        <div style={footerInner}>
          <div style={footerLeft}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{settings.title || 'SkillVault'}</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>· {totalSkills} skills available</span>
          </div>
          <div style={footerRight}>
            <a href="/pricing.html" style={footerLink}>Pricing</a>
            <a href="/privacy.html" style={footerLink}>Privacy</a>
            <a href="/terms.html" style={footerLink}>Terms</a>
            <a href="/refund.html" style={footerLink}>Refunds</a>
            <a href="#coming-soon" style={footerLink}>Docs</a>
            <a href="#coming-soon" style={footerLink}>API</a>
            <a href="#coming-soon" style={footerLink}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const page = { minHeight: '100vh', display: 'flex', flexDirection: 'column' };

const banner = {
  position: 'sticky', top: 0, zIndex: 200,
  background: 'linear-gradient(90deg, #1a1c2a 0%, #23273a 100%)',
  borderBottom: '1px solid rgba(167,139,250,0.15)',
};

const bannerInner = {
  maxWidth: 1280, margin: '0 auto', padding: '10px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
  flexWrap: 'wrap',
};

const bannerLeft = {
  display: 'flex', alignItems: 'center', gap: 10,
  fontSize: 14, color: 'var(--text-secondary)',
};

const bannerRight = { display: 'flex', alignItems: 'center', gap: 10 };

const bannerBtn = {
  padding: '7px 18px', borderRadius: 8,
  background: 'var(--violet)', color: '#0b0c10',
  fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
  textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
};

const bannerClose = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', padding: '4px 6px', lineHeight: 1,
};

const navStyle = {
  position: 'sticky', top: 0, zIndex: 100,
  background: 'rgba(11,12,16,0.88)', backdropFilter: 'blur(16px)',
  borderBottom: '1px solid var(--border)',
};

const navInner = {
  maxWidth: 1280, margin: '0 auto', padding: '14px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
};

const logoWrap = { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 };

const logoIcon = {
  width: 36, height: 36, borderRadius: 10,
  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
  boxShadow: '0 2px 8px var(--accent-glow)',
};

const logoText = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' };

const searchWrap = {
  display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 420,
  padding: '8px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
};

const searchInput = { background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, width: '100%', fontFamily: 'var(--font-body)' };

const actionsWrap = { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 };

const hero = { padding: '40px 24px 28px', textAlign: 'center' };
const heroInner = { maxWidth: 680, margin: '0 auto' };
const heroTitle = { fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 14 };
const heroSub = { fontSize: 16, lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 28px' };
const heroStats = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 28px', width: 'fit-content', margin: '0 auto' };
const heroStat = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0 24px' };
const heroStatNum = { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 };
const heroStatLabel = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' };
const heroStatDivider = { width: 1, height: 36, background: 'var(--border)', flexShrink: 0 };

const viewToggleWrap = { maxWidth: 1280, margin: '0 auto', padding: '0 24px 20px' };

const viewToggle = {
  display: 'flex',
  gap: 8,
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 4,
  width: 'fit-content',
};

const toggleBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const catWrap = { maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 20 };

const catScroll = { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' };

const pill = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100,
  border: '1px solid var(--border)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
  cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
};

const main = { maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px', flex: 1 };

const sectionHeader = { marginBottom: 24 };

const sectionTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 4,
};

const sectionSub = {
  fontSize: 14,
  color: 'var(--text-muted)',
};

const platformFilterBar = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' };
const platformFilterLabel = { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' };
const platformFilterBtns = { display: 'flex', gap: 8, flexWrap: 'wrap' };
const platformBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: '1px solid', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' };
const toolbar = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' };

const countText = { fontSize: 14 };

const sortWrap = { display: 'flex', alignItems: 'center', gap: 8 };

const sortSelect = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
  padding: '6px 28px 6px 10px', color: 'var(--text-primary)', fontSize: 13,
  fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none', appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6f82' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
};

const empty = { textAlign: 'center', padding: '60px 20px' };
const emptyIcon = { fontSize: 40, marginBottom: 12 };
const emptyTitle = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 };
const emptyDesc = { fontSize: 14, color: 'var(--text-muted)' };

const footer = { borderTop: '1px solid var(--border)', padding: '20px 24px', marginTop: 'auto' };
const footerInner = { maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 };
const footerLeft = { fontSize: 13 };
const footerRight = { display: 'flex', gap: 20 };
const footerLink = { fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' };
