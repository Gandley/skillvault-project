import { Layers, Download, Star, GitBranch } from 'lucide-react';

export default function StatsBar({ total, installs, avgRating, categories }) {
  return (
    <div style={wrap}>
      <div style={grid}>
        <div style={statBox}>
          <div style={iconWrap('var(--accent)', 'var(--accent-glow)')}>
            <Layers size={20} />
          </div>
          <div>
            <div style={statValue}>{total}</div>
            <div style={statLabel}>Total Skills</div>
          </div>
        </div>
        <div style={statBox}>
          <div style={iconWrap('var(--green)', 'rgba(52,211,153,0.22)')}>
            <Download size={20} />
          </div>
          <div>
            <div style={statValue}>{installs}</div>
            <div style={statLabel}>Total Installs</div>
          </div>
        </div>
        <div style={statBox}>
          <div style={iconWrap('var(--amber)', 'rgba(245,158,11,0.22)')}>
            <Star size={20} />
          </div>
          <div>
            <div style={statValue}>{avgRating}</div>
            <div style={statLabel}>Avg Rating</div>
          </div>
        </div>
        <div style={statBox}>
          <div style={iconWrap('var(--cyan)', 'rgba(34,211,238,0.22)')}>
            <GitBranch size={20} />
          </div>
          <div>
            <div style={statValue}>{categories}</div>
            <div style={statLabel}>Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

const wrap = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '0 24px',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 16,
};

const statBox = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
};

const iconWrap = (color, shadow) => ({
  width: 44,
  height: 44,
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-secondary)',
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 2px 8px ${shadow}`,
  flexShrink: 0,
});

const statValue = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--text-primary)',
  lineHeight: 1.2,
};

const statLabel = {
  fontSize: 13,
  color: 'var(--text-muted)',
  marginTop: 2,
};

// Responsive: stack on mobile
const responsiveStyle = `
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
}
`;

export { responsiveStyle };
