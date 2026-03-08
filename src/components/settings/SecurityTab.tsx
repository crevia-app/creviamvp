import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Shield,
  KeyRound,
  Fingerprint,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// --- WebAuthn Helpers ---
const BIOMETRIC_CRED_KEY = "crevia_webauthn_cred_id";
const BIOMETRIC_ENABLED_KEY = "crevia_biometric_enabled";

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function isWebAuthnSupported(): boolean {
  return !!(window.PublicKeyCredential && navigator.credentials);
}

async function isPlatformAuthAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

async function registerBiometric(userId: string): Promise<string | null> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userIdBytes = new TextEncoder().encode(userId);

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Crevia", id: window.location.hostname },
      user: {
        id: userIdBytes,
        name: userId,
        displayName: "Crevia User",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },   // ES256
        { alg: -257, type: "public-key" },  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) return null;
  const credId = bufferToBase64url(credential.rawId);
  localStorage.setItem(BIOMETRIC_CRED_KEY, credId);
  localStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
  return credId;
}

async function verifyBiometric(): Promise<boolean> {
  const storedCredId = localStorage.getItem(BIOMETRIC_CRED_KEY);
  if (!storedCredId) return false;

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  try {
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            id: base64urlToBuffer(storedCredId),
            type: "public-key",
            transports: ["internal"],
          },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;
    return !!assertion;
  } catch {
    return false;
  }
}

function removeBiometric() {
  localStorage.removeItem(BIOMETRIC_CRED_KEY);
  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
}
// --- End WebAuthn Helpers ---

