import { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData, loadSettings, saveSettings } from '../lib/storage';
import { skills as allSkillsFlat, skillPacks } from '../data/skills.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [data, setData] = useState(loadData);
  const [settings, setSettingsState] = useState(loadSettings);
  const [view, setView] = useState('repo');

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setSettings = (s) => {
    const next = typeof s === 'function' ? s(settings) : { ...settings, ...s };
    setSettingsState(next);
  };

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [tierFilter, setTierFilter] = useState(null); // 'free' | 'paid' | 'pro' | null

  // On first load, check if we landed via a redirect from Stripe cancel/success
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Handle ?view=my-skills redirect (e.g. from success page after $9 purchase)
    if (params.get('view') === 'my-skills') {
      setView('my-skills');
      return;
    }

    if (path === '/skill-detail') {
      const skillId = params.get('skill');
      if (skillId) {
        const allSkills = [
          ...(allSkillsFlat || []),
          ...(skillPacks || []).flatMap((p) => p.skills || []),
        ];
        const found = allSkills.find((s) => s.id === skillId);
        if (found) {
          setSelectedSkill(found);
          setView('skill-detail');
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goAdmin = () => setView('admin');
  const goRepo = () => { setView('repo'); setSelectedSkill(null); setTierFilter(null); };
  const goRepoWithTier = (tier) => { setView('repo'); setSelectedSkill(null); setTierFilter(tier); };
  const goMySkills = () => setView('my-skills');
  const goSkillDetail = (skill) => { setSelectedSkill(skill); setView('skill-detail'); };

  const addSkill = (skill) => {
    setData((d) => ({ ...d, skills: [skill, ...d.skills] }));
  };

  const updateSkill = (id, updates) => {
    setData((d) => ({
      ...d,
      skills: d.skills.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSkill = (id) => {
    setData((d) => ({ ...d, skills: d.skills.filter((s) => s.id !== id) }));
  };

  const addCategory = (cat) => {
    setData((d) => ({ ...d, categories: [...d.categories, cat] }));
  };

  const deleteCategory = (id) => {
    setData((d) => ({
      ...d,
      categories: d.categories.filter((c) => c.id !== id),
      skills: d.skills.filter((s) => s.category !== id),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        data,
        settings,
        setSettings,
        view,
        setView,
        selectedSkill,
        setSelectedSkill,
        goAdmin,
        goRepo,
        goRepoWithTier,
        goMySkills,
        goSkillDetail,
        tierFilter,
        setTierFilter,
        addSkill,
        updateSkill,
        deleteSkill,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
