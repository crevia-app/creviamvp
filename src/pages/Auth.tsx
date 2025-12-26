import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth state changes (for OAuth redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Defer the async check with setTimeout to avoid deadlock
        setTimeout(async () => {
          // Check if user has completed onboarding by checking for creator/brand profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("user_type, handle, display_name")
            .eq("id", session.user.id)
            .single();

          if (!profileData?.user_type) {
            navigate("/onboarding");
            return;
          }

          // Check if they have completed the extended onboarding
          if (profileData.user_type === "creator") {
            const { data: creatorProfile } = await supabase
              .from("creator_profiles")
              .select("id, creator_types")
              .eq("profile_id", session.user.id)
              .single();
            
            // If no creator profile or no creator_types selected, send to onboarding
            if (!creatorProfile?.creator_types || creatorProfile.creator_types.length === 0) {
              navigate("/onboarding");
              return;
            }
          } else if (profileData.user_type === "brand") {
            const { data: brandProfile } = await supabase
              .from("brand_profiles")
              .select("id, business_type")
              .eq("profile_id", session.user.id)
              .single();
            
            // If no brand profile or no business_type selected, send to onboarding
            if (!brandProfile?.business_type) {
              navigate("/onboarding");
              return;
            }
          }

          // Onboarding complete, go to dashboard
          navigate("/dashboard");
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({ 
          title: "Google sign-in failed 😅", 
          description: error.message, 
          variant: "destructive" 
        });
        setIsGoogleLoading(false);
      }
      // Don't set loading to false on success - redirect will happen
    } catch (err) {
      console.error("Google auth error:", err);
      toast({ 
        title: "Connection hiccup! 📡", 
        description: "Unable to connect to Google. Please try again.", 
        variant: "destructive" 
      });
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        toast({ 
          title: "Apple sign-in failed 😅", 
          description: error.message, 
          variant: "destructive" 
        });
        setIsAppleLoading(false);
      }
      // Don't set loading to false on success - redirect will happen
    } catch (err) {
      console.error("Apple auth error:", err);
      toast({ 
        title: "Connection hiccup! 📡", 
        description: "Unable to connect to Apple. Please try again.", 
        variant: "destructive" 
      });
      setIsAppleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/user-type-selection`,
          },
        });

        if (error) {
          toast({ title: "Oops! 😅", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "You're in! 🎉 Please check your email to confirm your account." });
          navigate("/onboarding");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({ title: "Hmm... 🤔", description: error.message, variant: "destructive" });
        } else if (data.user) {
          // Fetch user profile to check account type
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", data.user.id)
            .single();

          if (profileError || !profileData?.user_type) {
            navigate("/onboarding");
            return;
          }

          // Check if they have completed the extended onboarding
          let onboardingComplete = false;
          
          if (profileData.user_type === "creator") {
            const { data: creatorProfile } = await supabase
              .from("creator_profiles")
              .select("id, creator_types")
              .eq("profile_id", data.user.id)
              .single();
            onboardingComplete = !!(creatorProfile?.creator_types && creatorProfile.creator_types.length > 0);
          } else if (profileData.user_type === "brand") {
            const { data: brandProfile } = await supabase
              .from("brand_profiles")
              .select("id, business_type")
              .eq("profile_id", data.user.id)
              .single();
            onboardingComplete = !!brandProfile?.business_type;
          }

          if (!onboardingComplete) {
            toast({ 
              title: "Almost there! 📝", 
              description: "Please complete your profile setup."
            });
            navigate("/onboarding");
          } else {
            toast({ 
              title: "Welcome back! 👋", 
              description: `Great to see you, ${profileData.user_type}! 🌟` 
            });
            navigate("/dashboard");
          }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    setIsResetting(false);

    if (error) {
      toast({
        title: "Oops! 😅",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your inbox! 📧",
        description: "We sent you a link to reset your password.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-md p-6 md:p-8 mx-4 animate-fade-in">
        <div className="text-center mb-6 md:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 md:mb-6 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-80">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-bronze rounded-lg transition-transform duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105"></div>
            <span className="font-vollkorn text-2xl md:text-3xl font-bold">Crevia</span>
          </Link>
          <h1 className="font-vollkorn text-2xl md:text-3xl font-bold mb-2 animate-fade-in stagger-1 animate-stagger">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground animate-fade-in stagger-2 animate-stagger">
            {isSignup ? "Sign up to get started" : "Log in to continue"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isAppleLoading}
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
          <Button 
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
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground">Or sign in with email</span>
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
                onChange={(e) => setPassword(e.target.value)}
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

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-bronze hover:bg-bronze-dark font-semibold"
          >
            {isLoading ? "Please wait..." : (isSignup ? "Create Account" : "Log In")}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="text-bronze hover:text-bronze-dark font-semibold bronze-underline"
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-vollkorn text-2xl">Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                }}
                className="h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isResetting}
                className="h-12 bg-bronze hover:bg-bronze-dark font-semibold"
              >
                {isResetting ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
