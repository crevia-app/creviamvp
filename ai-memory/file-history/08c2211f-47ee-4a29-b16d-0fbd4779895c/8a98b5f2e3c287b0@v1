import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const hasOAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  return params.has("code") || params.has("token_hash") || window.location.hash.includes("access_token");
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSignup, setIsSignup] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  // const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailConfirmPending, setEmailConfirmPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isResendingConfirm, setIsResendingConfirm] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetOtpCode, setResetOtpCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  // Prevents onAuthStateChange from navigating to /kira while the user is in the password-reset OTP flow.
  const inPasswordResetFlow = useRef(false);
  // True when we landed here from a Google OAuth redirect — hide the form while Supabase exchanges the code.
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(hasOAuthCallback);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push("One special character");
    return errors;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (isSignup) setPasswordErrors(validatePassword(value));
  };

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.nextLevel === "aal2" && aalData?.nextLevel !== aalData?.currentLevel) {
          navigate("/mfa-verify", { replace: true });
        } else {
          navigate("/kira", { replace: true });
        }
      }
    });

    // Listen for auth state changes (for OAuth redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && !inPasswordResetFlow.current) {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData?.nextLevel === "aal2" && aalData?.nextLevel !== aalData?.currentLevel) {
          navigate("/mfa-verify", { replace: true });
        } else {
          navigate("/kira", { replace: true });
        }
      } else if (event !== 'INITIAL_SESSION' && isProcessingOAuth) {
        // Exchange failed — fall back to showing the login form.
        setIsProcessingOAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResendConfirmation = async () => {
    setIsResendingConfirm(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setIsResendingConfirm(false);
    if (error) {
      toast({ title: "Couldn't resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email resent", description: "A new confirmation link has been sent to your inbox." });
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSignup && !termsAccepted) {
      toast({
        title: "Please agree first",
        description: "Tick the Terms of Use and Privacy Policy checkbox before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive"
        });
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google auth error:", err);
      toast({
        title: "Connection error",
        description: "Unable to connect to Google. Please check your internet and try again.",
        variant: "destructive"
      });
      setIsGoogleLoading(false);
    }
  };

  // const handleAppleSignIn = async () => {
  //   setIsAppleLoading(true);
  //   try {
  //     const { error } = await supabase.auth.signInWithOAuth({
  //       provider: 'apple',
  //       options: {
  //         redirectTo: `${window.location.origin}/auth`,
  //         queryParams: {
  //           prompt: 'login',
  //         },
  //       },
  //     });

  //     if (error) {
  //       toast({ 
  //         title: "Apple sign-in failed 😅", 
  //         description: error.message, 
  //         variant: "destructive" 
  //       });
  //       setIsAppleLoading(false);
  //     }
  //   } catch (err) {
  //     console.error("Apple auth error:", err);
  //     toast({ 
  //       title: "Connection hiccup! 📡", 
  //       description: "Unable to connect to Apple. Please try again.", 
  //       variant: "destructive" 
  //     });
  //     setIsAppleLoading(false);
  //   }
  // };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        const errors = validatePassword(password);
        if (errors.length > 0) {
          setPasswordErrors(errors);
          setIsLoading(false);
          return;
        }
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              user_type: 'creator',
            },
          },
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("already registered") || msg.includes("already exists")) {
            toast({
              title: "Account already exists",
              description: "An account with this email already exists. Try logging in instead.",
              variant: "destructive",
            });
            setIsSignup(false);
          } else if (msg.includes("rate limit") || msg.includes("email rate")) {
            toast({
              title: "Too many attempts",
              description: "Please wait a few minutes before trying again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: "Something went wrong on our end. Please try again in a moment.",
              variant: "destructive",
            });
            console.error("Signup error:", error.message);
          }
        } else if (signUpData.session) {
          // User is immediately signed in (email confirmation disabled)
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aalData?.nextLevel === "aal2" && aalData?.nextLevel !== aalData?.currentLevel) {
            navigate("/mfa-verify", { replace: true });
          } else {
            navigate("/kira", { replace: true });
          }
        } else {
          // Email confirmation required — show dedicated screen
          setPendingEmail(email);
          setEmailConfirmPending(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("wrong password")) {
            toast({ title: "Incorrect email or password", description: "Please check your details and try again. If you signed up with Google, use the Google button above.", variant: "destructive" });
          } else if (msg.includes("email not confirmed")) {
            toast({ title: "Email not confirmed", description: "Please check your inbox and click the confirmation link we sent you.", variant: "destructive" });
          } else {
            toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
          }
        } else if (data.user) {
          toast({ title: "Welcome back!", description: "Good to see you." });
          // navigation is handled by the onAuthStateChange SIGNED_IN listener above
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast({ 
        title: "Connection hiccup! 📡", 
        description: "Unable to connect to the server. Please check your internet and try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResetState = () => {
    setResetStep(1);
    setResetEmail("");
    setResetOtpCode("");
    setResetNewPassword("");
    inPasswordResetFlow.current = false;
  };

  // Step 1 — send OTP code to email
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: resetEmail,
      options: { shouldCreateUser: false },
    });
    setIsResetting(false);
    if (error) {
      toast({ title: "Couldn't send code", description: error.message, variant: "destructive" });
    } else {
      setResetStep(2);
    }
  };

  // Step 2 — verify the 6-digit code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    inPasswordResetFlow.current = true;
    const { error } = await supabase.auth.verifyOtp({
      email: resetEmail,
      token: resetOtpCode,
      type: "email",
    });
    setIsVerifyingOtp(false);
    if (error) {
      inPasswordResetFlow.current = false;
      toast({ title: "Invalid code", description: "The code is wrong or expired. Try resending.", variant: "destructive" });
    } else {
      setResetStep(3);
    }
  };

  // Step 3 — set a new password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePassword(resetNewPassword);
    if (errors.length > 0) {
      toast({ title: "Weak password", description: "Please meet all the password requirements.", variant: "destructive" });
      return;
    }
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: resetNewPassword });
    setIsUpdatingPassword(false);
    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You're now logged in." });
      setShowForgotPassword(false);
      clearResetState();
      navigate("/kira", { replace: true });
    }
  };

  if (isProcessingOAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-bronze" />
          <p className="font-poppins text-muted-foreground">Signing you in…</p>
        </div>
      </div>
    );
  }

  if (emailConfirmPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md p-6 md:p-8 mx-4 animate-fade-in text-center">
          <div className="mb-6">
            <img src="/crevia-logo.png" alt="Crevia Logo" className="w-10 h-10 mx-auto mb-4" />
            <h1 className="font-vollkorn text-2xl font-bold mb-2">Confirm your email</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              An email was sent to<br />
              <span className="font-semibold text-foreground">{pendingEmail}</span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Kindly click the link in the email to confirm your account and get access to Kira. Check your spam folder if you don't see it.
          </p>
          <Button
            className="w-full h-12 bg-bronze hover:bg-bronze-dark font-semibold"
            onClick={handleResendConfirmation}
            disabled={isResendingConfirm}
          >
            {isResendingConfirm ? "Sending..." : "Resend confirmation link"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-md p-6 md:p-8 mx-4 animate-fade-in">
        <div className="text-center mb-6 md:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 md:mb-6 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-80">
            <img 
              src="/crevia-logo.png" 
              alt="Crevia Logo" 
              className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105" 
            />
            <span className="font-vollkorn text-2xl md:text-3xl font-bold">Crevia</span>
          </Link>
          <h1 className="font-vollkorn text-2xl md:text-3xl font-bold mb-2 animate-fade-in stagger-1 animate-stagger">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground animate-fade-in stagger-2 animate-stagger">
            {isSignup ? "Sign up to get started" : "Log in to continue"}
          </p>
        </div>


        <div className="justify-center">
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
             Google
          </Button>
          {/* <Button 
            variant="outline" 
            className="h-12"
            onClick={handleAppleSignIn}
            disabled={isGoogleLoading || isAppleLoading}
          >
            {isAppleLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )}
            Apple
          </Button> */}
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground">{isSignup ? "Or sign up with email" : "Or sign in with email"}</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {!isSignup && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-bronze hover:text-bronze-dark bronze-underline transition-all duration-300"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className="h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {isSignup && password.length > 0 && (
            <div className="space-y-1.5">
              {["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number", "One special character"].map((rule) => (
                <div key={rule} className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    passwordErrors.includes(rule) ? "bg-destructive" : "bg-primary"
                  )} />
                  <span className={cn(
                    "transition-colors",
                    passwordErrors.includes(rule) ? "text-muted-foreground" : "text-primary"
                  )}>{rule}</span>
                </div>
              ))}
            </div>
          )}

          {isSignup && (
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5 shrink-0"
              />
              <label
                htmlFor="terms"
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
              >
                By signing up, you agree to the{" "}
                <Link
                  to="/terms-of-service"
                  className="text-bronze hover:text-bronze-dark underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  className="text-bronze hover:text-bronze-dark underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || (isSignup && !termsAccepted)}
            className="w-full h-12 bg-bronze hover:bg-bronze-dark font-semibold"
          >
            {isLoading ? "Please wait..." : (isSignup ? "Create Account" : "Log In")}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsSignup((v) => !v); setTermsAccepted(false); }}
            className="text-bronze hover:text-bronze-dark font-semibold bronze-underline"
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </Card>

      {/* Forgot Password Dialog — 3-step: email → OTP code → new password */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => { setShowForgotPassword(open); if (!open) clearResetState(); }}>
        <DialogContent className="sm:max-w-md">

          {/* Step 1: enter email */}
          {resetStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="font-vollkorn text-2xl">Reset your password</DialogTitle>
                <DialogDescription>Enter your email and we'll send a verification code.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)} className="h-12">Cancel</Button>
                  <Button type="submit" disabled={isResetting} className="h-12 bg-bronze hover:bg-bronze-dark font-semibold">
                    {isResetting ? "Sending..." : "Send Code"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {/* Step 2: enter the 6-digit code */}
          {resetStep === 2 && (
            <>
              <DialogHeader>
                <DialogTitle className="font-vollkorn text-2xl">Enter the code</DialogTitle>
                <DialogDescription>
                  We sent a 6-digit code to <span className="font-semibold text-foreground">{resetEmail}</span>. Enter it below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp-code">Verification code</Label>
                  <Input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, ""))}
                    required
                    className="h-12 text-center text-xl tracking-widest font-mono"
                    autoFocus
                  />
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="button" variant="outline" onClick={() => setResetStep(1)} className="h-12">Back</Button>
                  <Button type="submit" disabled={isVerifyingOtp || resetOtpCode.length < 6} className="h-12 bg-bronze hover:bg-bronze-dark font-semibold">
                    {isVerifyingOtp ? "Verifying..." : "Verify Code"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {/* Step 3: set new password */}
          {resetStep === 3 && (
            <>
              <DialogHeader>
                <DialogTitle className="font-vollkorn text-2xl">Set new password</DialogTitle>
                <DialogDescription>Choose a strong password for your account.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pw">New Password</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    placeholder="••••••••"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                    className="h-12"
                    autoFocus
                  />
                </div>
                {resetNewPassword.length > 0 && (
                  <div className="space-y-1.5">
                    {["At least 8 characters","One uppercase letter","One lowercase letter","One number","One special character"].map((rule) => {
                      const errors = validatePassword(resetNewPassword);
                      const passing = !errors.includes(rule);
                      return (
                        <div key={rule} className="flex items-center gap-2 text-xs">
                          <div className={`w-1.5 h-1.5 rounded-full ${passing ? "bg-primary" : "bg-destructive"}`} />
                          <span className={passing ? "text-primary" : "text-muted-foreground"}>{rule}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={isUpdatingPassword} className="w-full h-12 bg-bronze hover:bg-bronze-dark font-semibold">
                    {isUpdatingPassword ? "Saving..." : "Set Password"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
