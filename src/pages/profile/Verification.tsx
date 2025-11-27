import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle, Upload } from "lucide-react";

const Verification = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
    setUserType(profileData?.user_type || null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">Verification</h1>
        </div>
        <p className="text-muted-foreground mb-8">Get verified to unlock premium features</p>

        {profile?.is_verified ? (
          <Card className="p-8 mb-6 bg-gradient-to-br from-bronze/5 to-bronze/10">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-12 h-12 text-bronze" />
              <div>
                <h2 className="font-vollkorn text-2xl font-bold">You're Verified!</h2>
                <p className="text-muted-foreground">Your account has been verified</p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-8 mb-6">
              <h2 className="font-vollkorn text-2xl font-bold mb-6">
                {userType === "creator" ? "Creator Verification" : "Brand Verification"}
              </h2>
              
              {userType === "creator" ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Option 1: ID Verification</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload a government-issued ID</p>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload ID
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Option 2: Social Media Verification</h3>
                    <p className="text-sm text-muted-foreground mb-4">Connect Instagram or TikTok (min 1,000 followers)</p>
                    <Button variant="outline" className="w-full">Connect Social Account</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Option 1: Business Registration</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload registration certificate</p>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Certificate
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Option 2: LinkedIn Verification</h3>
                    <p className="text-sm text-muted-foreground mb-4">Connect verified LinkedIn company page</p>
                    <Button variant="outline" className="w-full">Connect LinkedIn</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Option 3: Domain Email</h3>
                    <p className="text-sm text-muted-foreground mb-4">Verify via company email domain</p>
                    <Button variant="outline" className="w-full">Verify Email</Button>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-8">
              <h2 className="font-vollkorn text-2xl font-bold mb-4">Verification Benefits</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-bronze" />
                  <span>Verified badge on your profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-bronze" />
                  <span>Higher visibility in search</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-bronze" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-bronze" />
                  <span>Access to premium features</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-6">
                Expected verification time: ~2 hours
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Verification;
