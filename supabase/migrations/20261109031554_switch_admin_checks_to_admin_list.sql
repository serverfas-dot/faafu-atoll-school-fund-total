/*
# Admin list keyed by user ID instead of a fixed email

1. New Tables
- `fund_admins`: the list of accounts allowed to manage the fund total. Each row is one user ID from the sign-in system.
  - `user_id` (uuid, primary key) the signed-in user's ID

2. Security
- Row level security is enabled. A signed-in user can only see their own row. Nobody can add or change rows through the app; admins are added by the team in the database.
- The fund total update policy and the backup policies now allow access only when the signed-in user appears in `fund_admins`. They no longer check a fixed email address, so the admin username can change safely.

3. Important notes
- Existing admin rows are added separately from this migration so no user data is stored in the schema history.
*/

CREATE TABLE IF NOT EXISTS fund_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE fund_admins ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON fund_admins FROM anon;
GRANT SELECT ON fund_admins TO authenticated;

DROP POLICY IF EXISTS "admin_select_own_admin_row" ON fund_admins;
CREATE POLICY "admin_select_own_admin_row" ON fund_admins FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_select_fund_total_backups" ON fund_total_backups;
CREATE POLICY "admin_select_fund_total_backups" ON fund_total_backups FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM fund_admins WHERE fund_admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_insert_fund_total_backups" ON fund_total_backups;
CREATE POLICY "admin_insert_fund_total_backups" ON fund_total_backups FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM fund_admins WHERE fund_admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_fund_total" ON fund_total;
CREATE POLICY "admin_update_fund_total" ON fund_total FOR UPDATE
  TO authenticated
  USING (id = 1 AND EXISTS (SELECT 1 FROM fund_admins WHERE fund_admins.user_id = auth.uid()))
  WITH CHECK (id = 1 AND EXISTS (SELECT 1 FROM fund_admins WHERE fund_admins.user_id = auth.uid()));
