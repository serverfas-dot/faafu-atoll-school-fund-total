import { useEffect, useState } from 'react';
import { fetchFundTotal, formatAmount, type FundTotal } from '../lib/fundTotal';

const REFRESH_INTERVAL_MS = 60_000;

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: FundTotal };

export function StatusPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchFundTotal();
        if (!cancelled) setState({ status: 'ready', data });
      } catch {
        if (!cancelled) {
          setState((previous) => (previous.status === 'ready' ? previous : { status: 'error' }));
        }
      }
    };

    load();
    const intervalId = window.setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="status-page">
      <section className="status-card" aria-live="polite">
        <p className="status-title">Huvandhu Fund Total</p>
        {state.status === 'loading' && <p className="status-muted">Loading...</p>}
        {state.status === 'error' && (
          <p className="status-muted">The total is unavailable right now.</p>
        )}
        {state.status === 'ready' && (
          <p className="status-amount">{formatAmount(state.data.totalAmount)}</p>
        )}
      </section>
    </main>
  );
}
