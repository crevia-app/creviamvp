import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface MFASetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const MFASetup = ({ onComplete, onSkip }: MFASetupProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"intro" | "sent" | "done">("intro");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const sendCode = async () => {
    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No email found on your account.");

      setEmail(user.email);

      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;

      setStep("sent");
      toast({
        title: "Code sent",
        description: `We sent a 6-digit code to ${user.email}`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const verifyAndEnable = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;

      await supabase.auth.updateUser({
        data: { two_fa_enabled: true, two_fa_method: "email" },
      });

      // Unenroll any old TOTP factors from the previous setup
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp?.length) {
        for (const factor of factors.totp) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      setStep("done");
      setTimeout(onComplete, 1500);
    } catch (err: any) {
      toast({
        title: "Invalid code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      setCode("");
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
            Two-factor authentication means that after your password, you'll confirm it's really you with a one-time code sent to your email. This keeps your account protected even if your password is ever compromised.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={sendCode}
              disabled={isSending}
              className="bg-bronze hover:bg-bronze/90 text-background"
            >
              {isSending
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : <Mail className="w-4 h-4 mr-2" />}
              Send Verification Code
            </Button>
            {onSkip && (
              <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
                Skip for now
              </Button>
            )}
          </div>
        </div>
      )}

      {step === "sent" && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-bronze" />
          </div>
          <h3 className="font-vollkorn text-xl font-bold mb-2">Check your email</h3>
          <p className="text-muted-foreground text-sm mb-1">We sent a 6-digit code to</p>
          <p className="font-medium text-sm mb-6">{email}</p>

          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              onComplete={verifyAndEnable}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={verifyAndEnable}
            disabled={isLoading || code.length !== 6}
            className="w-full bg-bronze hover:bg-bronze/90 text-background mb-3"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Verify & Enable 2FA
          </Button>
          <button
            onClick={sendCode}
            disabled={isSending}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSending ? "Sending..." : "Didn't get it? Resend code"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-vollkorn text-xl font-bold mb-2">2FA Enabled!</h3>
          <p className="text-muted-foreground text-sm">
            Your account is now secured. You'll receive an email code each time you sign in.
          </p>
        </div>
      )}
    </Card>
  );
};

export default MFASetup;
