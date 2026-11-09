import { useEffect, useState, type FormEvent } from 'react';
import { fetchFundTotal, formatAmount, saveFundTotal, type FundTotal } from '../lib/fundTotal';

type Message = { type: 'error' | 'success'; text: string };

const AMOUNT_PATTERN = /^\d{1,12}(\.\d{1,2})?$/;

export function AdminTotal() {
  const [current, setCurrent] = useState<FundTotal | null>(null);
  const [currentFailed, setCurrentFailed] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const loadCurrent = async () => {
    try {
      setCurrent(await fetchFundTotal());
      setCurrentFailed(false);
    } catch {
      setCurrentFailed(true);
    }
  };

  useEffect(() => {
    loadCurrent();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const cleaned = amountInput.trim().replace(/,/g, '');
    if (!AMOUNT_PATTERN.test(cleaned)) {
      setMessage({ type: 'error', text: 'Enter a valid amount, for example 587830.00.' });
      return;
    }

    setSubmitting(true);
    try {
      await saveFundTotal(Number(cleaned));
      setAmountInput('');
      setMessage({ type: 'success', text: 'The status page now shows the new total.' });
      await loadCurrent();
    } catch {
      setMessage({ type: 'error', text: 'Could not save the total. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-card">
      <h2 className="admin-subheading">Update fund total</h2>
      <p className="admin-muted">Type the new total from your sheet. The status page updates when you save.</p>

      {current && (
        <p className="admin-current">
          Currently shown: <strong>{formatAmount(current.totalAmount)}</strong>
        </p>
      )}
      {currentFailed && <p className="admin-error">Could not load the current total.</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>New total</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="587830.00"
            required
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            disabled={submitting}
          />
        </label>
        <button type="submit" className="admin-button" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save total'}
        </button>
      </form>

      {message && (
        <p className={message.type === 'error' ? 'admin-error' : 'admin-success'} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
