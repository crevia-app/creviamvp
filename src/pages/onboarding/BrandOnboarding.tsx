import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, Instagram, Linkedin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const businessTypes = [
  "Startup",
  "Agency",
  "Company",
  "Corporate",
  "NGO",
  "Other"
];

const brandGoals = [
  "Discover creators faster",
  "Run organized campaigns",
  "Track performance & insights",
  "Scale UGC operations",
  "Launch multiple campaigns",
  "Build long-term creator relationships",
  "Other"
];

const BrandOnboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [handle, setHandle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [otherTypeText, setOtherTypeText] = useState("");
  const [otherGoalText, setOtherGoalText] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (step / 4) * 100;

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedType) {
      toast({ title: "Hold up! ✋ Please select your business type" });
      return;
    }
    if (step === 2 && selectedGoals.length === 0) {
      toast({ title: "Almost there! 🎯 Please select at least one goal" });
      return;
    }
    if (step === 3 && (!handle || !brandName)) {
      toast({ title: "Just a bit more! 📝 Please complete all fields" });
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    toast({ title: "You're all set! 🚀 Welcome to Crevia!" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bronze/5 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 bg-bronze rounded-lg"></div>
            <span className="font-vollkorn text-3xl font-bold">Crevia</span>
          </div>
          <Progress value={progress} className="mb-4 h-2" />
          <p className="text-sm text-muted-foreground">Step {step} of 4</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bronze to-bronze-light flex items-center justify-center">
            <span className="text-3xl">🏢</span>
          </div>
        </div>

        <Card className="p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-vollkorn text-3xl font-bold mb-2">Which best describes your brand? 🏢</h2>
                <p className="text-muted-foreground">Choose one option</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {businessTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    className={`h-auto py-4 justify-start text-left font-medium ${
                      selectedType === type ? "bg-bronze hover:bg-bronze-dark" : ""
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    {selectedType === type && <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {type}
                  </Button>
                ))}
              </div>

              {selectedType === "Other" && (
                <div className="animate-fade-in-up">
                  <Label htmlFor="otherType" className="text-sm font-medium">
                    Please specify your business type
                  </Label>
                  <Input
                    id="otherType"
                    placeholder="Enter your business type..."
                    value={otherTypeText}
                    onChange={(e) => setOtherTypeText(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}

              <Button onClick={handleNext} className="w-full h-12 bg-bronze hover:bg-bronze-dark font-semibold">
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-vollkorn text-3xl font-bold mb-2">What do you want to achieve? 🎯</h2>
                <p className="text-muted-foreground">Select all that apply</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {brandGoals.map((goal) => (
                  <Button
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    className={`h-auto py-4 justify-start text-left font-medium ${
                      selectedGoals.includes(goal) ? "bg-bronze hover:bg-bronze-dark" : ""
                    }`}
                    onClick={() => toggleGoal(goal)}
                  >
                    {selectedGoals.includes(goal) && <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {goal}
                  </Button>
                ))}
              </div>

              {selectedGoals.includes("Other") && (
                <div className="animate-fade-in-up">
                  <Label htmlFor="otherGoal" className="text-sm font-medium">
                    Please specify your goal
                  </Label>
                  <Textarea
                    id="otherGoal"
                    placeholder="Tell us what you want to achieve..."
                    value={otherGoalText}
                    onChange={(e) => setOtherGoalText(e.target.value)}
                    rows={2}
                    className="mt-2"
                  />
                </div>
              )}

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

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-vollkorn text-3xl font-bold mb-2">Create Your Crevia Link ✨</h2>
                <p className="text-muted-foreground">Your brand-facing page for creators</p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-secondary flex items-center justify-center border-4 border-bronze/20">
                    <Upload className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full bg-bronze hover:bg-bronze-dark">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    placeholder="Your Brand"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="handle">Choose your handle</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">crevia.app/</span>
                    <Input
                      id="handle"
                      placeholder="yourbrand"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Brand description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell creators about your brand..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
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

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bronze to-bronze-light flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h2 className="font-vollkorn text-3xl font-bold mb-2">Almost there! 🏆</h2>
                <p className="text-muted-foreground">Let's confirm your brand so creators trust your campaigns</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-2 hover:border-bronze transition-all cursor-pointer">
                  <h3 className="font-vollkorn text-xl font-bold mb-2">Verify with Business Docs</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your business registration or certificate. Fast • Secure • For official verification.
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Trusted by creators</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Unlock "Verified Brand" badge</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Access premium filters + analytics</span>
                    </div>
                  </div>
                  <Button className="w-full bg-bronze hover:bg-bronze-dark">Upload Document</Button>
                </Card>

                <Card className="p-6 border-2 hover:border-bronze transition-all cursor-pointer">
                  <h3 className="font-vollkorn text-xl font-bold mb-2">Verify with Social Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your official LinkedIn or Instagram account. Instant confirmation of authenticity.
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Quick and reliable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Trusted by creators</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze" />
                      <span>Unlock brand insights</span>
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

export default BrandOnboarding;
