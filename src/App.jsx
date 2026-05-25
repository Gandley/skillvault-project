import { AppProvider, useApp } from './context/AppContext';
import RepoView from './views/RepoView';
import MySkillsView from './views/MySkillsView';
import './index.css';

function Router() {
  const { view } = useApp();
  if (view === 'my-skills') return <MySkillsView />;
  return <RepoView />;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
