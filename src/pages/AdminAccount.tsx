import { useEffect, useState, type FormEvent } from 'react';
import { changePassword, changeUsername, getCurrentUsername } from '../lib/account';

type Feedback = { type: 'error' | 'success'; text: string };

function FeedbackMessage({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;
  return (
    <p className={feedback.type === 'error' ? 'admin-error' : 'admin-success'} role="status">
      {feedback.text}
    </p>
  );
}

function UsernameForm() {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    getCurrentUsername().then(setCurrentUsername);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    const result = await changeUsername(newUsername.trim(), currentPassword);
    setSubmitting(false);
    if (result.error) {
      setFeedback({ type: 'error', text: result.error });
      return;
    }
    setFeedback({ type: 'success', text: result.message ?? 'Username updated.' });
    setCurrentUsername(result.username ?? null);
    setNewUsername('');
    setCurrentPassword('');
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {currentUsername && (
        <p className="admin-current">
          Current username: <strong>{currentUsername}</strong>
        </p>
      )}
      <label className="admin-field">
        <span>New username</span>
        <input
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9._-]+"
          title="Letters, numbers, dots, dashes or underscores"
          value={newUsername}
          onChange={(event) => setNewUsername(event.target.value)}
          disabled={submitting}
        />
      </label>
      <label className="admin-field">
        <span>Current password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={submitting}
        />
      </label>
      <button type="submit" className="admin-button" disabled={submitting}>
        {submitting ? 'Saving...' : 'Change username'}
      </button>
      <FeedbackMessage feedback={feedback} />
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'The new passwords do not match.' });
      return;
    }

    setSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setSubmitting(false);
    if (result.error) {
      setFeedback({ type: 'error', text: result.error });
      return;
    }
    setFeedback({ type: 'success', text: result.message ?? 'Password updated.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="admin-field">
        <span>Current password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          disabled={submitting}
        />
      </label>
      <label className="admin-field">
        <span>New password (at least 6 characters)</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          disabled={submitting}
        />
      </label>
      <label className="admin-field">
        <span>Confirm new password</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={submitting}
        />
      </label>
      <button type="submit" className="admin-button" disabled={submitting}>
        {submitting ? 'Saving...' : 'Change password'}
      </button>
      <FeedbackMessage feedback={feedback} />
    </form>
  );
}

export function AdminAccount() {
  return (
    <>
      <section className="admin-card">
        <h2 className="admin-subheading">Change username</h2>
        <p className="admin-muted">Letters, numbers, dots, dashes or underscores.</p>
        <UsernameForm />
      </section>

      <section className="admin-card">
        <h2 className="admin-subheading">Change password</h2>
        <PasswordForm />
      </section>
    </>
  );
}
