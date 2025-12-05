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
  Bug, 
  Sparkles, 
  Send, 
  Heart,
  Star,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Feedback = () => {
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState<"feedback" | "bug" | "feature">("feedback");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureProblem, setFeatureProblem] = useState("");
  const [emailMe, setEmailMe] = useState(true);
  const [urgency, setUrgency] = useState("");

  const handleSubmitFeedback = () => {
    toast({
      title: "Thank you for your feedback! 🎉",
      description: "Your voice shapes Crevia's future. We'll review this carefully.",
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

  const stats = [
    { icon: Users, label: "Community Members", value: "2,500+" },
    { icon: MessageSquare, label: "Feedback Received", value: "1,200+" },
    { icon: Lightbulb, label: "Features Shipped", value: "45" },
    { icon: TrendingUp, label: "Ideas in Progress", value: "23" },
  ];

  const recentFeatures = [
    { title: "AI Match Scoring", status: "shipped", votes: 234 },
    { title: "Campaign Analytics", status: "shipped", votes: 189 },
    { title: "Bulk Messaging", status: "building", votes: 156 },
    { title: "Advanced Filters", status: "planned", votes: 143 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-bronze/5 via-transparent to-bronze/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-bronze/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-bronze/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-bronze/50 text-bronze">
              <Sparkles className="w-3 h-3 mr-1" />
              Your Voice Matters
            </Badge>
            
            <h1 className="font-vollkorn text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-bronze to-foreground bg-clip-text text-transparent">
              Shape the Future of Crevia
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Every piece of feedback, every feature idea—they all help us build the platform 
              that creators and brands truly deserve. Your insights are the foundation of our roadmap.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-bronze/30 transition-all duration-300"
                >
                  <stat.icon className="w-5 h-5 text-bronze mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <Tabs defaultValue="feedback" className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 h-14 p-1 bg-muted/50">
            <TabsTrigger 
              value="feedback" 
              className="data-[state=active]:bg-bronze data-[state=active]:text-white flex items-center gap-2 h-full"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger 
              value="feature"
              className="data-[state=active]:bg-bronze data-[state=active]:text-white flex items-center gap-2 h-full"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Feature Request</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bug"
              className="data-[state=active]:bg-bronze data-[state=active]:text-white flex items-center gap-2 h-full"
            >
              <Bug className="w-4 h-4" />
              <span className="hidden sm:inline">Report Bug</span>
            </TabsTrigger>
          </TabsList>

          {/* General Feedback Tab */}
          <TabsContent value="feedback" className="space-y-8">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Feedback Form */}
              <Card className="lg:col-span-3 p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-vollkorn text-2xl font-bold">Share Your Thoughts</h2>
                    <p className="text-sm text-muted-foreground">Help us understand your experience</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">What area does this relate to?</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-2 h-12 bg-background/50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="platform">Platform Experience</SelectItem>
                        <SelectItem value="payments">Payments & Escrow</SelectItem>
                        <SelectItem value="search">Creator/Brand Discovery</SelectItem>
                        <SelectItem value="campaigns">Campaign Tools</SelectItem>
                        <SelectItem value="messaging">Messaging System</SelectItem>
                        <SelectItem value="kira">Kira AI Assistant</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium">Your Feedback</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind. What's working well? What could be better? We want to hear it all..."
                      rows={6}
                      className="mt-2 bg-background/50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Be as detailed as you'd like—every word helps us improve.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="emailMe"
                        checked={emailMe}
                        onCheckedChange={setEmailMe}
                      />
                      <Label htmlFor="emailMe" className="text-sm cursor-pointer">
                        Keep me updated on how this feedback shapes Crevia
                      </Label>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmitFeedback}
                    className="w-full h-12 bg-gradient-to-r from-bronze to-bronze-dark hover:from-bronze-dark hover:to-bronze text-white font-medium"
                    disabled={!category || !message}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </Card>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Kira Message */}
                <Card className="p-6 border-bronze/30 bg-gradient-to-br from-bronze/5 to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-bronze to-bronze-dark rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                      K
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Kira says:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        "Every single piece of feedback gets read by our team. You're not just filling out a form—you're directly influencing what we build next. Thank you for being part of this journey!"
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Why Feedback Matters */}
                <Card className="p-6 border-border/50 bg-card/50">
                  <h3 className="font-vollkorn text-lg font-bold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-bronze" />
                    Why Your Feedback Matters
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                      <span>Every suggestion is reviewed by our product team within 48 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                      <span>Top community feedback directly influences our monthly roadmap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                      <span>You'll be credited when your idea ships (with your permission)</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Feature Request Tab */}
          <TabsContent value="feature" className="space-y-8">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Feature Request Form */}
              <Card className="lg:col-span-3 p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-vollkorn text-2xl font-bold">Request a Feature</h2>
                    <p className="text-sm text-muted-foreground">Got an idea that would make Crevia better?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="featureTitle" className="text-sm font-medium">Feature Title</Label>
                    <Input
                      id="featureTitle"
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      placeholder="Give your feature a catchy name"
                      className="mt-2 h-12 bg-background/50"
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Understanding the "why" helps us build the right solution.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="featureDescription" className="text-sm font-medium">
                      How do you envision it working?
                    </Label>
                    <Textarea
                      id="featureDescription"
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                      placeholder="Describe your ideal solution. Don't hold back—we love detailed ideas!"
                      rows={5}
                      className="mt-2 bg-background/50 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <p className="text-sm">
                        Popular requests get fast-tracked to our roadmap!
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmitFeature}
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium"
                    disabled={!featureTitle || !featureProblem}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Submit Feature Request
                  </Button>
                </div>
              </Card>

              {/* Feature Roadmap Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recently Shipped */}
                <Card className="p-6 border-border/50 bg-card/50">
                  <h3 className="font-vollkorn text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-bronze" />
                    Community-Driven Features
                  </h3>
                  <div className="space-y-3">
                    {recentFeatures.map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="w-3 h-3 fill-bronze text-bronze" />
                            <span className="text-xs">{feature.votes}</span>
                          </div>
                          <span className="text-sm font-medium">{feature.title}</span>
                        </div>
                        <Badge 
                          variant={feature.status === "shipped" ? "default" : "outline"}
                          className={
                            feature.status === "shipped" 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : feature.status === "building"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }
                        >
                          {feature.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-bronze hover:text-bronze-light hover:bg-bronze/10">
                    View Full Roadmap
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>

                {/* Tips */}
                <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Tips for Great Feature Requests
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
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

          {/* Bug Report Tab */}
          <TabsContent value="bug" className="space-y-8">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Bug Report Form */}
              <Card className="lg:col-span-3 p-8 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                    <Bug className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-vollkorn text-2xl font-bold">Report a Bug</h2>
                    <p className="text-sm text-muted-foreground">Found something broken? Let us squash it!</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="bugCategory" className="text-sm font-medium">Where did you encounter this bug?</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-2 h-12 bg-background/50">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="campaigns">Campaigns</SelectItem>
                        <SelectItem value="messaging">Messaging</SelectItem>
                        <SelectItem value="payments">Payments</SelectItem>
                        <SelectItem value="profile">Profile</SelectItem>
                        <SelectItem value="search">Search/Discovery</SelectItem>
                        <SelectItem value="mobile">Mobile Experience</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="text-sm font-medium">How severe is this bug?</Label>
                    <Select value={urgency} onValueChange={setUrgency}>
                      <SelectTrigger className="mt-2 h-12 bg-background/50">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="critical">🔴 Critical - Can't use the platform</SelectItem>
                        <SelectItem value="major">🟠 Major - Feature is broken</SelectItem>
                        <SelectItem value="minor">🟡 Minor - Annoying but workable</SelectItem>
                        <SelectItem value="cosmetic">🟢 Cosmetic - Visual issue only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bugDescription" className="text-sm font-medium">Describe the bug</Label>
                    <Textarea
                      id="bugDescription"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What happened? What did you expect to happen instead? Include any error messages you saw..."
                      rows={5}
                      className="mt-2 bg-background/50 resize-none"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Pro tip:</strong> Include steps to reproduce the bug if possible. 
                      Screenshots or screen recordings are super helpful!
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmitFeedback}
                    className="w-full h-12 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium"
                    disabled={!category || !message}
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Submit Bug Report
                  </Button>
                </div>
              </Card>

              {/* Bug Report Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-500" />
                    Our Bug Response Times
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">🔴 Critical bugs</span>
                      <Badge variant="outline" className="border-red-500/30 text-red-400">Within 2 hours</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">🟠 Major bugs</span>
                      <Badge variant="outline" className="border-orange-500/30 text-orange-400">Within 24 hours</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">🟡 Minor bugs</span>
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">Within 3 days</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">🟢 Cosmetic bugs</span>
                      <Badge variant="outline" className="border-green-500/30 text-green-400">Next release</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-border/50 bg-card/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-bronze to-bronze-dark rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      K
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Kira says:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        "Don't worry—bugs happen! The important thing is that you're helping us catch them. 
                        Our engineering team takes every report seriously."
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="p-8 md:p-12 border-bronze/30 bg-gradient-to-br from-bronze/10 via-transparent to-bronze/5 max-w-2xl mx-auto">
            <Sparkles className="w-10 h-10 text-bronze mx-auto mb-4" />
            <h3 className="font-vollkorn text-2xl font-bold mb-3">
              Together, We Build Something Great
            </h3>
            <p className="text-muted-foreground mb-6">
              Crevia isn't just a platform—it's a community. Every feature, every improvement 
              is shaped by creators and brands like you. Thank you for being part of this journey.
            </p>
            <div className="flex items-center justify-center gap-2 text-bronze">
              <Heart className="w-5 h-5 fill-bronze" />
              <span className="font-medium">Made with love, powered by your feedback</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
