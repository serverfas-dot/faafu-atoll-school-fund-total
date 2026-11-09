/*
# Pin search path on the fund total backup function

1. Modified Functions
- `record_fund_total_backup`: fixes the schema search path so the function always resolves tables in the public schema.

2. Security
- No change to who can run it or what it writes; this only hardens how it looks up tables.
*/

ALTER FUNCTION record_fund_total_backup() SET search_path = public;
