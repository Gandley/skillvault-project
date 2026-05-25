import { AppProvider } from './context/AppContext';
import RepoView from './views/RepoView';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <RepoView />
    </AppProvider>
  );
}
