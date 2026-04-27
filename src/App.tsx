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
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import CreatorSignup from "./pages/CreatorSignup";
import BrandSignup from "./pages/BrandSignup";
import Kira from "./pages/Kira";
import CreviaLink from "./pages/CreviaLink";
import CreviaStudio from "./pages/CreviaStudio";
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

const queryClient = new QueryClient();

// AppContent lives inside BrowserRouter so routing hooks are available.
// useInitializeE2EE is called HERE — at the very top of this component,
// before any conditional returns — so React's rules of hooks are never violated.
function AppContent() {
  const [userId, setUserId] = useState("");

  // Log on every render so you can confirm the hook is alive in the console.
  console.log("[E2EE] AppContent render — userId:", userId || "(not yet set)");

  // MUST be called before any early returns.
  // Receives "" until the auth state resolves, then fires the full init flow.
  useInitializeE2EE(userId);

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session
    // (INITIAL_SESSION event) AND fires again on every sign-in / sign-out.
    // This is more reliable than getSession() which can return null on the
    // first tick in OAuth / server-redirect flows.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? "";
      console.log("[E2EE] Auth state changed — userId:", uid || "(signed out)");
      setUserId(uid);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicPageWrapper><Home /></PublicPageWrapper>} />
        <Route path="/auth" element={<PublicPageWrapper><Auth /></PublicPageWrapper>} />
        <Route path="/reset-password" element={<PublicPageWrapper><ResetPassword /></PublicPageWrapper>} />
        <Route path="/pricing" element={<PublicPageWrapper><Pricing /></PublicPageWrapper>} />
        <Route path="/about" element={<PublicPageWrapper><About /></PublicPageWrapper>} />
        <Route path="/app/about" element={<AppLayout><About /></AppLayout>} />
        <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
        <Route path="/terms-of-service" element={<AppLayout><TermsOfService /></AppLayout>} />
        <Route path="/user-type-selection" element={<Navigate to="/auth" replace />} />
        <Route path="/signup/creator" element={<PublicPageWrapper><CreatorSignup /></PublicPageWrapper>} />
        <Route path="/signup/brand" element={<PublicPageWrapper><BrandSignup /></PublicPageWrapper>} />
        <Route path="/:username" element={<PublicPageWrapper><PublicProfile /></PublicPageWrapper>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<Navigate to="/kira" replace />} />
        <Route path="/kira" element={<AppLayout><Kira /></AppLayout>} />
        <Route path="/crevia-link" element={<AppLayout><CreviaLink /></AppLayout>} />
        <Route path="/crevia-studio" element={<AppLayout><CreviaStudio /></AppLayout>} />
        <Route path="/mfa-verify" element={<MFAVerify />} />
        <Route path="/crevia-workspace" element={<AppLayout><WorkspacesList /></AppLayout>} />
        <Route path="/crevia-workspace/:id" element={<AppLayout><WorkspacePage /></AppLayout>} />
        <Route path="/profile/payments-billing" element={<AppLayout><PaymentsBilling /></AppLayout>} />
        <Route path="/profile/notifications" element={<AppLayout><Notifications /></AppLayout>} />
        <Route path="/profile/verification" element={<AppLayout><Verification /></AppLayout>} />
        <Route path="/profile/settings" element={<AppLayout><Settings /></AppLayout>} />
        <Route path="/profile/help" element={<AppLayout><Help /></AppLayout>} />
        <Route path="/profile/feedback" element={<AppLayout><Feedback /></AppLayout>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="theme">
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
