import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, Clock, DollarSign, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  applicants_count: number;
}

const ProjectManagerTab = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Form states
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category: "",
  });

  useEffect(() => {
    // Mock data for now - will be replaced with actual DB queries
    setProjects([
      {
        id: "1",
        title: "Brand Logo Redesign",
        description: "Looking for a talented graphic designer to redesign our company logo with a modern, minimalist approach.",
        budget: 500,
        deadline: "2026-02-15",
        category: "Graphic Design",
        status: "open",
        applicants_count: 12,
      },
      {
        id: "2",
        title: "Product Photography",
        description: "Need professional product photos for our new skincare line. 20 products, white background.",
        budget: 800,
        deadline: "2026-01-20",
        category: "Photography",
        status: "in_progress",
        applicants_count: 8,
      },
      {
        id: "3",
        title: "Website Copy Writing",
        description: "Seeking a copywriter to create compelling website content for our e-commerce platform.",
        budget: 350,
        deadline: "2026-01-30",
        category: "Writing",
        status: "open",
        applicants_count: 15,
      },
    ]);
    setLoading(false);
  }, []);

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description || !newProject.budget) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Mock creation - will be replaced with actual DB insert
    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      budget: parseFloat(newProject.budget),
      deadline: newProject.deadline,
      category: newProject.category,
      status: "open",
      applicants_count: 0,
    };

    setProjects([project, ...projects]);
    setNewProject({ title: "", description: "", budget: "", deadline: "", category: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Project created",
      description: "Your project has been posted for freelancers to apply",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-bronze/10 text-bronze border-bronze/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-12">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Project Manager</h2>
          <p className="text-muted-foreground">
            Post projects and hire freelancers for design, writing, video editing & more
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-bronze hover:bg-bronze-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Post New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Post a New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Project Title *</label>
                <Input
                  placeholder="e.g., Logo Design for Tech Startup"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description *</label>
                <Textarea
                  placeholder="Describe the project, deliverables, and requirements..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Budget (USD) *</label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Deadline</label>
                  <Input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select
                  value={newProject.category}
                  onValueChange={(value) => setNewProject({ ...newProject, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Video Editing">Video Editing</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Writing">Writing & Copywriting</SelectItem>
                    <SelectItem value="Animation">Animation & Motion</SelectItem>
                    <SelectItem value="Audio">Audio & Music</SelectItem>
                    <SelectItem value="Marketing">Marketing & Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCreateProject} 
                className="w-full bg-bronze hover:bg-bronze-dark"
              >
                Post Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-bronze transition-colors">
                    {project.title}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`mt-2 capitalize ${getStatusColor(project.status)}`}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>
              
              {project.category && (
                <Badge variant="secondary" className="mb-4">
                  {project.category}
                </Badge>
              )}
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-bronze" />
                  <span>${project.budget.toLocaleString()}</span>
                </div>
                {project.deadline && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-bronze" />
                    <span>{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  {project.applicants_count} applicants
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Post your first project to start hiring freelancers
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-bronze hover:bg-bronze-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectManagerTab;
