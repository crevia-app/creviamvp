import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Lightbulb, 
  Sparkles, 
  Send, 
  Heart,
  Zap,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Feedback = () => {
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState<"feedback" | "bug">("feedback");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureProblem, setFeatureProblem] = useState("");
  const [emailMe, setEmailMe] = useState(true);

  const handleSubmitFeedback = () => {
    toast({
      title: feedbackType === "bug" ? "Bug report submitted! 🐛" : "Thank you for your feedback! 🎉",
      description: feedbackType === "bug" 
        ? "Our team will look into this right away." 
        : "Your voice shapes Crevia's future. We'll review this carefully.",
    });
    setMessage("");
    setCategory("");
  };

  const handleSubmitFeature = () => {
    toast({
      title: "Feature request submitted! 💡",
      description: "Great idea! We'll evaluate this for our roadmap.",
    });
    setFeatureTitle("");
    setFeatureDescription("");
    setFeatureProblem("");
  };

  const feedbackCategories = feedbackType === "bug" 
    ? [
        { value: "dashboard", label: "Dashboard" },
        { value: "campaigns", label: "Campaigns" },
        { value: "messaging", label: "Messaging" },
        { value: "payments", label: "Payments" },
        { value: "profile", label: "Profile" },
        { value: "search", label: "Search/Discovery" },
        { value: "mobile", label: "Mobile Experience" },
        { value: "other", label: "Other" },
      ]
    : [
        { value: "platform", label: "Platform Experience" },
        { value: "payments", label: "Payments & Escrow" },
        { value: "search", label: "Creator/Brand Discovery" },
        { value: "campaigns", label: "Campaign Tools" },
        { value: "messaging", label: "Messaging System" },
        { value: "kira", label: "Kira AI Assistant" },
        { value: "other", label: "Other" },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-bronze/5 via-transparent to-bronze/10" />
        <div className="absolute top-10 left-5 md:top-20 md:left-10 w-40 md:w-72 h-40 md:h-72 bg-bronze/10 rounded-full blur-3xl" />
        <div className="absolute bottom-5 right-5 md:bottom-10 md:right-10 w-48 md:w-96 h-48 md:h-96 bg-bronze/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 py-10 md:py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 md:mb-6 border-bronze/50 text-bronze">
              <Sparkles className="w-3 h-3 mr-1" />
              Your Voice Matters
            </Badge>
            
            <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-foreground via-bronze to-foreground bg-clip-text text-transparent leading-tight">
              Shape the Future of Crevia
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-2">
              Every piece of feedback, every feature idea—they all help us build the platform 
              that creators and brands truly deserve.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-6xl">
        <Tabs defaultValue="thoughts" className="space-y-6 md:space-y-8">
          <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 h-12 md:h-14 p-1 bg-muted/50">
            <TabsTrigger 
              value="thoughts" 
              className="data-[state=active]:bg-bronze data-[state=active]:text-white flex items-center justify-center gap-2 h-full text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Thoughts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="feature"
              className="data-[state=active]:bg-bronze data-[state=active]:text-white flex items-center justify-center gap-2 h-full text-sm"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Feature</span>
            </TabsTrigger>
          </TabsList>

          {/* Share Your Thoughts Tab (Feedback + Bug) */}
          <TabsContent value="thoughts" className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
              {/* Feedback Form */}
              <Card className="lg:col-span-3 p-5 sm:p-6 md:p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-vollkorn text-xl md:text-2xl font-bold">Share Your Thoughts</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Feedback, suggestions, or bug reports</p>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {/* Type Selector */}
                  <div>
                    <Label className="text-sm font-medium">What type of feedback is this?</Label>
                    <div className="flex gap-3 mt-2">
                      <Button
                        type="button"
                        variant={feedbackType === "feedback" ? "default" : "outline"}
                        className={feedbackType === "feedback" 
                          ? "flex-1 bg-bronze hover:bg-bronze-dark text-white" 
                          : "flex-1"
                        }
                        onClick={() => { setFeedbackType("feedback"); setCategory(""); }}
                      >
                        General Feedback
                      </Button>
                      <Button
                        type="button"
                        variant={feedbackType === "bug" ? "default" : "outline"}
                        className={feedbackType === "bug" 
                          ? "flex-1 bg-bronze hover:bg-bronze-dark text-white" 
                          : "flex-1"
                        }
                        onClick={() => { setFeedbackType("bug"); setCategory(""); }}
                      >
                        Report a Bug
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">
                      {feedbackType === "bug" ? "Where did you encounter this?" : "What area does this relate to?"}
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-2 h-11 md:h-12 bg-background/50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {feedbackCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium">
                      {feedbackType === "bug" ? "Describe the bug" : "Your Feedback"}
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={feedbackType === "bug" 
                        ? "What happened? What did you expect instead? Include steps to reproduce if possible." 
                        : "Tell us what's on your mind. What's working well? What could be better?"
                      }
                      rows={5}
                      className="mt-2 bg-background/50 resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg bg-muted/30 border border-border/50 gap-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="emailMe"
                        checked={emailMe}
                        onCheckedChange={setEmailMe}
                      />
                      <Label htmlFor="emailMe" className="text-xs sm:text-sm cursor-pointer">
                        Keep me updated on this feedback
                      </Label>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmitFeedback}
                    className="w-full h-11 md:h-12 bg-gradient-to-r from-bronze to-bronze-dark hover:from-bronze-dark hover:to-bronze text-white font-medium"
                    disabled={!category || !message}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {feedbackType === "bug" ? "Submit Bug Report" : "Submit Feedback"}
                  </Button>
                </div>
              </Card>

              {/* Sidebar */}
              <div className="lg:col-span-2">
                <Card className="p-4 md:p-6 border-bronze/30 bg-gradient-to-br from-bronze/5 to-transparent">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-bronze to-bronze-dark rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg shrink-0">
                      K
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1 text-sm md:text-base">Kira says:</p>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {feedbackType === "bug" 
                          ? "Don't worry—bugs happen! Our engineering team takes every report seriously and works quickly to fix issues."
                          : "Every single piece of feedback gets read by our team. You're directly influencing what we build next!"
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Feature Request Tab */}
          <TabsContent value="feature" className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
              {/* Feature Request Form */}
              <Card className="lg:col-span-3 p-5 sm:p-6 md:p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-vollkorn text-xl md:text-2xl font-bold">Request a Feature</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Got an idea that would make Crevia better?</p>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <Label htmlFor="featureTitle" className="text-sm font-medium">Feature Title</Label>
                    <Input
                      id="featureTitle"
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      placeholder="Give your feature a catchy name"
                      className="mt-2 h-11 md:h-12 bg-background/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="featureProblem" className="text-sm font-medium">
                      What problem does this solve?
                    </Label>
                    <Textarea
                      id="featureProblem"
                      value={featureProblem}
                      onChange={(e) => setFeatureProblem(e.target.value)}
                      placeholder="Describe the pain point or challenge you're facing..."
                      rows={3}
                      className="mt-2 bg-background/50 resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="featureDescription" className="text-sm font-medium">
                      How do you envision it working?
                    </Label>
                    <Textarea
                      id="featureDescription"
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                      placeholder="Describe your ideal solution. Don't hold back!"
                      rows={4}
                      className="mt-2 bg-background/50 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs md:text-sm">
                      Popular requests get fast-tracked to our roadmap!
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmitFeature}
                    className="w-full h-11 md:h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium"
                    disabled={!featureTitle || !featureProblem}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Submit Feature Request
                  </Button>
                </div>
              </Card>

              {/* Feature Sidebar */}
              <div className="lg:col-span-2">
                <Card className="p-4 md:p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Tips for Great Requests
                  </h3>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      Focus on the problem, not just the solution
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      Include real examples from your workflow
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      Explain who else might benefit
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <Card className="p-6 sm:p-8 md:p-12 border-bronze/30 bg-gradient-to-br from-bronze/10 via-transparent to-bronze/5 max-w-2xl mx-auto">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-bronze mx-auto mb-3 md:mb-4" />
            <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-2 md:mb-3">
              Together, We Build Something Great
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              Crevia isn't just a platform—it's a community shaped by creators and brands like you.
            </p>
            <div className="flex items-center justify-center gap-2 text-bronze text-sm md:text-base">
              <Heart className="w-4 h-4 md:w-5 md:h-5 fill-bronze" />
              <span className="font-medium">Powered by your feedback</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
