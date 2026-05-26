import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MFASetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const MFASetup = ({ onComplete, onSkip }: MFASetupProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"intro" | "qr" | "verify" | "done">("intro");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setupMFA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Crevia Authenticator",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("qr");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (verifyCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      if (verifyError) throw verifyError;

      setStep("done");
      toast({
        title: "2FA Enabled!",
        description: "Your account is now secured with two-factor authentication.",
      });
      setTimeout(onComplete, 1500);
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
    <Card className="p-6 max-w-md mx-auto">
      {step === "intro" && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-bronze" />
          </div>
          <h3 className="font-vollkorn text-xl font-bold mb-2">Enable Two-Factor Authentication</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Add an extra layer of security to your Crevia account using Google Authenticator or Authy.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={setupMFA}
              disabled={isLoading}
              className="bg-bronze hover:bg-bronze/90 text-background"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              Enable 2FA
            </Button>
            {onSkip && (
              <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
                Skip for now
              </Button>
            )}
          </div>
        </div>
      )}

      {step === "qr" && (
        <div className="text-center">
          <h3 className="font-vollkorn text-xl font-bold mb-2">Scan QR Code</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Open Google Authenticator or Authy and scan this QR code.
          </p>
          {qrCode && (
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-lg border border-border" />
            </div>
          )}
          <div className="p-3 bg-muted rounded-lg mb-4">
            <p className="text-xs text-muted-foreground mb-1">Or enter this code manually:</p>
            <p className="font-mono text-sm font-bold break-all">{secret}</p>
          </div>
          <Button
            onClick={() => setStep("verify")}
            className="w-full bg-bronze hover:bg-bronze/90 text-background"
          >
            I've scanned the code
          </Button>
        </div>
      )}

      {step === "verify" && (
        <div className="text-center">
          <h3 className="font-vollkorn text-xl font-bold mb-2">Verify Setup</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Enter the 6-digit code from your authenticator app to confirm setup.
          </p>
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Verification Code</Label>
            <Input
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center text-2xl font-mono tracking-widest h-14"
              maxLength={6}
              autoFocus
            />
          </div>
          <Button
            onClick={verifyMFA}
            disabled={isLoading || verifyCode.length !== 6}
            className="w-full bg-bronze hover:bg-bronze/90 text-background"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Verify & Enable
          </Button>
        </div>
      )}

      {step === "done" && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-vollkorn text-xl font-bold mb-2">2FA Enabled!</h3>
          <p className="text-muted-foreground text-sm">
            Your account is now secured with two-factor authentication.
          </p>
        </div>
      )}
    </Card>
  );
};

export default MFASetup;
