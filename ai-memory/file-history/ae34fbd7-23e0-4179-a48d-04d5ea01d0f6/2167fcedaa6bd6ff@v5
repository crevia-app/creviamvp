import { useState, useEffect, lazy, Suspense } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useInitializeE2EE } from "@/hooks/use-initialize-e2ee";
import { RecoveryPasswordModal } from "@/components/auth/RecoveryPasswordModal";
import { SetRecoveryPasswordDialog } from "@/components/auth/SetRecoveryPasswordDialog";
import ScrollToTop from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UpdateBanner } from "./components/UpdateBanner";
import { CookieConsent } from "./components/CookieConsent";
import { BiometricLockScreen } from "./components/auth/BiometricLockScreen";
import AppLayout from "./components/navigation/AppLayout";
import PublicPageWrapper from "./components/PublicPageWrapper";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Eagerly loaded — the landing page only; everything else deferred
import Home from "./pages/Home";

// Lazy-loaded — split into separate chunks to reduce initial bundle
const Auth             = lazy(() => import("./pages/Auth"));
const AuthCallback     = lazy(() => import("./pages/AuthCallback"));
const NotFound         = lazy(() => import("./pages/NotFound"));
const MFAVerify        = lazy(() => import("./components/auth/MFAVerify"));
const ResetPassword    = lazy(() => import("./pages/ResetPassword"));
const Kira             = lazy(() => import("./pages/Kira"));
const CreviaLink       = lazy(() => import("./pages/CreviaLink"));
const CreviaStudio     = lazy(() => import("./pages/CreviaStudio"));
const CreviaInvoice    = lazy(() => import("./pages/CreviaInvoice"));
const CreviaContracts  = lazy(() => import("./pages/CreviaContracts"));
const WorkspacesList   = lazy(() => import("./pages/WorkspacesList"));
const WorkspacePage    = lazy(() => import("./pages/WorkspacePage"));
const WorkspaceInvitePage = lazy(() => import("./pages/WorkspaceInvitePage"));
const PublicProfile    = lazy(() => import("./pages/PublicProfile"));
const ReceivedDocuments = lazy(() => import("./pages/ReceivedDocuments"));
const PaymentsBilling  = lazy(() => import("./pages/profile/PaymentsBilling"));
const Notifications    = lazy(() => import("./pages/profile/Notifications"));
const Verification     = lazy(() => import("./pages/profile/Verification"));
const Settings         = lazy(() => import("./pages/profile/Settings"));
const Help             = lazy(() => import("./pages/profile/Help"));
const Feedback         = lazy(() => import("./pages/profile/Feedback"));
const Admin            = lazy(() => import("./pages/Admin"));
const Pricing          = lazy(() => import("./pages/Pricing"));
const About            = lazy(() => import("./pages/About"));
const PrivacyPolicy    = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService   = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy     = lazy(() => import("./pages/CookiePolicy"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 rounded-full border-2 border-bronze border-t-transparent animate-spin" />
  </div>
);

const MaintenancePage = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
    <img src="/crevia-logo.png" alt="Crevia" className="w-14 h-14 rounded-full ring-1 ring-border mb-8" />
    <h1 className="font-vollkorn text-3xl md:text-4xl font-bold mb-3">Down for maintenance</h1>
    <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
      We're making some improvements to Crevia. We'll be back shortly — thank you for your patience.
    </p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // cache fresh for 5 min — reduces redundant fetches
      gcTime:    1000 * 60 * 15,  // keep inactive cache alive for 15 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// AppContent lives inside BrowserRouter so routing hooks are available.
// useInitializeE2EE is called HERE — at the very top of this component,
// before any conditional returns — so React's rules of hooks are never violated.
function AppContent() {
  const [userId, setUserId] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const location = useLocation();

  // Biometric app lock
  const [bioLocked, setBioLocked] = useState(false);
  const [bioCredentialId, setBioCredentialId] = useState<string | null>(null);

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

  // Prefetch the most-visited pages as soon as auth resolves — chunks land in
  // the SW precache so subsequent navigations are instant (no network waterfall).
  useEffect(() => {
    if (!userId) return;
    import("./pages/Kira");
    import("./pages/CreviaStudio");
  }, [userId]);

  // Background maintenance check — never blocks render
  useEffect(() => {
    supabase.from("app_settings" as any)
      .select("value")
      .eq("key", "maintenance_mode")
      .single()
      .then(({ data }) => {
        if ((data as any)?.value === "true") setMaintenance(true);
      });
  }, []);

  // Biometric app lock — arm after session resolves
  useEffect(() => {
    if (!userId) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      const enabled = !!user?.user_metadata?.biometric_enabled;
      const credId = user?.user_metadata?.biometric_credential_id as string | undefined;
      if (!enabled || !credId) return;
      setBioCredentialId(credId);
      // Skip initial lock if the user just completed a fresh login this tab session.
      if (sessionStorage.getItem("biometric_unlocked") === "1") {
        sessionStorage.removeItem("biometric_unlocked");
        return;
      }
      setBioLocked(true);
    });
  }, [userId]);

  // Re-lock after 5 minutes in background
  useEffect(() => {
    if (!bioCredentialId) return;
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (hiddenAt && Date.now() - hiddenAt >= 5 * 60 * 1000) {
        setBioLocked(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [bioCredentialId]);

  // Admin path always bypasses maintenance so the toggle can be turned off
  if (maintenance && !location.pathname.startsWith("/admin")) return <MaintenancePage />;

  return (
    <>
      {bioLocked && bioCredentialId && (
        <BiometricLockScreen
          credentialId={bioCredentialId}
          onUnlock={() => setBioLocked(false)}
        />
      )}

      <ScrollToTop />
      <CookieConsent />

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

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicPageWrapper><Home /></PublicPageWrapper>} />
          <Route path="/auth" element={<PublicPageWrapper><Auth /></PublicPageWrapper>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<PublicPageWrapper><ResetPassword /></PublicPageWrapper>} />
          <Route path="/pricing" element={<PublicPageWrapper><Pricing /></PublicPageWrapper>} />
          <Route path="/about" element={<PublicPageWrapper><About /></PublicPageWrapper>} />
          <Route path="/app/about" element={<AppLayout><About isEmbedded /></AppLayout>} />
          <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
          <Route path="/terms-of-service" element={<AppLayout><TermsOfService /></AppLayout>} />
          <Route path="/cookie-policy" element={<AppLayout><CookiePolicy /></AppLayout>} />
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
          <Route path="/invite/:token" element={<WorkspaceInvitePage />} />
          <Route path="/received" element={<ProtectedRoute><AppLayout><ReceivedDocuments /></AppLayout></ProtectedRoute>} />
          <Route path="/profile/payments-billing" element={<ProtectedRoute><AppLayout><PaymentsBilling /></AppLayout></ProtectedRoute>} />
          <Route path="/profile/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
          <Route path="/profile/verification" element={<ProtectedRoute><AppLayout><Verification /></AppLayout></ProtectedRoute>} />
          <Route path="/profile/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
          <Route path="/profile/help" element={<ProtectedRoute><AppLayout><Help /></AppLayout></ProtectedRoute>} />
          <Route path="/profile/feedback" element={<ProtectedRoute><AppLayout><Feedback /></AppLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="theme">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
              <UpdateBanner />
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
