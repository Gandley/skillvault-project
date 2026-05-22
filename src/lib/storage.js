// localStorage helpers for persistence
import { skills as defaultSkills, categories as defaultCategories } from '../data/skills.js';

const STORAGE_KEY = 'skillvault_data';
const PASSCODE_KEY = 'skillvault_passcode';
const UNLOCKED_KEY = 'skillvault_unlocked';
const SETTINGS_KEY = 'skillvault_settings';

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { skills: defaultSkills, categories: defaultCategories };
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getPasscode() {
  return localStorage.getItem(PASSCODE_KEY) || 'Gandley2026';
}

export function setPasscode(code) {
  localStorage.setItem(PASSCODE_KEY, code);
}

export function isUnlocked() {
  return localStorage.getItem(UNLOCKED_KEY) === 'true';
}

export function setUnlocked(val) {
  localStorage.setItem(UNLOCKED_KEY, val ? 'true' : 'false');
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    title: 'SkillVault',
    subtitle: 'AI-Powered Skills for Modern Teams',
    heroText: 'Discover & Deploy',
    description: 'Browse, install, and manage production-ready skills for your AI agents. From websites to video, marketing to engineering.',
    logoText: 'SkillVault',
    accentColor: '#6366f1',
  };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PASSCODE_KEY);
  localStorage.removeItem(UNLOCKED_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
