import { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData, loadSettings, saveSettings } from '../lib/storage';

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

  const goAdmin = () => setView('admin');
  const goRepo = () => { setView('repo'); setSelectedSkill(null); };
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
        goMySkills,
        goSkillDetail,
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
