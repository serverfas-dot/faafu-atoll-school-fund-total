import { supabase } from './supabase';
import { fetchFundTotal } from './fundTotal';

export type FundTotalBackup = {
  id: number;
  totalAmount: number;
  backupType: 'automatic' | 'manual';
  createdAt: string;
};

const BACKUP_LIMIT = 50;

export async function listBackups(): Promise<FundTotalBackup[]> {
  const { data, error } = await supabase
    .from('fund_total_backups')
    .select('id, total_amount, backup_type, created_at')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(BACKUP_LIMIT);

  if (error) throw new Error('Could not load backups.');

  return (data ?? []).map((row) => ({
    id: Number(row.id),
    totalAmount: Number(row.total_amount),
    backupType: row.backup_type === 'manual' ? 'manual' : 'automatic',
    createdAt: row.created_at,
  }));
}

export async function createManualBackup(): Promise<void> {
  const current = await fetchFundTotal();
  const { data, error } = await supabase
    .from('fund_total_backups')
    .insert({ total_amount: current.totalAmount, backup_type: 'manual' })
    .select('id');

  if (error || !data || data.length === 0) throw new Error('Could not create the backup.');
}
