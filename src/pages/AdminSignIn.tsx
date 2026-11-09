import { useState, type FormEvent } from 'react';
import { signIn } from '../lib/auth';

export function AdminSignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(username.trim(), password);
    setSubmitting(false);
    if (result) setError(result);
  };

  return (
    <main className="admin-page">
      <section className="admin-card">
        <h1 className="admin-heading">Admin sign in</h1>
        <p className="admin-muted">Sign in to update the fund total.</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Username</span>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={submitting}
            />
          </label>
          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
            />
          </label>

          {error && <p className="admin-error" role="alert">{error}</p>}

          <button type="submit" className="admin-button" disabled={submitting}>
            {submitting ? 'Please wait...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
