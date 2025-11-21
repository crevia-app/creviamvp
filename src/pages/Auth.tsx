import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Building2 } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignup = searchParams.get("signup") === "true";
  const [mode, setMode] = useState<"choice" | "creator" | "brand">(isSignup ? "choice" : "creator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic will be implemented with Lovable Cloud
    console.log("Auth:", { email, password, mode });
  };

  if (isSignup && mode === "choice") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-bronze rounded-lg"></div>
              <span className="font-vollkorn text-3xl font-bold">Crevia</span>
            </Link>
            <h1 className="font-vollkorn text-4xl md:text-5xl font-bold mb-4">
              Join <span className="text-gradient-bronze">Crevia</span>
            </h1>
            <p className="text-xl text-muted-foreground">Choose your account type</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-bronze group"
              onClick={() => navigate("/onboarding/creator")}
            >
              <div className="w-16 h-16 rounded-2xl bg-bronze/10 group-hover:bg-bronze flex items-center justify-center mb-6 transition-colors">
                <Users className="w-8 h-8 text-bronze group-hover:text-white transition-colors" />
              </div>
              <h2 className="font-vollkorn text-3xl font-bold mb-3">I'm a Creator</h2>
              <p className="text-muted-foreground mb-6">
                Find brand deals, grow your audience, and manage your creator business all in one place.
              </p>
              <Button className="w-full bg-bronze hover:bg-bronze-dark font-semibold">
                Continue as Creator
              </Button>
            </Card>

            <Card 
              className="p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-bronze group"
              onClick={() => navigate("/onboarding/brand")}
            >
              <div className="w-16 h-16 rounded-2xl bg-bronze/10 group-hover:bg-bronze flex items-center justify-center mb-6 transition-colors">
                <Building2 className="w-8 h-8 text-bronze group-hover:text-white transition-colors" />
              </div>
              <h2 className="font-vollkorn text-3xl font-bold mb-3">I'm a Brand</h2>
              <p className="text-muted-foreground mb-6">
                Discover creators, run campaigns, and track performance with powerful analytics.
              </p>
              <Button className="w-full bg-bronze hover:bg-bronze-dark font-semibold">
                Continue as Brand
              </Button>
            </Card>
          </div>

          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="text-bronze hover:text-bronze-dark font-semibold bronze-underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-bronze rounded-lg"></div>
            <span className="font-vollkorn text-3xl font-bold">Crevia</span>
          </Link>
          <h1 className="font-vollkorn text-3xl font-bold mb-2">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignup 
              ? `Sign up as a ${mode === "creator" ? "Creator" : "Brand"}` 
              : "Sign in to continue"}
          </p>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-bronze hover:bg-bronze-dark font-semibold">
            {isSignup ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" className="h-12">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-12">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Apple
            </Button>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link 
            to={isSignup ? "/auth" : "/auth?signup=true"} 
            className="text-bronze hover:text-bronze-dark font-semibold bronze-underline"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Auth;
