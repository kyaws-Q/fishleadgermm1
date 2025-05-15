import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Checks if Supabase connection and authentication are working.
 * Shows connection status and user info if logged in.
 */
export const SupabaseCheck = () => {
  const [status, setStatus] = useState<string>("Checking...");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function check() {
      try {
        // Try a simple query
        const { data, error } = await supabase.from("buyers").select("*").limit(1);
        if (error) {
          setStatus("❌ Supabase query failed");
          setError(error.message);
        } else {
          setStatus("✅ Supabase query succeeded");
        }
        // Check auth
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (userData?.user) {
          setUser(userData.user);
        }
        if (authError) {
          setError(authError.message);
        }
      } catch (e: unknown) {
        setStatus("❌ Error connecting to Supabase");
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    }
    check();
  }, []);

  return (
    <div className="rounded border p-4 bg-gray-50 mt-4">
      <div className="font-semibold mb-2">Supabase Connection Check</div>
      <div>Status: <span className="font-mono">{status}</span></div>
      {user && (
        <div className="mt-2 text-green-700">
          Logged in as: <span className="font-mono">{user.email}</span>
        </div>
      )}
      {error && (
        <div className="mt-2 text-red-600">Error: {error}</div>
      )}
    </div>
  );
};
