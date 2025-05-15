/**
 * Supabase Client Configuration
 *
 * This module initializes and exports the Supabase client instance used throughout the application.
 * It handles authentication persistence, connection validation, and provides utility functions
 * for safer database operations.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Environment variables for Supabase configuration
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

// Ensure environment variables are provided
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase configuration. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
      "are set in your environment variables.",
  );
}

/**
 * Initialize the Supabase client with robust configuration
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: "fish-fin-ledger-auth",
    },
    global: {
      headers: {
        "x-application-name": "fish-fin-ledger",
      },
    },
  },
);

/**
 * Validates the connection to Supabase
 *
 * @returns Promise resolving to a boolean indicating connection status
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch (err) {
    // Only log in development
    if (import.meta.env.DEV) {
      console.error("Supabase connection check failed:", err);
    }
    return false;
  }
};

/**
 * Type for Supabase query functions that return data and error objects
 */
type QueryFunction<T> = () => Promise<{
  data: T | null;
  error: Error | null;
}>;

/**
 * Executes a Supabase query with standardized error handling
 *
 * @param queryFn - Function that executes a Supabase query
 * @param errorHandler - Optional custom error handler
 * @returns Promise resolving to the query result or null on error
 */
export const safeQuery = async <T>(
  queryFn: QueryFunction<T>,
  errorHandler?: (error: Error) => void,
): Promise<T | null> => {
  try {
    const { data, error } = await queryFn();

    if (error) {
      if (errorHandler) {
        errorHandler(error);
      } else if (import.meta.env.DEV) {
        // Only log in development environment
        console.error("Supabase query error:", error);
      }
      return null;
    }

    return data;
  } catch (err) {
    if (errorHandler && err instanceof Error) {
      errorHandler(err);
    } else if (import.meta.env.DEV) {
      // Only log in development environment
      console.error("Supabase query exception:", err);
    }
    return null;
  }
};
