import { useState } from 'react';
import { X, Bug, CheckCircle, AlertCircle } from 'lucide-react';

export default function BugReportModal({ skillName, onClose }) {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !description.trim()) return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName, userEmail: email.trim(), description: description.trim() }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modal}>
        {/* Header */}
        <div style={header}>
          <div style={headerLeft}>
            <div style={iconWrap}>
              <Bug size={18} color="var(--amber)" />
            </div>
            <span style={headerTitle}>Report a Bug</span>
          </div>
          <button onClick={onClose} style={closeBtn} aria-label="Close">
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {status === 'success' ? (
          <div style={successState}>
            <CheckCircle size={40} color="var(--green)" style={{ marginBottom: 12 }} />
            <h3 style={successTitle}>Report Sent</h3>
            <p style={successText}>Thanks — your bug report has been submitted. Our team will review it shortly.</p>
            <button onClick={onClose} style={doneBtn}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={form}>
            <div style={field}>
              <label style={label}>Skill</label>
              <input
                type="text"
                value={skillName}
                readOnly
                style={{ ...input, color: 'var(--text-muted)', cursor: 'default' }}
              />
            </div>

            <div style={field}>
              <label style={label}>Your Email <span style={required}>*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={input}
                disabled={status === 'submitting'}
              />
            </div>

            <div style={field}>
              <label style={label}>Describe the Bug <span style={required}>*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? What did you expect to happen? Any steps to reproduce?"
                required
                rows={5}
                style={textarea}
                disabled={status === 'submitting'}
              />
            </div>

            {status === 'error' && (
              <div style={errorMsg}>
                <AlertCircle size={14} />
                <span>Something went wrong. Please try again.</span>
              </div>
            )}

            <div style={footer}>
              <button type="button" onClick={onClose} style={cancelBtn} disabled={status === 'submitting'}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'submitting' || !email.trim() || !description.trim()}
                style={{
                  ...submitBtn,
                  opacity: status === 'submitting' || !email.trim() || !description.trim() ? 0.6 : 1,
                }}
              >
                {status === 'submitting' ? 'Sending...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '24px',
};
const modal = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 20, width: '100%', maxWidth: 480,
  boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  overflow: 'hidden',
};
const header = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '20px 24px', borderBottom: '1px solid var(--border)',
};
const headerLeft = { display: 'flex', alignItems: 'center', gap: 10 };
const iconWrap = {
  width: 34, height: 34, borderRadius: 8,
  background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const headerTitle = { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' };
const closeBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center',
  transition: 'background 0.15s',
};
const form = { padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 };
const field = { display: 'flex', flexDirection: 'column', gap: 6 };
const label = { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' };
const required = { color: 'var(--amber)' };
const input = {
  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)',
  fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
  width: '100%', boxSizing: 'border-box',
};
const textarea = {
  ...input,
  resize: 'vertical', minHeight: 100, lineHeight: 1.6,
};
const errorMsg = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 13, color: '#f87171',
  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
  borderRadius: 8, padding: '10px 14px',
};
const footer = { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 };
const cancelBtn = {
  padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)',
  background: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
  fontFamily: 'var(--font-body)', cursor: 'pointer',
};
const submitBtn = {
  padding: '10px 20px', borderRadius: 10, border: 'none',
  background: 'var(--amber)', color: '#0b0c10', fontSize: 14, fontWeight: 700,
  fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'opacity 0.2s',
};
const successState = {
  padding: '40px 24px', display: 'flex', flexDirection: 'column',
  alignItems: 'center', textAlign: 'center', gap: 4,
};
const successTitle = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 };
const successText = { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 340, marginBottom: 20 };
const doneBtn = {
  padding: '10px 28px', borderRadius: 10, border: 'none',
  background: 'var(--green-bg)', color: 'var(--green)', fontSize: 14, fontWeight: 700,
  fontFamily: 'var(--font-body)', cursor: 'pointer',
  border: '1px solid rgba(52,211,153,0.2)',
};
