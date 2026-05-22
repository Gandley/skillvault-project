import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getPasscode } from '../lib/storage';
import { Lock, ArrowRight, Zap, Layers, Sparkles } from 'lucide-react';

export default function GateView() {
  const { settings, unlock } = useApp();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    setTimeout(() => {
      if (input.trim() === getPasscode()) {
        unlock();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div style={page}>
      <div style={bgGlow} />
      <div style={bgGlow2} />

      <div style={container}>
        {/* Floating icons decoration */}
        <div style={{ ...floatIcon, top: '12%', left: '10%' }}><Zap size={20} /></div>
        <div style={{ ...floatIcon, top: '18%', right: '12%' }}><Layers size={18} /></div>
        <div style={{ ...floatIcon, bottom: '20%', left: '15%' }}><Sparkles size={18} /></div>
        <div style={{ ...floatIcon, bottom: '15%', right: '10%' }}><Zap size={16} /></div>

        {/* Card */}
        <div style={card}>
          <div style={lockIcon}>
            <Lock size={28} />
          </div>

          <h1 style={title}>{settings.title}</h1>
          <p style={subtitle}>{settings.subtitle}</p>

          <form onSubmit={handleSubmit} style={form}>
            <div style={inputWrap(error)}>
              <input
                type="password"
                placeholder="Enter access code"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(false);
                }}
                style={inputStyle}
                autoFocus
              />
            </div>

            {error && (
              <p style={errorText}>Wrong code. Try again.</p>
            )}

            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                ...btn,
                opacity: !input.trim() || loading ? 0.5 : 1,
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={spinner} />
                  Verifying...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Unlock Access
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p style={hint}>DM me on Instagram for the code 🔒</p>
        </div>
      </div>
    </div>
  );
}

const page = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-primary)',
  position: 'relative',
  overflow: 'hidden',
};

const bgGlow = {
  position: 'absolute',
  width: 500,
  height: 500,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)',
  top: '-10%',
  left: '-10%',
  pointerEvents: 'none',
};

const bgGlow2 = {
  position: 'absolute',
  width: 400,
  height: 400,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)',
  bottom: '-10%',
  right: '-5%',
  pointerEvents: 'none',
};

const container = {
  position: 'relative',
  zIndex: 2,
  width: '100%',
  maxWidth: 440,
  padding: '0 24px',
};

const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
  padding: '40px 32px',
  textAlign: 'center',
  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  position: 'relative',
};

const lockIcon = {
  width: 56,
  height: 56,
  borderRadius: 16,
  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  margin: '0 auto 20px',
  boxShadow: '0 4px 16px var(--accent-glow)',
};

const title = {
  fontFamily: 'var(--font-display)',
  fontSize: 26,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 6,
};

const subtitle = {
  fontSize: 14,
  color: 'var(--text-muted)',
  marginBottom: 28,
};

const form = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

function inputWrap(error) {
  return {
    border: `1px solid ${error ? 'var(--rose)' : 'var(--border)'}`,
    borderRadius: 12,
    background: 'var(--bg-secondary)',
    padding: '12px 16px',
    transition: 'border-color 0.2s',
  };
}

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'var(--text-primary)',
  fontSize: 16,
  fontFamily: 'var(--font-body)',
  textAlign: 'center',
  letterSpacing: '0.1em',
};

const errorText = {
  color: 'var(--rose)',
  fontSize: 13,
  fontWeight: 500,
  marginTop: -4,
};

const btn = {
  padding: '14px 24px',
  borderRadius: 12,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: '0 4px 16px var(--accent-glow)',
  transition: 'all 0.2s',
};

const spinner = {
  display: 'inline-block',
  width: 16,
  height: 16,
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: '#fff',
  borderRadius: '50%',
  animation: 'spin 0.6s linear infinite',
};

const hint = {
  marginTop: 20,
  fontSize: 12,
  color: 'var(--text-muted)',
};

const floatIcon = {
  position: 'absolute',
  color: 'var(--text-muted)',
  opacity: 0.15,
  pointerEvents: 'none',
};
