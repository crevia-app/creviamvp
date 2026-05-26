import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "creative_pro" | "brand_workspace";

export interface SubscriptionLimits {
  kiraActionsPerDay: number;
  invoicesPerMonth: number;
  canvasesPerMonth: number;
  hasESignature: boolean;
  hasPremiumThemes: boolean;
  hasClientPortal: boolean;
  hasVerifiedBadge: boolean;
  hasFullAnalytics: boolean;
  hasUnlimitedInvoices: boolean;
  hasUnlimitedCanvases: boolean;
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
  invoicesUsedThisMonth: number;
  canvasesUsedThisMonth: number;
}

const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    kiraActionsPerDay: 10,
    invoicesPerMonth: 2,
    canvasesPerMonth: 2,
    hasESignature: false,
    hasPremiumThemes: false,
    hasClientPortal: false,
    hasVerifiedBadge: false,
    hasFullAnalytics: false,
    hasUnlimitedInvoices: false,
    hasUnlimitedCanvases: false,
  },
  creative_pro: {
    kiraActionsPerDay: 40,
    invoicesPerMonth: Infinity,
    canvasesPerMonth: Infinity,
    hasESignature: true,
    hasPremiumThemes: true,
    hasClientPortal: true,
    hasVerifiedBadge: true,
    hasFullAnalytics: true,
    hasUnlimitedInvoices: true,
    hasUnlimitedCanvases: true,
  },
  brand_workspace: {
    kiraActionsPerDay: 40,
    invoicesPerMonth: Infinity,
    canvasesPerMonth: Infinity,
    hasESignature: true,
    hasPremiumThemes: true,
    hasClientPortal: true,
    hasVerifiedBadge: true,
    hasFullAnalytics: true,
    hasUnlimitedInvoices: true,
    hasUnlimitedCanvases: true,
  },
};

// A plan only grants Pro/Workspace features when the subscription is active or trialing.
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export const useSubscription = (): SubscriptionState => {
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [status, setStatus] = useState("inactive");
  const [isLoading, setIsLoading] = useState(true);
  const [kiraActionsToday, setKiraActionsToday] = useState(0);
  const [kiraActionsLimit, setKiraActionsLimit] = useState(10);
  const [invoicesUsedThisMonth, setInvoicesUsedThisMonth] = useState(0);
  const [canvasesUsedThisMonth, setCanvasesUsedThisMonth] = useState(0);

  const applyProfile = (profile: Record<string, unknown>) => {
    setPlan((profile.subscription_plan as SubscriptionPlan) || "free");
    setStatus((profile.subscription_status as string) || "inactive");
    setKiraActionsToday((profile.kira_actions_used as number) || 0);
    setKiraActionsLimit((profile.kira_actions_limit as number) || 10);
    setInvoicesUsedThisMonth((profile.invoices_used_this_month as number) || 0);
    setCanvasesUsedThisMonth((profile.canvases_used_this_month as number) || 0);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_plan, subscription_status, kira_actions_used, kira_actions_limit, invoices_used_this_month, canvases_used_this_month")
        .eq("id", user.id)
        .single();

      if (profile) applyProfile(profile as Record<string, unknown>);
      setIsLoading(false);

      // Real-time listener: fires the moment the Paystack webhook updates the profile row.
      channel = supabase
        .channel(`subscription:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            applyProfile(payload.new as Record<string, unknown>);
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const currentPlan = plan || "free";
  const limits = PLAN_LIMITS[currentPlan];
  const isActiveStatus = ACTIVE_STATUSES.has(status);

  return {
    plan: currentPlan,
    status,
    isLoading,
    isPro: currentPlan === "creative_pro" && isActiveStatus,
    isBrandWorkspace: currentPlan === "brand_workspace" && isActiveStatus,
    isFree: currentPlan === "free" || !isActiveStatus,
    limits,
    kiraActionsToday,
    kiraActionsLimit,
    invoicesUsedThisMonth,
    canvasesUsedThisMonth,
  };
};
