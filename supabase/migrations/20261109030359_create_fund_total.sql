/*
# Create fund total table

1. New Tables
- `fund_total`: a single-row table holding the Huvandhu Fund total shown on the public status page.
  - `id` (integer, primary key, always 1 so there is only ever one row)
  - `total_amount` (numeric(14,2), not null) the total taken from the data sheet
  - `updated_at` (timestamptz) when the total was last saved from the sheet
- Seeds the row with the current total of 587,830.00.

2. Security
- Enables row level security on `fund_total`.
- The status page has no sign-in, so `anon` and `authenticated` roles get SELECT and UPDATE only.
- No INSERT or DELETE is granted, so the row cannot be removed or duplicated.
- Policies are scoped to the single row (`id = 1`).

3. Important notes
- Anyone with the app's public address can read and change the total. Sign-in is not part of this app.
*/

CREATE TABLE IF NOT EXISTS fund_total (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_amount numeric(14,2) NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fund_total ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON fund_total TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_fund_total" ON fund_total;
CREATE POLICY "anon_select_fund_total" ON fund_total FOR SELECT
  TO anon, authenticated USING (id = 1);

DROP POLICY IF EXISTS "anon_update_fund_total" ON fund_total;
CREATE POLICY "anon_update_fund_total" ON fund_total FOR UPDATE
  TO anon, authenticated USING (id = 1) WITH CHECK (id = 1);

INSERT INTO fund_total (id, total_amount)
VALUES (1, 587830.00)
ON CONFLICT (id) DO NOTHING;
