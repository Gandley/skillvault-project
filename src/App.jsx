import { AppProvider, useApp } from './context/AppContext';
import RepoView from './views/RepoView';
import MySkillsView from './views/MySkillsView';
import SkillDetailView from './views/SkillDetailView';
import './index.css';

function Router() {
  const { view } = useApp();
  if (view === 'my-skills') return <MySkillsView />;
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
