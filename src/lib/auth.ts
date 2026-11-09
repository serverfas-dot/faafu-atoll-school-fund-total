import { supabase } from './supabase';

export const ADMIN_EMAIL_DOMAIN = 'huvandhufund.org';

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
}

export function emailToUsername(email: string): string {
  const suffix = `@${ADMIN_EMAIL_DOMAIN}`;
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
}

export async function signIn(username: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (!error) return null;
  return error.message.toLowerCase().includes('invalid login')
    ? 'Username or password is incorrect.'
    : 'Could not sign in. Please try again.';
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
