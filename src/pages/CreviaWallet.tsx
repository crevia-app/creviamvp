import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Sparkles } from "lucide-react";
import WalletTab from "@/components/studio/WalletTab";

const CreviaWallet = () => {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"creator" | "brand">("creator");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.user_type) {
          setUserType(profile.user_type);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-poppins">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Wallet Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-bronze/10">
              <Wallet className="h-5 w-5 text-bronze" />
            </div>
            <div>
              <h1 className="font-vollkorn text-xl md:text-2xl font-semibold text-foreground">
                Crevia Wallet
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Manage your payments & earnings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Content */}
      <WalletTab userType={userType} />
    </div>
  );
};

export default CreviaWallet;
