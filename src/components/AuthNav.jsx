import { useClerkAuth } from '../lib/auth';

export default function AuthNav() {
  const { isSignedIn, user, signInRedirect, signUpRedirect, signOut } = useClerkAuth();

  if (isSignedIn && user) {
    return (
      <div style={authUser}>
        <span style={authEmail}>{user.primaryEmailAddress?.emailAddress || user.firstName || 'User'}</span>
        <button onClick={signOut} style={authSignout}>Sign Out</button>
      </div>
    );
  }

  return (
    <div style={authBtns}>
      <button onClick={() => signInRedirect()} style={loginBtn}>Login</button>
      <button onClick={() => signUpRedirect()} style={signupBtn}>Sign Up</button>
    </div>
  );
}

const authUser = { display: 'flex', alignItems: 'center', gap: 14 };
const authEmail = { fontSize: 14, color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const authSignout = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13,
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
  display: 'inline-flex', alignItems: 'center', border: 'none', cursor: 'pointer',
};
