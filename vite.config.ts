import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: true,
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || "https://okzcrijmvpwouqemvzat.supabase.co"),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9remNyaWptdnB3b3VxZW12emF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ0ODE2MDksImV4cCI6MjAzMDA1NzYwOX0.h5yjY7nOvvSFsNiRxH69WzQhGl8kyGvzYUcYe6z-WGE"),
      'import.meta.env.VITE_MARITIME_API_KEY': JSON.stringify(env.VITE_MARITIME_API_KEY || "3fd4a9f30amsh950562621999ec2p1b32c8jsnf7faa1c1fd1f"),
    },
  };
});
