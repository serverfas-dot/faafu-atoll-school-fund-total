import { useState } from 'react';
import { signOut } from '../lib/auth';
import { AdminAccount } from './AdminAccount';
import { AdminBackups } from './AdminBackups';
import { AdminTotal } from './AdminTotal';

type Tab = 'update' | 'backups' | 'account';

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('update');

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <h1 className="admin-heading">Fund admin</h1>
          <button type="button" className="admin-button admin-button-secondary" onClick={() => signOut()}>
            Sign out
          </button>
        </header>

        <nav className="admin-tabs" aria-label="Admin sections">
          <button
            type="button"
            className="admin-tab"
            aria-pressed={tab === 'update'}
            onClick={() => setTab('update')}
          >
            Update total
          </button>
          <button
            type="button"
            className="admin-tab"
            aria-pressed={tab === 'backups'}
            onClick={() => setTab('backups')}
          >
            Backups
          </button>
          <button
            type="button"
            className="admin-tab"
            aria-pressed={tab === 'account'}
            onClick={() => setTab('account')}
          >
            Account
          </button>
        </nav>

        {tab === 'update' && <AdminTotal />}
        {tab === 'backups' && <AdminBackups />}
        {tab === 'account' && <AdminAccount />}
      </div>
    </main>
  );
}
