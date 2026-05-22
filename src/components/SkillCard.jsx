import * as Icons from 'lucide-react';
import { Star, Download, Lock, Zap, Gift } from 'lucide-react';
import { useClerkAuth } from '../lib/auth';

const colorMap = {
  green: { bg: 'var(--green-bg)', text: 'var(--green)', border: 'rgba(52,211,153,0.2)' },
  amber: { bg: 'var(--amber-bg)', text: 'var(--amber)', border: 'rgba(245,158,11,0.2)' },
  rose: { bg: 'var(--rose-bg)', text: 'var(--rose)', border: 'rgba(244,63,94,0.2)' },
  cyan: { bg: 'var(--cyan-bg)', text: 'var(--cyan)', border: 'rgba(34,211,238,0.2)' },
  violet: { bg: 'var(--violet-bg)', text: 'var(--violet)', border: 'rgba(167,139,250,0.2)' },
};

const tierStyles = {
  free: { label: 'Free', color: 'var(--green)', bg: 'var(--green-bg)', border: 'rgba(52,211,153,0.2)' },
  paid: { label: '$9', color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'rgba(245,158,11,0.2)' },
  pro: { label: 'Pro', color: 'var(--violet)', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.2)' },
};

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export default function SkillCard({ skill }) {
  const Icon = Icons[skill.icon] || Icons.Circle;
  const theme = colorMap[skill.color] || colorMap.violet;
  const tier = tierStyles[skill.tier] || tierStyles.free;
  const { signInRedirect } = useClerkAuth();

  const isFree = skill.tier === 'free';
  const isPaid = skill.tier === 'paid';
  const isPro = skill.tier === 'pro';

  const handleProtected = () => {
    signInRedirect(window.location.pathname + window.location.search);
  };

  return (
    <div style={card} className="skill-card">
      <div style={cardInner}>
        {/* Top row: icon + status + tier badge */}
        <div style={topRow}>
          <div
            style={{
              ...iconBox,
              background: theme.bg,
              borderColor: theme.border,
            }}
          >
            <Icon size={22} color={theme.text} strokeWidth={2} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                ...tierBadge,
                background: tier.bg,
                color: tier.color,
                borderColor: tier.border,
              }}
            >
              {skill.tier === 'free' && <Gift size={11} style={{ marginRight: 4 }} />}
              {skill.tier === 'paid' && <Zap size={11} style={{ marginRight: 4 }} />}
              {skill.tier === 'pro' && <Lock size={11} style={{ marginRight: 4 }} />}
              {tier.label}
            </span>
            <span
              style={{
                ...statusPill,
                background: theme.bg,
                color: theme.text,
              }}
            >
              {skill.status}
            </span>
          </div>
        </div>

        {/* Title + description */}
        <h3 style={title}>{skill.name}</h3>
        <p style={desc}>{skill.description}</p>

        {/* Tags */}
        <div style={tagsWrap}>
          {skill.tags.map((tag) => (
            <span key={tag} style={tagPill}>{tag}</span>
          ))}
        </div>

        {/* Divider */}
        <div style={divider} />

        {/* Bottom row */}
        <div style={bottomRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={stat}>
              <Download size={13} color="var(--text-muted)" />
              <span>{formatNumber(skill.installs)}</span>
            </div>
            <div style={stat}>
              <Star size={13} color="var(--amber)" fill="var(--amber)" />
              <span>{skill.rating}</span>
            </div>
            <div style={stat}>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>v{skill.version}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div style={ctaWrap}>
          {isFree ? (
            <button onClick={handleProtected} style={{ ...ctaBtn, background: 'var(--green-bg)', color: 'var(--green)', borderColor: 'rgba(52,211,153,0.25)' }}>
              <Download size={15} />
              Download Free
            </button>
          ) : isPaid ? (
            <button onClick={handleProtected} style={{ ...ctaBtn, background: 'var(--amber-bg)', color: 'var(--amber)', borderColor: 'rgba(245,158,11,0.25)' }}>
              <Zap size={15} />
              Buy for $9
            </button>
          ) : (
            <button onClick={handleProtected} style={{ ...ctaBtn, background: 'rgba(167,139,250,0.12)', color: 'var(--violet)', borderColor: 'rgba(167,139,250,0.25)' }}>
              <Lock size={15} />
              Get Vault Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const card = {
  borderRadius: 'var(--radius-lg)',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
};

const cardInner = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const topRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const iconBox = {
  width: 42,
  height: 42,
  borderRadius: 'var(--radius-md)',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const tierBadge = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '3px 8px',
  borderRadius: 100,
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
};

const statusPill = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '3px 8px',
  borderRadius: 100,
};

const title = {
  fontFamily: 'var(--font-display)',
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--text-primary)',
  lineHeight: 1.3,
};

const desc = {
  fontSize: 13,
  lineHeight: 1.55,
  color: 'var(--text-secondary)',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  minHeight: 40,
};

const tagsWrap = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 2,
};

const tagPill = {
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--text-muted)',
  background: 'var(--bg-secondary)',
  padding: '3px 8px',
  borderRadius: 6,
  border: '1px solid var(--border)',
};

const divider = {
  height: 1,
  background: 'var(--border)',
  margin: '4px 0',
};

const bottomRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 2,
};

const stat = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-secondary)',
};

const ctaWrap = {
  marginTop: 4,
};

const ctaBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  background: 'none',
  color: 'inherit',
};
