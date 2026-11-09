/*
# Add fund total backup history and lock admin access to one account

1. New Tables
- `fund_total_backups`: a history of fund totals.
  - `id` (bigint, generated identifier)
  - `total_amount` (numeric(14,2)) the total stored in that backup
  - `backup_type` ('automatic' or 'manual')
  - `created_at` (timestamptz) when the backup was made

2. Automatic backups
- Every time the fund total changes (sheet upload or restore), the previous state is not lost: the new total is written to `fund_total_backups` automatically.
- A starting backup of the current total is recorded once.

3. Security
- `fund_total_backups` has row level security enabled. Only the admin account can read or add backups.
- The admin account is the single email address `admin@huvandhufund.org`. Writes to `fund_total` and backups are allowed only for that account.
- The public status page can still read `fund_total`.

4. Important notes
- Restoring a backup changes the total to that backup's value and records that change as a new automatic backup, so a restore can itself be undone.
*/

CREATE TABLE IF NOT EXISTS fund_total_backups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  total_amount numeric(14,2) NOT NULL,
  backup_type text NOT NULL CHECK (backup_type IN ('automatic', 'manual')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fund_total_backups ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON fund_total_backups FROM anon;
GRANT SELECT, INSERT ON fund_total_backups TO authenticated;

DROP POLICY IF EXISTS "admin_select_fund_total_backups" ON fund_total_backups;
CREATE POLICY "admin_select_fund_total_backups" ON fund_total_backups FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'email' = 'admin@huvandhufund.org');

DROP POLICY IF EXISTS "admin_insert_fund_total_backups" ON fund_total_backups;
CREATE POLICY "admin_insert_fund_total_backups" ON fund_total_backups FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'admin@huvandhufund.org');

CREATE OR REPLACE FUNCTION record_fund_total_backup()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO fund_total_backups (total_amount, backup_type)
  VALUES (NEW.total_amount, 'automatic');
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION record_fund_total_backup() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS fund_total_backup_trigger ON fund_total;
CREATE TRIGGER fund_total_backup_trigger
  AFTER UPDATE OF total_amount ON fund_total
  FOR EACH ROW
  WHEN (OLD.total_amount IS DISTINCT FROM NEW.total_amount)
  EXECUTE FUNCTION record_fund_total_backup();

INSERT INTO fund_total_backups (total_amount, backup_type)
SELECT total_amount, 'automatic' FROM fund_total
WHERE id = 1 AND NOT EXISTS (SELECT 1 FROM fund_total_backups);

DROP POLICY IF EXISTS "admin_update_fund_total" ON fund_total;
CREATE POLICY "admin_update_fund_total" ON fund_total FOR UPDATE
  TO authenticated
  USING (id = 1 AND auth.jwt() ->> 'email' = 'admin@huvandhufund.org')
  WITH CHECK (id = 1 AND auth.jwt() ->> 'email' = 'admin@huvandhufund.org');
