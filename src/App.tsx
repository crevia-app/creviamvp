import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Home from "./pages/Home";
// Auth imports removed - will return later
import Kira from "./pages/Kira";
import CreviaLink from "./pages/CreviaLink";
import CreviaStudio from "./pages/CreviaStudio";

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
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicPageWrapper><Home /></PublicPageWrapper>} />
            <Route path="/pricing" element={<PublicPageWrapper><Pricing /></PublicPageWrapper>} />
            <Route path="/about" element={<PublicPageWrapper><About /></PublicPageWrapper>} />
            <Route path="/app/about" element={<AppLayout><About /></AppLayout>} />
            <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
            <Route path="/terms-of-service" element={<AppLayout><TermsOfService /></AppLayout>} />
            <Route path="/:username" element={<PublicPageWrapper><PublicProfile /></PublicPageWrapper>} />
            
            {/* App routes with AppLayout */}
            <Route path="/dashboard" element={<Navigate to="/kira" replace />} />
            <Route path="/kira" element={<AppLayout><Kira /></AppLayout>} />
            <Route path="/crevia-link" element={<AppLayout><CreviaLink /></AppLayout>} />
            <Route path="/crevia-studio" element={<AppLayout><CreviaStudio /></AppLayout>} />
            <Route path="/profile/payments-billing" element={<AppLayout><PaymentsBilling /></AppLayout>} />
            <Route path="/profile/notifications" element={<AppLayout><Notifications /></AppLayout>} />
            <Route path="/profile/verification" element={<AppLayout><Verification /></AppLayout>} />
            <Route path="/profile/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="/profile/help" element={<AppLayout><Help /></AppLayout>} />
            <Route path="/profile/feedback" element={<AppLayout><Feedback /></AppLayout>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
