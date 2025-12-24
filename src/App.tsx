import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserTypeSelection from "./pages/UserTypeSelection";
import CreatorSignup from "./pages/CreatorSignup";
import BrandSignup from "./pages/BrandSignup";
import CreatorOnboarding from "./pages/onboarding/CreatorOnboarding";
import BrandOnboarding from "./pages/onboarding/BrandOnboarding";
import Dashboard from "./pages/Dashboard";
import CreviaConnect from "./pages/CreviaConnect";
import Kira from "./pages/Kira";
import CreviaLink from "./pages/CreviaLink";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";
import PaymentsBilling from "./pages/profile/PaymentsBilling";
import Notifications from "./pages/profile/Notifications";
import Verification from "./pages/profile/Verification";
import Settings from "./pages/profile/Settings";
import Help from "./pages/profile/Help";
import Feedback from "./pages/profile/Feedback";
import Integrations from "./pages/profile/Integrations";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AppLayout from "./components/navigation/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/user-type-selection" element={<UserTypeSelection />} />
            <Route path="/signup/creator" element={<CreatorSignup />} />
            <Route path="/signup/brand" element={<BrandSignup />} />
            <Route path="/onboarding/creator" element={<CreatorOnboarding />} />
            <Route path="/onboarding/brand" element={<BrandOnboarding />} />
            <Route path="/:username" element={<PublicProfile />} />
            
            {/* Protected routes with AppLayout */}
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/crevia-connect" element={<AppLayout><CreviaConnect /></AppLayout>} />
            <Route path="/kira" element={<AppLayout><Kira /></AppLayout>} />
            <Route path="/crevia-link" element={<AppLayout><CreviaLink /></AppLayout>} />
            <Route path="/profile/payments-billing" element={<AppLayout><PaymentsBilling /></AppLayout>} />
            <Route path="/profile/notifications" element={<AppLayout><Notifications /></AppLayout>} />
            <Route path="/profile/verification" element={<AppLayout><Verification /></AppLayout>} />
            <Route path="/profile/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="/profile/help" element={<AppLayout><Help /></AppLayout>} />
            <Route path="/profile/feedback" element={<AppLayout><Feedback /></AppLayout>} />
            <Route path="/profile/integrations" element={<AppLayout><Integrations /></AppLayout>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
