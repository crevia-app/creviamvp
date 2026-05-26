import { useState, useEffect } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useInitializeE2EE } from "@/hooks/use-initialize-e2ee";
import { RecoveryPasswordModal } from "@/components/auth/RecoveryPasswordModal";
import { SetRecoveryPasswordDialog } from "@/components/auth/SetRecoveryPasswordDialog";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Kira from "./pages/Kira";
import CreviaLink from "./pages/CreviaLink";
import CreviaStudio from "./pages/CreviaStudio";
import CreviaInvoice from "./pages/CreviaInvoice";
import CreviaContracts from "./pages/CreviaContracts";
import WorkspacesList from "./pages/WorkspacesList";
import MFAVerify from "./components/auth/MFAVerify";
import WorkspacePage from "./pages/WorkspacePage";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";
import PaymentsBilling from "./pages/profile/PaymentsBilling";
import Notifications from "./pages/profile/Notifications";
import Verification from "./pages/profile/Verification";
import Settings from "./pages/profile/Settings";
import Help from "./pages/profile/Help";
import Feedback from "./pages/profile/Feedback";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AppLayout from "./components/navigation/AppLayout";
import PublicPageWrapper from "./components/PublicPageWrapper";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// AppContent lives inside BrowserRouter so routing hooks are available.
// useInitializeE2EE is called HERE — at the very top of this component,
// before any conditional returns — so React's rules of hooks are never violated.
function AppContent() {
  const [userId, setUserId] = useState("");

  // MUST be called before any early returns.
  // Receives "" until the auth state resolves, then fires the full init flow.
  const {
    error: e2eeError,
    needsRecoveryPassword,
    needsMigration,
    provideRecoveryPassword,
    clearMigrationFlag,
  } = useInitializeE2EE(userId);

  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);

  // Open the migration dialog as soon as the flag is raised, but only once per session.
  useEffect(() => {
    if (needsMigration) setMigrationDialogOpen(true);
  }, [needsMigration]);

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session
    // (INITIAL_SESSION event) AND fires again on every sign-in / sign-out.
    // This is more reliable than getSession() which can return null on the
    // first tick in OAuth / server-redirect flows.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? "");
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <ScrollToTop />

      {/* Non-dismissible: shown on a new device when a v2 backup exists */}
      <RecoveryPasswordModal
        open={needsRecoveryPassword}
        error={e2eeError}
        onSubmit={provideRecoveryPassword}
      />

      {/* Dismissible: nudges v1 users and new users to set a recovery password */}
      <SetRecoveryPasswordDialog
        open={migrationDialogOpen}
        userId={userId}
        onOpenChange={setMigrationDialogOpen}
        onComplete={clearMigrationFlag}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicPageWrapper><Home /></PublicPageWrapper>} />
        <Route path="/auth" element={<PublicPageWrapper><Auth /></PublicPageWrapper>} />
        <Route path="/reset-password" element={<PublicPageWrapper><ResetPassword /></PublicPageWrapper>} />
        <Route path="/pricing" element={<PublicPageWrapper><Pricing /></PublicPageWrapper>} />
        <Route path="/about" element={<PublicPageWrapper><About /></PublicPageWrapper>} />
        <Route path="/app/about" element={<AppLayout><About isEmbedded /></AppLayout>} />
        <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
        <Route path="/terms-of-service" element={<AppLayout><TermsOfService /></AppLayout>} />
        <Route path="/user-type-selection" element={<Navigate to="/auth" replace />} />
        <Route path="/signup/creator" element={<Navigate to="/auth?mode=signup" replace />} />
        <Route path="/signup/brand" element={<Navigate to="/auth?mode=signup" replace />} />
        <Route path="/:username" element={<PublicPageWrapper><PublicProfile /></PublicPageWrapper>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<Navigate to="/kira" replace />} />
        <Route path="/kira" element={<ProtectedRoute><AppLayout><Kira /></AppLayout></ProtectedRoute>} />
        <Route path="/crevia-link" element={<ProtectedRoute><AppLayout><CreviaLink /></AppLayout></ProtectedRoute>} />
        <Route path="/crevia-studio" element={<ProtectedRoute><AppLayout><CreviaStudio /></AppLayout></ProtectedRoute>} />
        <Route path="/crevia-invoice" element={<ProtectedRoute><AppLayout><CreviaInvoice /></AppLayout></ProtectedRoute>} />
        <Route path="/crevia-contracts" element={<ProtectedRoute><AppLayout><CreviaContracts /></AppLayout></ProtectedRoute>} />
        <Route path="/mfa-verify" element={<MFAVerify />} />
        <Route path="/crevia-workspace" element={<ProtectedRoute><AppLayout><WorkspacesList /></AppLayout></ProtectedRoute>} />
        <Route path="/crevia-workspace/:id" element={<ProtectedRoute><AppLayout><WorkspacePage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/payments-billing" element={<ProtectedRoute><AppLayout><PaymentsBilling /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/verification" element={<ProtectedRoute><AppLayout><Verification /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/help" element={<ProtectedRoute><AppLayout><Help /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/feedback" element={<ProtectedRoute><AppLayout><Feedback /></AppLayout></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false} storageKey="theme">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
