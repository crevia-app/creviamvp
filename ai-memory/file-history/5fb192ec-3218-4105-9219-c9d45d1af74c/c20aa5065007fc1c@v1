import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "creative_pro" | "brand_workspace";

export interface SubscriptionLimits {
  kiraActionsPerDay: number;
  invoicesPerMonth: number;
  contractsPerMonth: number;
  hasESignature: boolean;
  hasPremiumThemes: boolean;
  hasClientPortal: boolean;
  hasVerifiedBadge: boolean;
  hasFullAnalytics: boolean;
  hasUnlimitedInvoices: boolean;
  hasUnlimitedContracts: boolean;
}

export interface SubscriptionState {
  plan: SubscriptionPlan;
  status: string;
  isLoading: boolean;
  isPro: boolean;
  isBrandWorkspace: boolean;
  isFree: boolean;
  limits: SubscriptionLimits;
  kiraActionsToday: number;
  kiraActionsLimit: number;
}

const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    kiraActionsPerDay: 10,
    invoicesPerMonth: 5,
    contractsPerMonth: 5,
    hasESignature: false,
    hasPremiumThemes: false,
    hasClientPortal: false,
    hasVerifiedBadge: false,
    hasFullAnalytics: false,
    hasUnlimitedInvoices: false,
    hasUnlimitedContracts: false,
  },
  creative_pro: {
    kiraActionsPerDay: 40,
    invoicesPerMonth: Infinity,
    contractsPerMonth: Infinity,
    hasESignature: true,
    hasPremiumThemes: true,
    hasClientPortal: true,
    hasVerifiedBadge: true,
    hasFullAnalytics: true,
    hasUnlimitedInvoices: true,
    hasUnlimitedContracts: true,
  },
  brand_workspace: {
    kiraActionsPerDay: 40,
    invoicesPerMonth: Infinity,
    contractsPerMonth: Infinity,
    hasESignature: true,
    hasPremiumThemes: true,
    hasClientPortal: true,
    hasVerifiedBadge: true,
    hasFullAnalytics: true,
    hasUnlimitedInvoices: true,
    hasUnlimitedContracts: true,
  },
};

export const useSubscription = (): SubscriptionState => {
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [status, setStatus] = useState("inactive");
  const [isLoading, setIsLoading] = useState(true);
  const [kiraActionsToday, setKiraActionsToday] = useState(0);
  const [kiraActionsLimit, setKiraActionsLimit] = useState(10);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan, subscription_status, kira_actions_used, kira_actions_limit")
      .eq("id", user.id)
      .single();

    if (profile) {
      setPlan((profile.subscription_plan as SubscriptionPlan) || "free");
      setStatus(profile.subscription_status || "inactive");
      setKiraActionsToday(profile.kira_actions_used || 0);
      setKiraActionsLimit(profile.kira_actions_limit || 10);
    }

    setIsLoading(false);
  };

  const currentPlan = plan || "free";
  const limits = PLAN_LIMITS[currentPlan];

  return {
    plan: currentPlan,
    status,
    isLoading,
    isPro: currentPlan === "creative_pro",
    isBrandWorkspace: currentPlan === "brand_workspace",
    isFree: currentPlan === "free",
    limits,
    kiraActionsToday,
    kiraActionsLimit,
  };
};
