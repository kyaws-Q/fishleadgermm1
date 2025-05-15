import React, { Suspense, lazy } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { WebSocketProvider } from "@/contexts/WebSocketProvider";
import { Toaster } from "@/components/ui/sonner";
import { SupabaseCheck } from "@/components/supabase-check";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load page components
const HomePage = lazy(() => import("@/pages/HomePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const PurchasesPage = lazy(() => import("@/pages/PurchasesPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ExportPage = lazy(() => import("@/pages/ExportPage"));
const ShipmentsPage = lazy(() => import("@/pages/ShipmentsPage"));
const TrackerPage = lazy(() => import("@/pages/TrackerPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Basic loading fallback component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);

// App.tsx - Main application component

/**
 * Main App component
 */
function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ThemeProvider>
          <WebSocketProvider>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <AppContent />
            </ErrorBoundary>
          </WebSocketProvider>
        </ThemeProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

// Custom error fallback component is imported from @/components/ErrorFallback

/**
 * App content with routes
 */
function AppContent() {
  // Add theme transition effect
  React.useEffect(() => {
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease');

    return () => {
      document.documentElement.style.removeProperty('--theme-transition');
    };
  }, []);

  return (
    <>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
            <Route path="/shipments" element={<ProtectedRoute><ShipmentsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><ExportPage /></ProtectedRoute>} />
            <Route path="/tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      <Toaster position="top-center" />
      {/* Supabase connection check (remove after verifying setup) */}
      <SupabaseCheck />
    </>
  );
}

export default App;
