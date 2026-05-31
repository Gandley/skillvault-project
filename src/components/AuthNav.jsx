import { useClerkAuth } from '../lib/auth';
import { useApp } from '../context/AppContext';
import { hasVaultProSubscription } from '../lib/supabase';
import { Briefcase, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AuthNav() {
  const { isSignedIn, user, signOut } = useClerkAuth();
  const { goMySkills, view } = useApp();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) { setIsPro(false); return; }
    hasVaultProSubscription(user.id)
      .then(setIsPro)
      .catch(() => setIsPro(false));
  }, [isSignedIn, user]);

  if (isSignedIn && user) {
    return (
      <div style={authUser}>
        {isPro && (
          <span style={proBadge}>
            <Crown size={12} />
            Vault Pro
          </span>
        )}
        <button 
          onClick={goMySkills} 
          style={{
            ...mySkillsBtn,
            color: view === 'my-skills' ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          <Briefcase size={14} />
          My Skills
        </button>
        <span style={authEmail}>{user.primaryEmailAddress?.emailAddress || user.firstName || 'User'}</span>
        <button onClick={signOut} style={authSignout}>Sign Out</button>
      </div>
    );
  }

  const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);

  return (
    <div style={authBtns}>
      <a href={`/login.html?return_url=${returnUrl}`} style={loginBtn}>Login</a>
      <a href={`/signup.html?return_url=${returnUrl}`} style={signupBtn}>Sign Up</a>
    </div>
  );
}

const authUser = { display: 'flex', alignItems: 'center', gap: 14 };

const proBadge = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '4px 10px', borderRadius: 100,
  background: 'rgba(167,139,250,0.15)',
  border: '1px solid rgba(167,139,250,0.3)',
  color: '#a78bfa',
  fontSize: 12, fontWeight: 700,
  letterSpacing: '0.03em',
  fontFamily: 'var(--font-body)',
};
const authEmail = { fontSize: 14, color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const authSignout = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13,
  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
};

const mySkillsBtn = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card)', fontSize: 13,
  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
};

const authBtns = { display: 'flex', alignItems: 'center', gap: 10 };

const loginBtn = {
  padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13,
  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
};

const signupBtn = {
  padding: '8px 18px', borderRadius: 10,
  background: 'var(--accent)', color: '#fff', fontSize: 13,
  fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s',
  display: 'inline-flex', alignItems: 'center',
};
