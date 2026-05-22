import { AppProvider, useApp } from './context/AppContext';
import GateView from './views/GateView';
import RepoView from './views/RepoView';
import AdminView from './views/AdminView';
import './index.css';

function Router() {
  const { view } = useApp();
  if (view === 'gate') return <GateView />;
  if (view === 'admin') return <AdminView />;
  return <RepoView />;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
