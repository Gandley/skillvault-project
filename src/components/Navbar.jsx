import { useState } from 'react';
import { Layers, Bell, PlusCircle, Search, Menu, X } from 'lucide-react';

export default function Navbar({ onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch(val);
  };

  return (
    <nav style={navStyle}>
      <div style={navInner}>
        {/* Logo */}
        <div style={logoWrap}>
          <div style={logoIcon}>
            <Layers size={22} strokeWidth={2.2} />
          </div>
          <span style={logoText}>SkillVault</span>
        </div>

        {/* Search bar */}
        <div style={searchWrap}>
          <Search size={16} color="#6b6f82" />
          <input
            type="text"
            placeholder="Search skills, tags, authors..."
            value={searchVal}
            onChange={handleSearch}
            style={searchInput}
          />
        </div>

        {/* Actions */}
        <div style={actionsWrap}>
          <button style={iconBtn}><Bell size={18} /></button>
          <button style={primaryBtn}>
            <PlusCircle size={16} />
            <span style={{ marginLeft: 6 }}>New Skill</span>
          </button>
          <button style={mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {menuOpen && (
        <div style={mobileSearchWrap}>
          <Search size={16} color="#6b6f82" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchVal}
            onChange={handleSearch}
            style={mobileSearchInput}
          />
        </div>
      )}
    </nav>
  );
}

const navStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(11,12,16,0.88)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderBottom: '1px solid var(--border)',
};

const navInner = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '14px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 20,
};

const logoWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexShrink: 0,
};

const logoIcon = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  boxShadow: '0 2px 8px var(--accent-glow)',
};

const logoText = {
  fontFamily: 'var(--font-display)',
  fontSize: 20,
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-0.02em',
};

const searchWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: 1,
  maxWidth: 420,
  padding: '8px 14px',
  borderRadius: 10,
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  transition: 'border-color 0.2s',
};

const searchInput = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--text-primary)',
  fontSize: 14,
  width: '100%',
  fontFamily: 'var(--font-body)',
};

const actionsWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexShrink: 0,
};

const iconBtn = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const primaryBtn = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 2px 8px var(--accent-glow)',
};

const mobileMenuBtn = {
  display: 'none',
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
};

const mobileSearchWrap = {
  display: 'none',
  padding: '0 24px 14px',
  alignItems: 'center',
  gap: 8,
};

const mobileSearchInput = {
  ...searchInput,
};

// Responsive adjustments via style tag
const responsive = `
@media (max-width: 768px) {
  .nav-search-desktop { display: none !important; }
  .nav-actions-desktop { display: none !important; }
  .nav-mobile-menu { display: block !important; }
  .nav-mobile-search { display: flex !important; }
}
`;
