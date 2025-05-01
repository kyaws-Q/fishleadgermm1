
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "@/components/ui/sonner";

import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import PurchasesPage from "@/pages/PurchasesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import ExportPage from "@/pages/ExportPage";
import ShipmentsPage from "@/pages/ShipmentsPage";
import NotFound from "@/pages/NotFound";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  // We'll access theme information inside the AppProvider context
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
