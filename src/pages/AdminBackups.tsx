import { useEffect, useState } from 'react';
import { createManualBackup, listBackups, type FundTotalBackup } from '../lib/backups';
import { formatAmount, saveFundTotal } from '../lib/fundTotal';

type Message = { type: 'error' | 'success'; text: string };

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const BACKUP_LABEL: Record<FundTotalBackup['backupType'], string> = {
  automatic: 'Saved automatically',
  manual: 'Manual backup',
};

export function AdminBackups() {
  const [backups, setBackups] = useState<FundTotalBackup[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState<'creating' | number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const loadBackups = async () => {
    try {
      setBackups(await listBackups());
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateBackup = async () => {
    setMessage(null);
    setBusy('creating');
    try {
      await createManualBackup();
      setMessage({ type: 'success', text: 'Backup created.' });
      await loadBackups();
    } catch {
      setMessage({ type: 'error', text: 'Could not create the backup. Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async (backup: FundTotalBackup) => {
    setMessage(null);
    setBusy(backup.id);
    try {
      await saveFundTotal(backup.totalAmount);
      setConfirmId(null);
      setMessage({ type: 'success', text: `Total restored to ${formatAmount(backup.totalAmount)}.` });
      await loadBackups();
    } catch {
      setMessage({ type: 'error', text: 'Could not restore this backup. Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="admin-card">
      <h2 className="admin-subheading">Backups</h2>
      <p className="admin-muted">
        Every change to the total is saved here. Restore any earlier total from this list.
      </p>

      <button
        type="button"
        className="admin-button"
        onClick={handleCreateBackup}
        disabled={busy !== null}
      >
        {busy === 'creating' ? 'Creating...' : 'Create backup now'}
      </button>

      {message && (
        <p className={message.type === 'error' ? 'admin-error' : 'admin-success'} role="status">
          {message.text}
        </p>
      )}

      {loadFailed && <p className="admin-error">Could not load backups.</p>}
      {!loadFailed && backups === null && <p className="admin-muted">Loading backups...</p>}
      {backups?.length === 0 && <p className="admin-muted">No backups yet.</p>}

      {backups && backups.length > 0 && (
        <ul className="backup-list">
          {backups.map((backup) => (
            <li key={backup.id} className="backup-item">
              <div className="backup-info">
                <span className="backup-amount">{formatAmount(backup.totalAmount)}</span>
                <span className="admin-muted">
                  {BACKUP_LABEL[backup.backupType]} · {dateFormatter.format(new Date(backup.createdAt))}
                </span>
              </div>

              {confirmId === backup.id ? (
                <div className="backup-confirm">
                  <button
                    type="button"
                    className="admin-button"
                    onClick={() => handleRestore(backup)}
                    disabled={busy !== null}
                  >
                    {busy === backup.id ? 'Restoring...' : 'Confirm restore'}
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() => setConfirmId(null)}
                    disabled={busy !== null}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={() => setConfirmId(backup.id)}
                  disabled={busy !== null}
                >
                  Restore
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
