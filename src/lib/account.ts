import { supabase } from './supabase';
import { emailToUsername } from './auth';

type AccountResult = { error: string | null; message?: string; username?: string };

async function verifyCurrentPassword(currentPassword: string): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return 'Your session has expired. Please sign in again.';

  const { error } = await supabase.auth.signInWithPassword({
    email: data.user.email,
    password: currentPassword,
  });
  return error ? 'Current password is incorrect.' : null;
}

export async function getCurrentUsername(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.email ? emailToUsername(data.user.email) : null;
}

export async function changeUsername(newUsername: string, currentPassword: string): Promise<AccountResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { error: 'Your session has expired. Please sign in again.' };

  let response: Response;
  try {
    response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-admin-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ username: newUsername, currentPassword }),
    });
  } catch {
    return { error: 'Could not reach the server. Check your connection and try again.' };
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || typeof body?.username !== 'string') {
    return { error: body?.error ?? 'Could not change the username. Please try again.' };
  }

  await supabase.auth.refreshSession();
  return { error: null, message: `Your username is now ${body.username}.`, username: body.username };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<AccountResult> {
  const verifyError = await verifyCurrentPassword(currentPassword);
  if (verifyError) return { error: verifyError };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: 'Could not change the password. Please try a different one.' };
  return { error: null, message: 'Password updated.' };
}