const SecurityTab = () => {
  const { toast } = useToast();
  const { t } = useLanguage();

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA / biometric toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(
    () => localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true"
  );
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);

  // Sign out all devices dialog
  const [showSignOutAll, setShowSignOutAll] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    isPlatformAuthAvailable().then(setBiometricAvailable);
  }, []);

  const handleBiometricToggle = useCallback(async (checked: boolean) => {
    setBiometricBusy(true);
    try {
      if (checked) {
        if (!biometricAvailable) {
          toast({
            title: "Not supported",
            description: "Your device or browser doesn't support biometric authentication.",
            variant: "destructive",
          });
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({ title: "Not logged in", variant: "destructive" });
          return;
        }

        const credId = await registerBiometric(session.user.id);
        if (!credId) {
          toast({
            title: "Registration cancelled",
            description: "Biometric registration was cancelled or failed.",
            variant: "destructive",
          });
          return;
        }

        setBiometricEnabled(true);
        toast({
          title: "Biometric login enabled",
          description: "You can now use fingerprint or Face ID to unlock Crevia.",
        });
      } else {
        // Verify identity before disabling
        const verified = await verifyBiometric();
        if (!verified) {
          toast({
            title: "Verification failed",
            description: "Biometric verification is required to disable this feature.",
            variant: "destructive",
          });
          return;
        }
        removeBiometric();
        setBiometricEnabled(false);
        toast({
          title: "Biometric login disabled",
          description: "Biometric credentials have been removed from this device.",
        });
      }
    } catch (err: any) {
      console.error("Biometric error:", err);
      toast({
        title: "Biometric error",
        description: err?.message || "Something went wrong with biometric authentication.",
        variant: "destructive",
      });
    } finally {
      setBiometricBusy(false);
    }
  }, [biometricAvailable, toast]);

  // Password strength checker
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: "Weak", color: "text-destructive", bg: "bg-destructive" };
    if (score <= 3) return { label: "Fair", color: "text-yellow-500", bg: "bg-yellow-500" };
    if (score <= 4) return { label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" };
    return { label: "Very Strong", color: "text-emerald-600", bg: "bg-emerald-600" };
  };

  const passwordChecks = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "Lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "Number", met: /[0-9]/.test(newPassword) },
    { label: "Special character (!@#$...)", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "destructive" });
      return;
    }
    if (!passwordChecks.every((c) => c.met)) {
      toast({ title: "Weak password", description: "Please meet all password requirements.", variant: "destructive" });
      return;
    }

    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Failed to update password", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      toast({ title: "Signed out everywhere", description: "All sessions have been terminated." });
      window.location.href = "/auth";
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSigningOut(false);
      setShowSignOutAll(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="p-4 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <KeyRound className="w-5 h-5 text-bronze" />
          <h2 className="font-vollkorn text-xl md:text-2xl font-bold">Password</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Keep your account secure with a strong, unique password.
        </p>

        {!showChangePassword ? (
          <Button
            variant="outline"
            onClick={() => setShowChangePassword(true)}
            className="gap-2"
          >
            <Lock className="w-4 h-4" /> Change Password
          </Button>
        ) : (
          <div className="space-y-4 max-w-md">
            {/* New Password */}
            <div>
              <Label htmlFor="newPassword" className="text-sm">New Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {newPassword && (
                <div className="mt-3 space-y-2">
                  {/* Strength bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.bg}`}
                        style={{
                          width: `${(passwordChecks.filter((c) => c.met).length / passwordChecks.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
                  </div>

                  {/* Checklist */}
                  <ul className="space-y-1">
                    {passwordChecks.map((check) => (
                      <li key={check.label} className="flex items-center gap-2 text-xs">
                        {check.met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className={check.met ? "text-foreground" : "text-muted-foreground"}>
                          {check.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordChecks.every((c) => c.met) || newPassword !== confirmPassword}
                className="bg-bronze hover:bg-bronze-dark"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowChangePassword(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-4 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <Smartphone className="w-5 h-5 text-bronze" />
          <h2 className="font-vollkorn text-xl md:text-2xl font-bold">Two-Factor Authentication</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Add an extra layer of protection. Even if your password is compromised, your account stays safe.
        </p>

        <div className="space-y-5">
          <div className="flex items-start md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Label className="text-sm md:text-base">Authenticator App</Label>
                {twoFactorEnabled ? (
                  <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-[10px]">Not set up</Badge>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Use Google Authenticator, Authy, or any TOTP app to generate verification codes.
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                setTwoFactorEnabled(checked);
                toast({
                  title: checked ? "2FA enabled (demo)" : "2FA disabled (demo)",
                  description: "Full authenticator setup coming soon.",
                });
              }}
              className="flex-shrink-0"
            />
          </div>
        </div>
      </Card>

      {/* Biometric Authentication */}
      <Card className="p-4 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <Fingerprint className="w-5 h-5 text-bronze" />
          <h2 className="font-vollkorn text-xl md:text-2xl font-bold">Biometric Login</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Use your device's biometric sensor to unlock Crevia quickly and securely.
        </p>

        <div className="flex items-start md:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Label className="text-sm md:text-base">Fingerprint / Face ID</Label>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Requires a device with biometric hardware. Available on supported browsers and mobile devices.
            </p>
          </div>
          <Switch
            checked={biometricEnabled}
            onCheckedChange={(checked) => {
              setBiometricEnabled(checked);
              toast({
                title: checked ? "Biometric login enabled (demo)" : "Biometric login disabled",
                description: "Full biometric support coming soon.",
              });
            }}
            className="flex-shrink-0"
          />
        </div>
      </Card>

      {/* Session Security */}
      <Card className="p-4 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-5 h-5 text-bronze" />
          <h2 className="font-vollkorn text-xl md:text-2xl font-bold">Session & Login Security</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Monitor and control your active sessions across all devices.
        </p>

        <div className="space-y-5">
          <div className="flex items-start md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Label className="text-sm md:text-base">Login Alerts</Label>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Get notified when someone signs into your account from a new device or location.
              </p>
            </div>
            <Switch
              checked={loginAlertsEnabled}
              onCheckedChange={(checked) => {
                setLoginAlertsEnabled(checked);
                toast({
                  title: checked ? "Login alerts enabled" : "Login alerts disabled",
                  description: checked
                    ? "You'll be notified of new sign-ins."
                    : "You won't be notified of new sign-ins.",
                });
              }}
              className="flex-shrink-0"
            />
          </div>

          <Separator />

          <div>
            <Label className="text-sm md:text-base text-destructive">Sign Out All Devices</Label>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 mb-3">
              End all active sessions everywhere. You'll need to sign in again on every device.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowSignOutAll(true)}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out Everywhere
            </Button>
          </div>
        </div>
      </Card>

      {/* Sign out confirmation dialog */}
      <Dialog open={showSignOutAll} onOpenChange={setShowSignOutAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Sign Out All Devices?
            </DialogTitle>
            <DialogDescription>
              This will terminate all your active sessions across every device and browser. You'll be signed out immediately and will need to log in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowSignOutAll(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOutAllDevices}
              disabled={signingOut}
            >
              {signingOut ? "Signing out..." : "Yes, sign out everywhere"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityTab;
