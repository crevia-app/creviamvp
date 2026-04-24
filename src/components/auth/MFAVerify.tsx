import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const MFAVerify = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factorsData.totp[0];
      if (!totpFactor) throw new Error("No TOTP factor found");

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });
      if (verifyError) throw verifyError;

      toast({
        title: "Verified!",
        description: "Welcome back to Crevia.",
      });
      navigate("/kira", { replace: true });

    } catch (error: any) {
      toast({
        title: "Invalid code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-bronze" />
          </div>
          <h1 className="font-vollkorn text-2xl font-bold mb-2">Two-Factor Authentication</h1>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Verification Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center text-2xl font-mono tracking-widest h-14"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
            />
          </div>

          <Button
            onClick={verifyCode}
            disabled={isLoading || code.length !== 6}
            className="w-full bg-bronze hover:bg-bronze/90 text-background h-12"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Verify & Continue
          </Button>

          <Button
            variant="ghost"
            onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}
            className="w-full text-muted-foreground"
          >
            Sign out and try again
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MFAVerify;
