import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EMAIL_DOMAIN = "huvandhufund.org";
const USERNAME_PATTERN = /^[a-z0-9_.-]{3,30}$/;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { username, currentPassword } = await req.json();
    const newUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    if (!USERNAME_PATTERN.test(newUsername)) {
      return json({ error: "Usernames must be 3 to 30 letters, numbers, dots, dashes or underscores." }, 400);
    }
    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      return json({ error: "Enter your current password." }, 400);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user?.email) {
      return json({ error: "Your session has expired. Please sign in again." }, 401);
    }

    const verifier = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: passwordError } = await verifier.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });
    if (passwordError) {
      return json({ error: "Current password is incorrect." }, 403);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: updateError } = await admin.auth.admin.updateUserById(userData.user.id, {
      email: `${newUsername}@${EMAIL_DOMAIN}`,
      email_confirm: true,
    });
    if (updateError) {
      return json({ error: "That username is already taken or could not be used." }, 409);
    }

    return json({ username: newUsername }, 200);
  } catch (err) {
    console.error("update-admin-username failed", err);
    return json({ error: "Could not change the username. Please try again." }, 500);
  }
});
