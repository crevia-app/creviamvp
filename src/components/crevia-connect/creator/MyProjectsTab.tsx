import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Clock, CheckCircle, Search, Filter, Heart, Zap, TrendingUp, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MyProjectsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBudget, setSelectedBudget] = useState("all");

  // Mock data for gigs/projects - will be connected to database later
  const [projects] = useState({
    active: [
      {
        id: "1",
        title: "Website Redesign",
        brand: "TechStart Inc.",
        budget: 2500,
        deadline: "2025-02-15",
        status: "in_progress",
        appliedAt: "2025-01-10"
      },
      {
        id: "2", 
        title: "Brand Identity Package",
        brand: "GreenLife Co.",
        budget: 1800,
        deadline: "2025-02-28",
        status: "in_progress",
        appliedAt: "2025-01-12"
      }
    ],
    pending: [
      {
        id: "3",
        title: "Mobile App UI Design",
        brand: "FinanceFlow",
        budget: 3500,
        deadline: "2025-03-10",
        status: "pending",
        appliedAt: "2025-01-14"
      }
    ],
    completed: [
      {
        id: "4",
        title: "Social Media Graphics",
        brand: "FoodieHub",
        budget: 800,
        deadline: "2024-12-20",
        status: "completed",
        appliedAt: "2024-12-01"
      }
    ]
  });

  // Mock data for available gigs/projects
  const [availableGigs] = useState([
    {
      id: "g1",
      title: "E-commerce Product Photography",
      brand: "StyleHouse",
      budget: 1200,
      deadline: "2025-02-20",
      category: "Photography",
      description: "Need high-quality product shots for 50+ items for our online store.",
      matchScore: 92
    },
    {
      id: "g2",
      title: "Podcast Intro & Outro Music",
      brand: "TechTalk Media",
      budget: 500,
      deadline: "2025-02-10",
      category: "Audio",
      description: "Looking for a catchy, professional intro and outro for our tech podcast.",
      matchScore: 85
    },
    {
      id: "g3",
      title: "Logo Animation",
      brand: "StartupXYZ",
      budget: 800,
      deadline: "2025-02-25",
      category: "Animation",
      description: "Convert our static logo into a smooth, modern animation for video intros.",
      matchScore: 78
    },
    {
      id: "g4",
      title: "Product Unboxing Video",
      brand: "GadgetWorld",
      budget: 600,
      deadline: "2025-02-18",
      category: "Video",
      description: "Create an engaging unboxing video for our new smartphone accessory line."
    },
    {
      id: "g5",
      title: "Brand Mascot Illustration",
      brand: "KidsPlay Co.",
      budget: 1500,
      deadline: "2025-03-01",
      category: "Illustration",
      description: "Design a friendly, memorable mascot character for our children's brand."
    }
  ]);

  const bestMatches = availableGigs.filter(g => g.matchScore).slice(0, 3);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const addToWishlist = (gigId: string) => {
    toast({
      title: "Added to wishlist! 💖",
      description: "You can find it in your saved gigs",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; emoji: string; label: string }> = {
      pending: { variant: "default", emoji: "⏳", label: "Pending" },
      in_progress: { variant: "default", emoji: "🎯", label: "In Progress" },
      completed: { variant: "default", emoji: "✅", label: "Completed" },
      rejected: { variant: "destructive", emoji: "😔", label: "Not Selected" }
    };
    const config = statusConfig[status] || { variant: "default", emoji: "📋", label: status };
    return <Badge variant={config.variant}>{config.emoji} {config.label}</Badge>;
  };

  const filteredGigs = availableGigs.filter((gig) => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || gig.category === selectedCategory;
    const matchesBudget = selectedBudget === "all" || 
      (selectedBudget === "low" && gig.budget < 500) ||
      (selectedBudget === "medium" && gig.budget >= 500 && gig.budget < 1500) ||
      (selectedBudget === "high" && gig.budget >= 1500);
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

  if (loading) {
    return <div className="text-center py-12">Loading projects... ⏳</div>;
  }

  const renderProjectCard = (project: any, clickable: boolean = false) => (
    <Card 
      key={project.id} 
      className={`p-6 ${clickable ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-bronze" />
            <h3 className="font-semibold text-lg">{project.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Client: {project.brand}
          </p>
        </div>
        {getStatusBadge(project.status)}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-bronze">${project.budget}</span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Due: {new Date(project.deadline).toLocaleDateString()}
        </span>
        <span className="text-muted-foreground">
          Applied {new Date(project.appliedAt).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );

  const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">My Projects</h2>
        <p className="text-muted-foreground">
          Discover freelance gigs and track your projects
        </p>
      </div>

      <Tabs defaultValue="discover">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="active">Active ({projects.active.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({projects.pending.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({projects.completed.length})</TabsTrigger>
        </TabsList>

        {/* Discover Tab - Gig/Project Opportunities */}
        <TabsContent value="discover" className="space-y-6 mt-4">
          {/* Kira's Best Matches */}
          {bestMatches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-bronze/20">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Kira's Best Matches
                    <Badge variant="secondary" className="text-xs">AI Powered</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">Handpicked gigs based on your skills</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                {bestMatches.map((gig) => (
                  <Card 
                    key={gig.id} 
                    className="relative overflow-hidden cursor-pointer group hover-lift border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-bronze/5"
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-bronze text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {gig.matchScore}% Match
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base group-hover:text-bronze transition-colors pr-16">
                        {gig.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-1">
                        Client: {gig.brand}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {gig.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="outline" className="text-xs">{gig.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-bronze">${gig.budget}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToWishlist(gig.id);
                          }}
                          className="h-8 w-8 p-0 hover:text-bronze"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {bestMatches.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">Browse All Gigs</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gigs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Illustration">Illustration</SelectItem>
                  <SelectItem value="Animation">Animation</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="low">Under $500</SelectItem>
                  <SelectItem value="medium">$500 - $1,500</SelectItem>
                  <SelectItem value="high">$1,500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* All Gigs Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGigs.map((gig, index) => (
              <Card key={gig.id} className="hover-lift hover-glow cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-bronze transition-colors duration-300">{gig.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(gig.id);
                      }}
                      className="transition-all duration-300 hover:scale-110 hover:text-bronze"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Client: {gig.brand}</p>
                  {gig.matchScore && (
                    <div className="flex items-center gap-2 mt-2 animate-fade-in">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <Badge variant="secondary" className="transition-all duration-300 group-hover:scale-105">
                        {gig.matchScore}% Match
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {gig.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="transition-all duration-300 hover:scale-105 hover:border-bronze">{gig.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium group-hover:text-bronze transition-colors duration-300">${gig.budget}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: {new Date(gig.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGigs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No gigs found matching your criteria 🔍</p>
            </div>
          )}
        </TabsContent>

        {/* Active Projects */}
        <TabsContent value="active" className="space-y-4 mt-4">
          {projects.active.length > 0 ? (
            projects.active.map((project) => renderProjectCard(project, true))
          ) : (
            <EmptyState icon={Briefcase} message="No active projects yet. Browse gigs from the Discover tab!" />
          )}
        </TabsContent>

        {/* Pending Applications */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {projects.pending.length > 0 ? (
            projects.pending.map((project) => renderProjectCard(project))
          ) : (
            <EmptyState icon={Clock} message="No pending applications." />
          )}
        </TabsContent>

        {/* Completed Projects */}
        <TabsContent value="completed" className="space-y-4 mt-4">
          {projects.completed.length > 0 ? (
            projects.completed.map((project) => renderProjectCard(project))
          ) : (
            <EmptyState icon={CheckCircle} message="No completed projects yet." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyProjectsTab;
