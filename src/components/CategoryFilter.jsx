import * as Icons from 'lucide-react';

export default function CategoryFilter({ active, onChange }) {
  return (
    <div style={wrap}>
      <div style={scroll}>
        {categories.map((cat) => {
          const Icon = Icons[cat.icon] || Icons.Circle;
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              style={{
                ...pill,
                background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                boxShadow: isActive ? '0 2px 10px var(--accent-glow)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const categories = [
  { id: 'all', label: 'All Skills', icon: 'Layers' },
  { id: 'website', label: 'Website Builder', icon: 'Globe' },
  { id: 'design', label: 'Design & Creative', icon: 'Palette' },
  { id: 'video', label: 'Video & Media', icon: 'Video' },
  { id: 'marketing', label: 'Marketing & Copy', icon: 'Megaphone' },
  { id: 'research', label: 'Research & Intelligence', icon: 'Search' },
  { id: 'code', label: 'Engineering', icon: 'Code2' },
  { id: 'productivity', label: 'Productivity & Ops', icon: 'Zap' },
];

const wrap = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '0 24px',
};

const scroll = {
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  paddingBottom: 4,
  scrollbarWidth: 'none',
};

const pill = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 16px',
  borderRadius: 100,
  border: '1px solid var(--border)',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};
