import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import SkillCard from '../components/SkillCard';
import PricingSection from '../components/PricingSection';
import AuthNav from '../components/AuthNav';
import { useClerkAuth } from '../lib/auth';
import { subscribeVaultPro } from '../lib/stripe';
import * as Icons from 'lucide-react';
import { ArrowUpDown, Shield, Lock } from 'lucide-react';

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export default function RepoView() {
  const { data, settings, goAdmin } = useApp();
  const { isSignedIn, user } = useClerkAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const handleBannerPro = async () => {
    if (!isSignedIn || !user) {
      const returnUrl = window.location.pathname + window.location.search;
      window.location.href = '/login.html?return_url=' + encodeURIComponent(returnUrl);
      return;
    }
    try {
      await subscribeVaultPro(user.id);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  const filtered = useMemo(() => {
    let list = data.skills;

    if (activeCategory !== 'all') {
      list = list.filter((s) => s.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q) ||
          (s.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (s.author || '').toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    if (sortBy === 'popular') sorted.sort((a, b) => (b.installs || 0) - (a.installs || 0));
    else if (sortBy === 'rating') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'newest') {
      sorted.sort((a, b) => {
        const va = (a.version || '0.0.0').split('.').map(Number);
        const vb = (b.version || '0.0.0').split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if ((va[i] || 0) !== (vb[i] || 0)) return (vb[i] || 0) - (va[i] || 0);
        }
        return 0;
      });
    } else if (sortBy === 'name') sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return sorted;
  }, [search, activeCategory, sortBy, data.skills]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const installs = filtered.reduce((sum, s) => sum + (s.installs || 0), 0);
    const avgRating =
      filtered.length > 0
        ? (filtered.reduce((sum, s) => sum + (s.rating || 0), 0) / filtered.length).toFixed(1)
        : '0.0';
    const categories = new Set(filtered.map((s) => s.category)).size;
    return { total, installs, avgRating, categories };
  }, [filtered]);

  return (
    <div style={page}>
      <style>{
        `
        .skill-card:hover { transform: translateY(-4px) scale(1.01); border-color: var(--border-subtle) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.06); }
        .skill-card:hover .arrow-btn { background: var(--accent) !important; color: #fff !important; border-color: var(--accent) !important; }
        .skill-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        @media (max-width: 640px) { .skill-grid { grid-template-columns: 1fr; } }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }
        `
      }</style>

      {/* Sticky Upgrade Banner */}
      {!bannerDismissed && (
        <div style={banner}>
          <div style={bannerInner}>
            <div style={bannerLeft}>
              <Lock size={16} style={{ color: 'var(--violet)', flexShrink: 0 }} />
              <span>Get unlimited access to all 18 skills — <strong style={{ color: 'var(--violet)' }}>$27/month</strong></span>
            </div>
            <div style={bannerRight}>
              <button onClick={handleBannerPro} style={bannerBtn}>Go Pro</button>
              <button style={bannerClose} onClick={() => setBannerDismissed(true)}><span style={{ fontSize: 18, lineHeight: 1 }}>×</span></button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky header with search + admin */}
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
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
          </div>

          <div style={actionsWrap}>
            <AuthNav />
            <button onClick={goAdmin} style={adminBtn}>
              <Shield size={14} />
              <span style={{ marginLeft: 6 }}>Admin</span>
            </button>
          </div>
        </div>
      </nav>

      <div style={hero}>
        <div style={heroInner}>
          <h1 style={heroTitle}>
            {settings.heroText || 'Discover & Deploy'}
            <br />
            <span style={{ color: 'var(--accent)' }}>AI-Powered Skills</span>
          </h1>
          <p style={heroSub}>{settings.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={statsWrap}>
        <div className="stats-grid">
          <StatBox icon="Layers" label="Total Skills" value={stats.total} color="var(--accent)" shadow="var(--accent-glow)" />
          <StatBox icon="Download" label="Total Installs" value={formatNumber(stats.installs)} color="var(--green)" shadow="rgba(52,211,153,0.22)" />
          <StatBox icon="Star" label="Avg Rating" value={stats.avgRating} color="var(--amber)" shadow="rgba(245,158,11,0.22)" />
          <StatBox icon="GitBranch" label="Categories" value={stats.categories} color="var(--cyan)" shadow="rgba(34,211,238,0.22)" />
        </div>
      </div>

      {/* Pricing Section */}
      <PricingSection />

      {/* Categories */}
      <div style={catWrap}>
        <div style={catScroll}>
          {data.categories.map((cat) => {
            const Icon = Icons[cat.icon] || Icons.Circle;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  ...pill,
                  background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  boxShadow: isActive ? '0 2px 10px var(--accent-glow)' : 'none',
                }}
              >
                <Icon size={16} strokeWidth={2} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main grid */}
      <div style={main}>
        <div style={toolbar}>
          <div style={countText}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filtered.length}</span>
            <span style={{ color: 'var(--text-muted)' }}>{' '}skill{filtered.length !== 1 ? 's' : ''} found</span>
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
          {filtered.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={empty}>
            <div style={emptyIcon}>🔍</div>
            <h3 style={emptyTitle}>No skills found</h3>
            <p style={emptyDesc}>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      <footer style={footer}>
        <div style={footerInner}>
          <div style={footerLeft}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{settings.title || 'SkillVault'}</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>· {data.skills.length} skills available</span>
          </div>
          <div style={footerRight}>
            <a href="#coming-soon" style={footerLink}>Pricing</a>
            <a href="#coming-soon" style={footerLink}>Docs</a>
            <a href="#coming-soon" style={footerLink}>API</a>
            <a href="#coming-soon" style={footerLink}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatBox({ icon, label, value, color, shadow }) {
  const Icon = Icons[icon] || Icons.Circle;
  return (
    <div style={statBox}>
      <div style={{ ...iconWrapBase, color, boxShadow: `0 2px 8px ${shadow}` }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={statValue}>{value}</div>
        <div style={statLabel}>{label}</div>
      </div>
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
  background: 'rgba(11,12,16,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
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

const logoText = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' };

const searchWrap = {
  display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 420,
  padding: '8px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
};

const searchInput = { background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, width: '100%', fontFamily: 'var(--font-body)' };

const actionsWrap = { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 };

const adminBtn = {
  display: 'flex', alignItems: 'center', padding: '8px 14px', borderRadius: 10,
  border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)',
  fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s',
};

const hero = { padding: '40px 24px 28px', textAlign: 'center' };

const heroInner = { maxWidth: 680, margin: '0 auto' };

const heroTitle = { fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 14 };

const heroSub = { fontSize: 16, lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' };

const statsWrap = { maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 28 };

const statBox = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
  padding: '20px', display: 'flex', alignItems: 'center', gap: 14,
};

const iconWrapBase = {
  width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

const statValue = { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 };

const statLabel = { fontSize: 13, color: 'var(--text-muted)', marginTop: 2 };

const catWrap = { maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 20 };

const catScroll = { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' };

const pill = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100,
  border: '1px solid var(--border)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
  cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
};

const main = { maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px', flex: 1 };

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
