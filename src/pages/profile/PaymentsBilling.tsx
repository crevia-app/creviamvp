import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, DollarSign, TrendingUp, ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const PaymentsBilling = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single();
    setUserType(profile?.user_type || null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <h1 className="font-vollkorn text-4xl font-bold mb-2">{t("payments.title")}</h1>
        <p className="text-muted-foreground mb-8">
          {userType === "creator" ? t("payments.creatorSubtitle") : t("payments.brandSubtitle")}
        </p>

        <Card className="p-8 mb-6">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">{t("payments.paymentMethods")}</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-bronze" />
                <div>
                  <p className="font-semibold">{t("payments.noMethod")}</p>
                  <p className="text-sm text-muted-foreground">
                    {userType === "creator" ? t("payments.addMethodCreator") : t("payments.addMethodBrand")}
                  </p>
                </div>
              </div>
              <Button className="bg-bronze hover:bg-bronze-dark">{t("payments.addMethod")}</Button>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-bronze" />
              <p className="text-sm text-muted-foreground">{t("payments.subscription")}</p>
            </div>
            <p className="text-xl font-bold mb-3">{t("payments.freePlan")}</p>
            <Link to="/pricing">
              <Button variant="outline" size="sm">
                {t("payments.upgradePlan")} <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </Card>
        </div>

        <Card className="p-8 mb-6">
          <h2 className="font-vollkorn text-2xl font-bold mb-2">{t("payments.upgradeTitle")}</h2>
          <p className="text-muted-foreground mb-6">
            {userType === "creator" ? t("payments.creatorUpgradeDesc") : t("payments.brandUpgradeDesc")}
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            <Card className="p-6 border-border/40">
              <div className="mb-4">
                <h3 className="font-vollkorn text-xl font-bold mb-1">{t("payments.free")}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">{t("payments.month")}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" /><span className="text-sm">{t("payments.basicProfile")}</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" /><span className="text-sm">{userType === "creator" ? t("payments.browseCampaigns") : t("payments.postCampaigns")}</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" /><span className="text-sm">{t("payments.creviaChat")}</span></li>
              </ul>
              <Button variant="outline" className="w-full" disabled>{t("payments.currentPlan")}</Button>
            </Card>
            <Card className="p-6 border-bronze hover:border-bronze/60 transition-colors relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-bronze text-white px-3 py-1 rounded-full text-xs font-semibold">{t("payments.recommended")}</span>
              </div>
              <div className="mb-4">
                <h3 className="font-vollkorn text-xl font-bold mb-1">{t("payments.pro")}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold">{userType === "creator" ? "$14.99" : "$19.99"}</span>
                  <span className="text-muted-foreground">{t("payments.month")}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" /><span className="text-sm">{t("payments.everythingInFree")}</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" /><span className="text-sm">{userType === "creator" ? t("payments.priorityPlacement") : t("payments.unlimitedCampaigns")}</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" /><span className="text-sm">{t("payments.advancedAnalytics")}</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" /><span className="text-sm">{userType === "creator" ? t("payments.customThemes") : t("payments.creatorDiscovery")}</span></li>
              </ul>
              <Button className="w-full bg-bronze hover:bg-bronze-dark">{t("payments.upgradeToPro")}</Button>
            </Card>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">{t("payments.transactionHistory")}</h2>
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("payments.noTransactions")}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsBilling;
