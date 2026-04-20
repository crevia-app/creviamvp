import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, MessageSquare, FileSignature, Receipt, ArrowRight, Sparkles, Users } from "lucide-react";

const WorkspacesList = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => { fetchWorkspaces(); }, []);

  const fetchWorkspaces = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data } = await supabase
      .from("chat_rooms")
      .select("*, chat_room_members(user_id, role)")
      .order("updated_at", { ascending: false });

    setWorkspaces(data || []);
    setLoading(false);
  };

  const createWorkspace = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("chat_rooms")
      .insert({ created_by: userId, is_group: false, name: "New Workspace" })
      .select()
      .single();

    if (!error && data) {
      await supabase.from("chat_room_members").insert({ room_id: data.id, user_id: userId, role: "admin" });
      navigate(`/crevia-workspace/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-bronze" />
              <h1 className="font-vollkorn text-2xl md:text-3xl font-bold">Workspaces</h1>
            </div>
            <p className="text-muted-foreground text-sm">Your active deal rooms with clients and brands</p>
          </div>
          <Button onClick={createWorkspace} className="bg-bronze hover:bg-bronze/90 text-background gap-2">
            <Plus className="w-4 h-4" />
            New Workspace
          </Button>
        </div>

        {/* Workspaces Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-bronze/50" />
            </div>
            <h3 className="font-vollkorn text-xl font-bold mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Create your first workspace to start collaborating with a client or brand in a professional deal room.
            </p>
            <Button onClick={createWorkspace} className="bg-bronze hover:bg-bronze/90 text-background gap-2">
              <Plus className="w-4 h-4" />
              Create First Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((workspace, idx) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card
                  onClick={() => navigate(`/crevia-workspace/${workspace.id}`)}
                  className="p-5 cursor-pointer hover:border-bronze/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-bronze/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-bronze" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{workspace.name || "Workspace"}</h3>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(workspace.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-bronze/30 text-bronze">
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs">{workspace.chat_room_members?.length || 1} members</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <FileSignature className="w-3.5 h-3.5" />
                      <span className="text-xs">Contract</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Receipt className="w-3.5 h-3.5" />
                      <span className="text-xs">Invoice</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Click to open workspace</span>
                    <ArrowRight className="w-4 h-4 text-bronze opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspacesList;
