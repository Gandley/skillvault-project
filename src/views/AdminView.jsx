import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { setPasscode } from '../lib/storage';
import {
  ArrowLeft, Plus, Trash2, Save, Settings, Palette, Code, Globe, Sparkles,
  Megaphone, Search, Zap, Video, Layout, Check
} from 'lucide-react';

const iconMap = {
  Globe, Palette, Video, Megaphone, Search, Code, Zap, Sparkles, Layout,
};

export default function AdminView() {
  const { data, settings, setSettings, goRepo, addSkill, updateSkill, deleteSkill, addCategory, deleteCategory } = useApp();
  const [tab, setTab] = useState('skills');
  const [passcode, setPasscodeState] = useState('');
  const [editingSkill, setEditingSkill] = useState(null);
  const [newSkill, setNewSkill] = useState(null);
  const [newCat, setNewCat] = useState(null);
  const [saved, setSaved] = useState(false);

  const colors = ['green', 'amber', 'rose', 'cyan', 'violet'];

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handlePasscodeSave = () => {
    if (passcode.trim()) {
      setPasscode(passcode.trim());
      setPasscodeState('');
      showSaved();
    }
  };

  const handleAddSkill = () => {
    setNewSkill({
      id: 'skill-' + Date.now(),
      name: '',
      description: '',
      category: data.categories.find((c) => c.id !== 'all')?.id || '',
      status: 'active',
      version: '1.0.0',
      installs: 0,
      rating: 5.0,
      author: 'You',
      tags: [],
      icon: 'Globe',
      color: 'green',
    });
  };

  const handleSaveSkill = (skill) => {
    if (!skill.name.trim()) return;
    if (data.skills.find((s) => s.id === skill.id)) {
      updateSkill(skill.id, skill);
    } else {
      addSkill(skill);
    }
    setEditingSkill(null);
    setNewSkill(null);
    showSaved();
  };

  const handleDeleteSkill = (id) => {
    if (confirm('Delete this skill?')) {
      deleteSkill(id);
    }
  };

  return (
    <div style={page}>
      <style>{`
        .admin-row:hover { background: var(--bg-card-hover); }
        .admin-input { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--text-primary); font-size: 13; font-family: var(--font-body); outline: none; }
        .admin-input:focus { border-color: var(--accent); }
        .admin-select { composes: admin-input; padding-right: 28px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6f82' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; }
        .admin-label { font-size: 11; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 6; display: block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={header}>
        <div style={headerInner}>
          <div style={headerLeft}>
            <button onClick={goRepo} style={backBtn}>
              <ArrowLeft size={16} />
              Back to Site
            </button>
            <h1 style={headerTitle}>Admin Panel</h1>
          </div>
          <div style={headerRight}>
            {saved && (
              <span style={savedBadge}><Check size={14} /> Saved</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={tabs}>
          {[
            { id: 'skills', label: 'Skills', icon: Code },
            { id: 'categories', label: 'Categories', icon: Layout },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...tabBtn,
                background: tab === t.id ? 'var(--bg-card)' : 'transparent',
                color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                borderColor: tab === t.id ? 'var(--border)' : 'transparent',
              }}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={content}>
        {tab === 'skills' && (
          <div>
            <div style={sectionHeader}>
              <span style={count}>{data.skills.length} skills</span>
              <button onClick={handleAddSkill} style={addBtn}>
                <Plus size={14} /> Add Skill
              </button>
            </div>

            <div style={table}>
              <div style={thead}>
                <span>Skill</span>
                <span>Category</span>
                <span>Version</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {data.skills.map((skill) => (
                <div key={skill.id} style={row} className="admin-row">
                  <div style={cell}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{skill.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{skill.description.slice(0, 50)}...</div>
                  </div>
                  <div style={cell}>{skill.category}</div>
                  <div style={cell}>v{skill.version}</div>
                  <div style={cell}>
                    <span style={{
                      ...statusBadge,
                      background: skill.status === 'active' ? 'var(--green-bg)' : 'var(--amber-bg)',
                      color: skill.status === 'active' ? 'var(--green)' : 'var(--amber)',
                    }}>
                      {skill.status}
                    </span>
                  </div>
                  <div style={{ ...cell, display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditingSkill(skill)} style={iconBtn}>Edit</button>
                    <button onClick={() => handleDeleteSkill(skill.id)} style={dangerBtn}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit/Add Modal */}
            {(editingSkill || newSkill) && (
              <SkillEditor
                skill={editingSkill || newSkill}
                categories={data.categories}
                onSave={handleSaveSkill}
                onCancel={() => {
                  setEditingSkill(null);
                  setNewSkill(null);
                }}
              />
            )}
          </div>
        )}

        {tab === 'categories' && (
          <div>
            <div style={sectionHeader}>
              <span style={count}>{data.categories.filter((c) => c.id !== 'all').length} categories</span>
              <button onClick={() => setNewCat({ id: '', label: '', icon: 'Globe' })} style={addBtn}>
                <Plus size={14} /> Add Category
              </button>
            </div>

            <div style={table}>
              {data.categories.filter((c) => c.id !== 'all').map((cat) => (
                <div key={cat.id} style={row} className="admin-row">
                  <div style={cell}>
                    <span style={{ fontWeight: 600 }}>{cat.label}</span>
                  </div>
                  <div style={cell}>{cat.id}</div>
                  <div style={cell}>{cat.icon}</div>
                  <div style={cell}>
                    <button onClick={() => deleteCategory(cat.id) && showSaved()} style={dangerBtn}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div style={settingsGrid}>
            <div style={settingsCard}>
              <h3 style={settingsTitle}><Settings size={16} /> Gate Page</h3>
              <label className="admin-label">Site Title</label>
              <input
                className="admin-input"
                value={settings.title}
                onChange={(e) => setSettings({ title: e.target.value })}
              />

              <label className="admin-label" style={{ marginTop: 14 }}>Subtitle</label>
              <input
                className="admin-input"
                value={settings.subtitle}
                onChange={(e) => setSettings({ subtitle: e.target.value })}
              />

              <label className="admin-label" style={{ marginTop: 14 }}>Hero Text</label>
              <input
                className="admin-input"
                value={settings.heroText}
                onChange={(e) => setSettings({ heroText: e.target.value })}
              />

              <label className="admin-label" style={{ marginTop: 14 }}>Description</label>
              <textarea
                className="admin-input"
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ description: e.target.value })}
              />
            </div>

            <div style={settingsCard}>
              <h3 style={settingsTitle}><Palette size={16} /> Security</h3>
              <label className="admin-label">Access Passcode</label>
              <input
                className="admin-input"
                type="text"
                placeholder="Enter new passcode"
                value={passcode}
                onChange={(e) => setPasscodeState(e.target.value)}
              />
              <button onClick={handlePasscodeSave} style={{ ...addBtn, marginTop: 10 }}>
                <Save size={14} /> Update Passcode
              </button>
              <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Current code is hidden for security.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillEditor({ skill, categories, onSave, onCancel }) {
  const [form, setForm] = useState({ ...skill });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={modalOverlay}>
      <div style={modal}>
        <h3 style={{ marginBottom: 20, fontFamily: 'var(--font-display)', fontSize: 18 }}>{skill.name ? 'Edit Skill' : 'New Skill'}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label className="admin-label">Name</label>
            <input className="admin-input" value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Version</label>
            <input className="admin-input" value={form.version} onChange={(e) => update('version', e.target.value)} />
          </div>
        </div>

        <label className="admin-label" style={{ marginTop: 14 }}>Description</label>
        <textarea className="admin-input" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 14 }}>
          <div>
            <label className="admin-label">Category</label>
            <select className="admin-input" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {categories.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Status</label>
            <select className="admin-input" value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="beta">Beta</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Color</label>
            <select className="admin-input" value={form.color} onChange={(e) => update('color', e.target.value)}>
              {['green','amber','rose','cyan','violet'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="admin-label" style={{ marginTop: 14 }}>Tags (comma separated)</label>
        <input className="admin-input" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} onChange={(e) => update('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={onCancel} style={{ ...btnBase, background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ ...btnBase, background: 'var(--accent)', color: '#fff' }}>Save Skill</button>
        </div>
      </div>
    </div>
  );
}

const page = { minHeight: '100vh', background: 'var(--bg-primary)' };
const header = { borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' };
const headerInner = { maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
const headerLeft = { display: 'flex', alignItems: 'center', gap: 16 };
const headerTitle = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 };
const headerRight = { display: 'flex', alignItems: 'center', gap: 10 };
const backBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' };
const savedBadge = { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--green)', background: 'var(--green-bg)', padding: '4px 10px', borderRadius: 6, fontWeight: 600 };
const tabs = { maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' };
const tabBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 13, fontWeight: 500, border: '1px solid', borderRadius: '8px 8px 0 0', borderBottom: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', position: 'relative', top: 1 };
const content = { maxWidth: 1200, margin: '0 auto', padding: '24px' };
const sectionHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 };
const count = { fontSize: 13, color: 'var(--text-muted)' };
const addBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' };
const table = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' };
const thead = { display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 0.8fr 1fr', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' };
const row = { display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 0.8fr 1fr', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-secondary)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' };
const cell = {};
const statusBadge = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 100, letterSpacing: '0.04em' };
const iconBtn = { padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' };
const dangerBtn = { padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--rose)', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 };
const modal = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 520, maxHeight: '85vh', overflow: 'auto' };
const settingsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 };
const settingsCard = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 };
const settingsTitle = { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 16 };
const btnBase = { padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' };
