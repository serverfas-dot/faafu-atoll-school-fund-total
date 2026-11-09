import { supabase } from './supabase';

export type FundTotal = {
  totalAmount: number;
  updatedAt: string;
};

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(amount: number): string {
  return amountFormatter.format(amount);
}

export async function fetchFundTotal(): Promise<FundTotal> {
  const { data, error } = await supabase
    .from('fund_total')
    .select('total_amount, updated_at')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw new Error('Could not load the fund total.');
  if (!data) throw new Error('The fund total has not been set.');

  const totalAmount = Number(data.total_amount);
  if (!Number.isFinite(totalAmount)) throw new Error('The stored fund total is invalid.');

  return { totalAmount, updatedAt: data.updated_at };
}

export async function saveFundTotal(totalAmount: number): Promise<void> {
  const { data, error } = await supabase
    .from('fund_total')
    .update({ total_amount: totalAmount, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select('id');

  if (error) throw new Error('Could not save the fund total.');
  if (!data || data.length === 0) throw new Error('The fund total could not be saved.');
}
