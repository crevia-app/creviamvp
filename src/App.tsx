import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import UserTypeSelection from "./pages/UserTypeSelection";
import CreatorSignup from "./pages/CreatorSignup";
import BrandSignup from "./pages/BrandSignup";
import CreatorOnboarding from "./pages/onboarding/CreatorOnboarding";
import BrandOnboarding from "./pages/onboarding/BrandOnboarding";
import Dashboard from "./pages/Dashboard";
import CreviaConnect from "./pages/CreviaConnect";
import CreviaAI from "./pages/CreviaAI";
import CreviaLink from "./pages/CreviaLink";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/user-type-selection" element={<UserTypeSelection />} />
          <Route path="/signup/creator" element={<CreatorSignup />} />
          <Route path="/signup/brand" element={<BrandSignup />} />
          <Route path="/onboarding/creator" element={<CreatorOnboarding />} />
          <Route path="/onboarding/brand" element={<BrandOnboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crevia-connect" element={<CreviaConnect />} />
          <Route path="/crevia-ai" element={<CreviaAI />} />
          <Route path="/crevia-link" element={<CreviaLink />} />
          <Route path="/:username" element={<PublicProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
