import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AdminDashboard } from './AdminDashboard';
import { AdminSignIn } from './AdminSignIn';

export function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      (async () => {
        setSession(nextSession);
      })();
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <main className="admin-page">
        <p className="admin-muted">Loading...</p>
      </main>
    );
  }

  return session ? <AdminDashboard /> : <AdminSignIn />;
}
