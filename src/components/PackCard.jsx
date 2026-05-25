import { useState } from 'react';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronUp, Gift, Zap, Lock, Download, Star, CheckCircle } from 'lucide-react';
import { useClerkAuth } from '../lib/auth';
import { buySingleSkill, subscribeVaultPro } from '../lib/stripe';

const tierBadgeStyles = {
  free: { label: 'Free', bg: 'var(--green-bg)', color: 'var(--green)', border: 'rgba(52,211,153,0.2)' },
  paid: { label: '$9', bg: 'var(--amber-bg)', color: 'var(--amber)', border: 'rgba(245,158,11,0.2)' },
  pro: { label: 'Pro', bg: 'rgba(167,139,250,0.12)', color: 'var(--violet)', border: 'rgba(167,139,250,0.2)' },
};

export default function PackCard({ pack }) {
  const [expanded, setExpanded] = useState(false);
  const { isSignedIn, user, signInRedirect } = useClerkAuth();
  const Icon = Icons[pack.icon] || Icons.Box;

  const colorMap = {
    cyan: { bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.2)', text: '#22d3ee' },
    violet: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', text: '#a78bfa' },
    amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
    rose: { bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', text: '#f43f5e' },
  };
  const theme = colorMap[pack.color] || colorMap.cyan;

  const handleSkillAction = async (skill) => {
    if (!isSignedIn) {
      signInRedirect(window.location.pathname);
      return;
    }

    if (skill.tier === 'free') {
      alert('Free download started!');
      return;
    }

    if (skill.tier === 'paid') {
      await buySingleSkill(skill.id, user.id);
    } else if (skill.tier === 'pro') {
      await subscribeVaultPro(user.id);
    }
  };

  return (
    <div style={card}>
      <div style={cardHeader} onClick={() => setExpanded(!expanded)}>
        <div style={{ ...iconWrap, background: theme.bg, borderColor: theme.border }}>
          <Icon size={24} color={theme.text} strokeWidth={2} />
        </div>
        <div style={headerContent}>
          <div style={titleRow}>
            <h3 style={title}>{pack.name}</h3>
            <span style={skillCount}>{pack.skills.length} skills</span>
          </div>
          <p style={description}>{pack.description}</p>
        </div>
        <button style={expandBtn}>
          {expanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
        </button>
      </div>

      {expanded && (
        <div style={skillsList}>
          {pack.skills.map((skill) => {
            const SkillIcon = Icons[skill.icon] || Icons.Circle;
            const tier = tierBadgeStyles[skill.tier];

            return (
              <div key={skill.id} style={skillRow}>
                <div style={skillLeft}>
                  <div style={{ ...skillIcon, background: tier.bg, borderColor: tier.border }}>
                    <SkillIcon size={16} color={tier.color} />
                  </div>
                  <div>
                    <div style={skillName}>{skill.name}</div>
                    <div style={skillMeta}>
                      <span style={{ ...tierBadge, background: tier.bg, color: tier.color, borderColor: tier.border }}>
                        {skill.tier === 'free' && <Gift size={10} style={{ marginRight: 4 }} />}
                        {skill.tier === 'paid' && <Zap size={10} style={{ marginRight: 4 }} />}
                        {skill.tier === 'pro' && <Lock size={10} style={{ marginRight: 4 }} />}
                        {tier.label}
                      </span>
                      <span style={ratingText}>
                        <Star size={10} fill="var(--amber)" color="var(--amber)" />
                        {skill.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  style={{ ...actionBtn, background: tier.bg, color: tier.color, borderColor: tier.border }}
                  onClick={() => handleSkillAction(skill)}
                >
                  {skill.tier === 'free' ? (
                    <><Download size={14} /> Get</>
                  ) : (
                    <><Zap size={14} /> Buy</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
};

const cardHeader = {
  padding: '24px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 16,
};

const iconWrap = {
  width: 48,
  height: 48,
  borderRadius: 'var(--radius-md)',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const headerContent = { flex: 1, minWidth: 0 };

const titleRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 6,
};

const title = {
  fontFamily: 'var(--font-display)',
  fontSize: 18,
  fontWeight: 600,
  color: 'var(--text-primary)',
  lineHeight: 1.3,
};

const skillCount = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
};

const description = {
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--text-secondary)',
};

const expandBtn = {
  background: 'none',
  border: 'none',
  padding: 4,
  cursor: 'pointer',
  flexShrink: 0,
  marginTop: 4,
};

const skillsList = {
  borderTop: '1px solid var(--border)',
  padding: '16px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const skillRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
};

const skillLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minWidth: 0,
};

const skillIcon = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const skillName = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--text-primary)',
  lineHeight: 1.3,
};

const skillMeta = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 4,
};

const tierBadge = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '2px 8px',
  borderRadius: 100,
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
};

const ratingText = {
  fontSize: 11,
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  gap: 3,
};

const actionBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 14px',
  borderRadius: 8,
  border: '1px solid',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
};
