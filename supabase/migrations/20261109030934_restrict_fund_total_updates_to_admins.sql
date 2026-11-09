/*
# Restrict fund total updates to signed-in admins

1. Modified Tables
- `fund_total`: the public status page can still read the total, but only a signed-in admin can change it.

2. Security
- Removes the anonymous update policy so the public key can no longer change the total.
- Revokes all write privileges from `anon`, and INSERT/DELETE from `authenticated`.
- Keeps SELECT for `anon` and `authenticated` so the status page keeps working.
- Grants UPDATE to `authenticated` only, limited to the single row (`id = 1`).

3. Important notes
- Admins sign in with email and password. Accounts are created from the update page.
*/

REVOKE ALL ON fund_total FROM anon;
REVOKE INSERT, DELETE ON fund_total FROM authenticated;
GRANT SELECT ON fund_total TO anon;
GRANT SELECT, UPDATE ON fund_total TO authenticated;

DROP POLICY IF EXISTS "anon_update_fund_total" ON fund_total;
DROP POLICY IF EXISTS "anon_select_fund_total" ON fund_total;

CREATE POLICY "public_select_fund_total" ON fund_total FOR SELECT
  TO anon, authenticated USING (id = 1);

DROP POLICY IF EXISTS "admin_update_fund_total" ON fund_total;
CREATE POLICY "admin_update_fund_total" ON fund_total FOR UPDATE
  TO authenticated USING (id = 1) WITH CHECK (id = 1);
