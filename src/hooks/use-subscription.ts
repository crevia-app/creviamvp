import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "pro" | "creative_pro" | "brand_workspace" | "business";

export interface SubscriptionLimits {
  diraActionsPerMonth: number;      // Infinity = unlimited (Business)
  invoicesPerMonth: number;
  canvasesPerMonth: number;
  esignaturesPerMonth: number;      // 1 for free, Infinity for paid
  hasESignature: boolean;           // true for all plans (free gets 1/month limit)
  hasPremiumThemes: boolean;
  hasClientPortal: boolean;
  hasVerifiedBadge: boolean;
  hasFullAnalytics: boolean;
  hasUnlimitedInvoices: boolean;
  hasUnlimitedCanvases: boolean;
  hasInvoiceWatermark: boolean;
  hasMultiSeat: boolean;
  hasRBAC: boolean;
  hasClauseLibrary: boolean;
  maxWorkspaces: number;            // max workspaces user can CREATE (0 = join-only)
  canCreateWorkspace: boolean;      // false for free — join-only
  showDiraCounter: boolean;         // true only for free; hidden for Pro/Business per spec
  baseSeats: number;
}

export interface SubscriptionState {
  plan: SubscriptionPlan;
  status: string;
  isLoading: boolean;
  isPro: boolean;
  isBusiness: boolean;
  isBrandWorkspace: boolean;
  isFree: boolean;
  limits: SubscriptionLimits;
  diraActionsToday: number;         // actually monthly — label updated in UI (Module 3)
  diraActionsLimit: number;
  invoicesUsedThisMonth: number;
  canvasesUsedThisMonth: number;
  esignaturesUsedThisMonth: number;
  showDiraCounter: boolean;
  canCreateWorkspace: boolean;
}

// ── Plan limit constants ──────────────────────────────────────────────────

const PRO_LIMITS: SubscriptionLimits = {
  diraActionsPerMonth: 500,
  invoicesPerMonth: Infinity,
  canvasesPerMonth: Infinity,
  esignaturesPerMonth: Infinity,
  hasESignature: true,
  hasPremiumThemes: true,
  hasClientPortal: true,
  hasVerifiedBadge: true,
  hasFullAnalytics: true,
  hasUnlimitedInvoices: true,
  hasUnlimitedCanvases: true,
  hasInvoiceWatermark: false,
  hasMultiSeat: false,
  hasRBAC: false,
  hasClauseLibrary: false,
  maxWorkspaces: 10,
  canCreateWorkspace: true,
  showDiraCounter: false,
  baseSeats: 1,
};

const BUSINESS_LIMITS: SubscriptionLimits = {
  diraActionsPerMonth: Infinity,
  invoicesPerMonth: Infinity,
  canvasesPerMonth: Infinity,
  esignaturesPerMonth: Infinity,
  hasESignature: true,
  hasPremiumThemes: true,
  hasClientPortal: true,
  hasVerifiedBadge: true,
  hasFullAnalytics: true,
  hasUnlimitedInvoices: true,
  hasUnlimitedCanvases: true,
  hasInvoiceWatermark: false,
  hasMultiSeat: true,
  hasRBAC: true,
  hasClauseLibrary: true,
  maxWorkspaces: Infinity,
  canCreateWorkspace: true,
  showDiraCounter: false,
  baseSeats: 3,
};

const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    diraActionsPerMonth: 15,
    invoicesPerMonth: 3,
    canvasesPerMonth: 6,
    esignaturesPerMonth: 1,
    hasESignature: true,            // available but limited to 1/month
    hasPremiumThemes: false,
    hasClientPortal: false,
    hasVerifiedBadge: false,
    hasFullAnalytics: false,
    hasUnlimitedInvoices: false,
    hasUnlimitedCanvases: false,
    hasInvoiceWatermark: true,
    hasMultiSeat: false,
    hasRBAC: false,
    hasClauseLibrary: false,
    maxWorkspaces: 0,               // cannot create — join-only
    canCreateWorkspace: false,
    showDiraCounter: true,
    baseSeats: 1,
  },
  pro:              PRO_LIMITS,
  creative_pro:     PRO_LIMITS,
  business:         BUSINESS_LIMITS,
  brand_workspace:  BUSINESS_LIMITS,
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export const useSubscription = (): SubscriptionState => {
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [status, setStatus] = useState("inactive");
  const [isLoading, setIsLoading] = useState(true);
  const [diraActionsToday, setDiraActionsToday] = useState(0);
  const [diraActionsLimit, setDiraActionsLimit] = useState(15);
  const [invoicesUsedThisMonth, setInvoicesUsedThisMonth] = useState(0);
  const [canvasesUsedThisMonth, setCanvasesUsedThisMonth] = useState(0);
  const [esignaturesUsedThisMonth, setEsignaturesUsedThisMonth] = useState(0);

  const applyProfile = (profile: Record<string, unknown>) => {
    setPlan((profile.subscription_plan as SubscriptionPlan) || "free");
    setStatus((profile.subscription_status as string) || "inactive");
    setDiraActionsToday((profile.dira_actions_used as number) || 0);
    // NULL dira_actions_limit = unlimited (Business). Use Infinity so comparisons work.
    const rawLimit = profile.dira_actions_limit;
    setDiraActionsLimit(rawLimit == null ? Infinity : (rawLimit as number));
    setInvoicesUsedThisMonth((profile.invoices_used_this_month as number) || 0);
    setCanvasesUsedThisMonth((profile.canvases_used_this_month as number) || 0);
    setEsignaturesUsedThisMonth((profile.esignatures_used_this_month as number) || 0);
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
        .select(
          "subscription_plan, subscription_status, dira_actions_used, dira_actions_limit, " +
          "invoices_used_this_month, canvases_used_this_month, esignatures_used_this_month"
        )
        .eq("id", user.id)
        .single();

      if (profile) applyProfile(profile as Record<string, unknown>);
      setIsLoading(false);

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
  const limits = PLAN_LIMITS[currentPlan] ?? PLAN_LIMITS["free"];
  const isActiveStatus = ACTIVE_STATUSES.has(status);
  const isPro = (currentPlan === "pro" || currentPlan === "creative_pro") && isActiveStatus;
  const isBusiness = (currentPlan === "business" || currentPlan === "brand_workspace") && isActiveStatus;
  const isFree = currentPlan === "free" || !isActiveStatus;

  return {
    plan: currentPlan,
    status,
    isLoading,
    isPro,
    isBusiness,
    isBrandWorkspace: isBusiness,
    isFree,
    limits,
    diraActionsToday,
    diraActionsLimit,
    invoicesUsedThisMonth,
    canvasesUsedThisMonth,
    esignaturesUsedThisMonth,
    showDiraCounter: isFree,
    canCreateWorkspace: limits.canCreateWorkspace,
  };
};
