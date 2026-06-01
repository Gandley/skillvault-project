import { AppProvider, useApp } from './context/AppContext';
import RepoView from './views/RepoView';
import SettingsView from './views/SettingsView';
import SkillDetailView from './views/SkillDetailView';
import './index.css';

function Router() {
  const { view } = useApp();
  if (view === 'settings') return <SettingsView />;
  if (view === 'skill-detail') return <SkillDetailView />;
  return <RepoView />;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
