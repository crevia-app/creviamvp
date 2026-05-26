import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle, Upload } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Verification = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userType, setUserType] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(profileData);
      setUserType(profileData?.user_type || null);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">{t("verification.title")}</h1>
        </div>
        <p className="text-muted-foreground mb-8">{t("verification.subtitle")}</p>

        {profile?.is_verified ? (
          <Card className="p-8 mb-6 bg-gradient-to-br from-bronze/5 to-bronze/10">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-12 h-12 text-bronze" />
              <div>
                <h2 className="font-vollkorn text-2xl font-bold">{t("verification.verified")}</h2>
                <p className="text-muted-foreground">{t("verification.verifiedDesc")}</p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-8 mb-6">
              <h2 className="font-vollkorn text-2xl font-bold mb-6">
                {userType === "creator" ? t("verification.creatorVerification") : t("verification.brandVerification")}
              </h2>
              {userType === "creator" ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{t("verification.idVerification")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("verification.idVerificationDesc")}</p>
                    <Button variant="outline" className="w-full"><Upload className="w-4 h-4 mr-2" />{t("verification.uploadId")}</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{t("verification.socialVerification")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("verification.socialVerificationDesc")}</p>
                    <Button variant="outline" className="w-full">{t("verification.connectSocial")}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{t("verification.businessRegistration")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("verification.businessRegistrationDesc")}</p>
                    <Button variant="outline" className="w-full"><Upload className="w-4 h-4 mr-2" />{t("verification.uploadCertificate")}</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{t("verification.linkedinVerification")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("verification.linkedinVerificationDesc")}</p>
                    <Button variant="outline" className="w-full">{t("verification.connectLinkedin")}</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{t("verification.domainEmail")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("verification.domainEmailDesc")}</p>
                    <Button variant="outline" className="w-full">{t("verification.verifyEmail")}</Button>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-8">
              <h2 className="font-vollkorn text-2xl font-bold mb-4">{t("verification.benefits")}</h2>
              <ul className="space-y-3">
                {["badgeBenefit", "visibilityBenefit", "supportBenefit", "premiumBenefit"].map((key) => (
                  <li key={key} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-bronze" />
                    <span>{t(`verification.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-6">{t("verification.expectedTime")}</p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Verification;
