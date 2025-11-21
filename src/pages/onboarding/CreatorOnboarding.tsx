import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Instagram, Youtube, Twitter, Facebook, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const creatorTypes = [
  "Content Creator",
  "UGC Creator",
  "Coach / Educator",
  "Designer",
  "Photographer / Videographer",
  "Writer",
  "Influencer",
  "Other"
];

const creatorGoals = [
  "Find brand deals",
  "Earn consistently from my skills",
  "Grow my audience",
  "Build my personal brand",
  "Organize my workflow",
  "Sell templates (coming soon)",
  "Other"
];

const CreatorOnboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (step / 4) * 100;

  const toggleSelection = (item: string, selected: string[], setSelected: (items: string[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedTypes.length === 0) {
      toast({ title: "Please select at least one option" });
      return;
    }
    if (step === 2 && selectedGoals.length === 0) {
      toast({ title: "Please select at least one goal" });
      return;
    }
    if (step === 3 && !handle) {
      toast({ title: "Please choose a handle" });
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    // Store creator data and complete onboarding
    // This will be implemented with backend
    toast({ title: "Welcome to Crevia! 🎉" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 bg-bronze rounded-lg"></div>
            <span className="font-vollkorn text-3xl font-bold">Crevia</span>
          </div>
          <Progress value={progress} className="mb-4 h-2" />
          <p className="text-sm text-muted-foreground">Step {step} of 4</p>
        </div>

        {/* Kira Mascot */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bronze to-bronze-light flex items-center justify-center">
            <span className="text-3xl">🎨</span>
          </div>
        </div>

        <Card className="p-8 md:p-12">
          {/* Step 1: Define Your Work */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-vollkorn text-3xl font-bold mb-2">What type of creator are you?</h2>
                <p className="text-muted-foreground">Select all that apply</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {creatorTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    className={`h-auto py-4 justify-start text-left font-medium ${
                      selectedTypes.includes(type) ? "bg-bronze hover:bg-bronze-dark" : ""
                    }`}
                    onClick={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
                  >
                    {selectedTypes.includes(type) && <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {type}
                  </Button>
                ))}
              </div>

              <Button onClick={handleNext} className="w-full h-12 bg-bronze hover:bg-bronze-dark font-semibold">
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Define Your Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-vollkorn text-3xl font-bold mb-2">What do you want to achieve on Crevia?</h2>
                <p className="text-muted-foreground">Select all that apply</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {creatorGoals.map((goal) => (
                  <Button
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    className={`h-auto py-4 justify-start text-left font-medium ${
                      selectedGoals.includes(goal) ? "bg-bronze hover:bg-bronze-dark" : ""
                    }`}
                    onClick={() => toggleSelection(goal, selectedGoals, setSelectedGoals)}
                  >
                    {selectedGoals.includes(goal) && <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {goal}
                  </Button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1 h-12 bg-bronze hover:bg-bronze-dark font-semibold">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Create Crevia Link */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-vollkorn text-3xl font-bold mb-2">Create Your Crevia Link</h2>
                <p className="text-muted-foreground">This will be your public profile</p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-bronze/20">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full bg-bronze hover:bg-bronze-dark">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="handle">Choose your handle</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">crevia.app/</span>
                    <Input
                      id="handle"
                      placeholder="yourname"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Short bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Add social links</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Button variant="outline" className="justify-start">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Facebook className="w-4 h-4 mr-2" />
                      TikTok
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1 h-12 bg-bronze hover:bg-bronze-dark font-semibold">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Verify Profile */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bronze to-bronze-light flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">😊</span>
                </div>
                <h2 className="font-vollkorn text-3xl font-bold mb-2">Let's keep Crevia safe and trusted!</h2>
                <p className="text-muted-foreground">Choose your verification method</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-2 hover:border-bronze transition-all cursor-pointer group">
                  <h3 className="font-vollkorn text-xl font-bold mb-2">Verify with ID</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your national ID or passport. Fast • Secure • Powered by Persona/Sumsub
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Unlock the Verified Badge</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Higher visibility in brand search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Boosted trust with brands</span>
                    </div>
                  </div>
                  <Button className="w-full bg-bronze hover:bg-bronze-dark">Upload ID</Button>
                </Card>

                <Card className="p-6 border-2 hover:border-bronze transition-all cursor-pointer group">
                  <h3 className="font-vollkorn text-xl font-bold mb-2">Verify with Social Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect Instagram, TikTok, or YouTube. Followers + engagement confirm your authenticity.
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Instant verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Shows real influence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Higher trust for collaborations</span>
                    </div>
                  </div>
                  <Button className="w-full bg-bronze hover:bg-bronze-dark">Connect Social</Button>
                </Card>
              </div>

              <div className="text-center">
                <Button variant="ghost" onClick={handleComplete} className="text-muted-foreground">
                  Skip for now
                </Button>
              </div>

              <Button variant="outline" onClick={() => setStep(3)} className="w-full h-12">
                Back
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
