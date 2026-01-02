import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, CheckCircle, FileText } from "lucide-react";

const MyProjectsTab = () => {
  const [loading, setLoading] = useState(true);

  // Mock data for now - will be connected to database later
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

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
          Track your freelance projects and gigs from brands
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({projects.active.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({projects.pending.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({projects.completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {projects.active.length > 0 ? (
            projects.active.map((project) => renderProjectCard(project, true))
          ) : (
            <EmptyState icon={Briefcase} message="No active projects yet. Browse opportunities to find freelance work!" />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {projects.pending.length > 0 ? (
            projects.pending.map((project) => renderProjectCard(project))
          ) : (
            <EmptyState icon={Clock} message="No pending applications. Apply to projects from the Opportunities tab!" />
          )}
        </TabsContent>

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
