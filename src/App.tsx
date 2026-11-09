import { AdminPage } from './pages/AdminPage';
import { StatusPage } from './pages/StatusPage';

export function App() {
  if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin')) {
    return <AdminPage />;
  }
  return <StatusPage />;
}
