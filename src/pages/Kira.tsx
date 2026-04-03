import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { 
  Lightbulb, 
  Users, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Send, 
  MessageSquare, 
  Plus, 
  Search, 
  Paperclip,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  Sparkles,
  ArrowRight,
  FolderOpen,
  ChevronRight,
  Image,
  FileUp,
  X,
  Mic,
  FileSignature,
  Receipt,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "@/components/kira/CreateProjectDialog";
import { ProjectDetailSheet } from "@/components/kira/ProjectDetailSheet";
import { ProjectsView } from "@/components/kira/ProjectsView";
import { VoiceChatDialog } from "@/components/kira/VoiceChatDialog";
import CreateContractDialog from "@/components/studio/CreateContractDialog";
import CreateInvoiceDialog from "@/components/studio/CreateInvoiceDialog";
import { ApproveActionDialog } from "@/components/kira/ApproveActionDialog";


interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  project_id?: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  file?: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}

type ViewMode = "chat" | "projects";

const Kira = () => {
  const { toast } = useToast();
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const creatorGreetings = [
    "Hey there! Let's build something great today",
    "The world needs your story — let's tell it better",
    "Ready to turn creative vision into action?",
    "Your next big collaboration starts here",
    "Let's craft content that truly resonates"
  ];

  const brandGreetings = [
    "Hey there! Let's find the perfect storytellers for your brand",
    "Ready to connect with creators who share your vision?",
    "Your next winning campaign starts here",
    "Let's build partnerships that drive real impact",
    "Time to create something your audience will love"
  ];

  const greetings = userType === 'brand' ? brandGreetings : creatorGreetings;

  const getGreeting = () => {
    const lastChange = localStorage.getItem('kira-greeting-date');
    const storedIndex = localStorage.getItem('kira-greeting-index');
    const today = new Date().toDateString();
    
    if (lastChange !== today) {
      const currentIndex = storedIndex ? parseInt(storedIndex) : 0;
      const newIndex = (currentIndex + 1) % greetings.length;
      localStorage.setItem('kira-greeting-date', today);
      localStorage.setItem('kira-greeting-index', newIndex.toString());
      return greetings[newIndex];
    }
    
    const index = storedIndex ? parseInt(storedIndex) : 0;
    return greetings[index];
  };

  const [currentGreeting, setCurrentGreeting] = useState(getGreeting());
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // View modes and dialogs
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [kiraContractContext, setKiraContractContext] = useState<Record<string, unknown> | null>(null);
  const [kiraInvoiceContext, setKiraInvoiceContext] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserType(profile.user_type);
        }

        // Load conversations
        const { data: conversations, error } = await supabase
          .from('kira_conversations')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && conversations) {
          setChatHistories(conversations.map(c => ({
            id: c.id,
            title: c.title,
            timestamp: new Date(c.updated_at),
            project_id: c.project_id
          })));
          
          if (conversations.length > 0) {
            setActiveChat(conversations[0].id);
            setActiveProjectId(conversations[0].project_id || null);
          }
        }

        // Load projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('kira_projects')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!projectsError && projectsData) {
          setProjects(projectsData);
        }
        setIsLoadingProjects(false);
      }
      setIsLoadingHistory(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) {
        setMessages([]);
        return;
      }

      const { data: msgs, error } = await supabase
        .from('kira_messages')
        .select('*')
        .eq('conversation_id', activeChat)
        .order('created_at', { ascending: true });

      if (!error && msgs) {
        setMessages(msgs.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          file: m.file_name || undefined
        })));
      }
    };

    loadMessages();
  }, [activeChat]);

  useEffect(() => {
    if (userType) {
      const greeting = getGreeting();
      setCurrentGreeting(greeting);
    }
  }, [userType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string, fileName?: string) => {
    await supabase.from('kira_messages').insert({
      conversation_id: conversationId,
      role,
      content,
      file_name: fileName
    });
  };

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    await supabase
      .from('kira_conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    setChatHistories(prev => prev.map(c => 
      c.id === conversationId ? { ...c, title, timestamp: new Date() } : c
    ));
  };

  const getActiveProject = () => {
    return projects.find(p => p.id === activeProjectId);
  };

  const streamKiraResponse = useCallback(async (userMessages: Message[], conversationId: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kira-chat`;
    const activeProject = getActiveProject();
    
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: userMessages.map(m => ({ role: m.role, content: m.content })),
          userType: userType || 'creator',
          projectContext: activeProject ? {
            name: activeProject.name,
            description: activeProject.description,
            customInstructions: activeProject.custom_instructions
          } : null
        }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect to Kira");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (assistantContent) {
        // Parse and strip ACTION signal from Kira's response
        // ACTION line may contain nested JSON with "context" so match to end of line
        const actionMatch = assistantContent.match(/\nACTION:(\{.+\})[\s]*$/m);
        let cleanContent = assistantContent;
        if (actionMatch) {
          try {
            const action = JSON.parse(actionMatch[1]);
            setPendingAction(action.type);
            if (action.type === 'open_contract' && action.context) {
              setKiraContractContext(action.context);
            }
            if (action.type === 'open_invoice' && action.context) {
              setKiraInvoiceContext(action.context);
            }
            cleanContent = assistantContent.replace(/\nACTION:\{.+\}[\s]*$/m, '').trimEnd();
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: cleanContent } : m);
              }
              return prev;
            });
          } catch { /* ignore malformed action */ }
        }
        await saveMessage(conversationId, "assistant", cleanContent);
      }

      return assistantContent;
    } catch (error) {
      console.error("Kira chat error:", error);
      throw error;
    }
  }, [userType, activeProjectId, projects]);

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to chat with Kira",
        variant: "destructive",
      });
      return;
    }
    
    const newMessage: Message = { 
      role: "user", 
      content: input,
      file: selectedFile?.name 
    };
    
    let conversationId = activeChat;
    
    if (!conversationId) {
      const { data: newConvo, error } = await supabase
        .from('kira_conversations')
        .insert({ 
          user_id: userId, 
          title: 'New conversation',
          project_id: activeProjectId 
        })
        .select()
        .single();
      
      if (error || !newConvo) {
        toast({
          title: "Error",
          description: "Couldn't start a new conversation",
          variant: "destructive",
        });
        return;
      }
      
      conversationId = newConvo.id;
      setActiveChat(conversationId);
      setChatHistories(prev => [{
        id: newConvo.id,
        title: 'New conversation',
        timestamp: new Date(),
        project_id: activeProjectId
      }, ...prev]);
    }

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setSelectedFile(null);
    setPendingAction(null);
    setKiraContractContext(null);
    setKiraInvoiceContext(null);
    setIsLoading(true);
    
    await saveMessage(conversationId, "user", newMessage.content, newMessage.file);
    
    if (messages.length === 0) {
      await updateConversationTitle(conversationId, newMessage.content);
    }
    
    try {
      await streamKiraResponse(updatedMessages, conversationId);
      
      await supabase
        .from('kira_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
        
    } catch (error) {
      toast({
        title: "Oops!",
        description: error instanceof Error ? error.message : "Couldn't reach Kira right now. Please try again!",
        variant: "destructive",
      });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I had a little hiccup! Could you try asking me again?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async (projectId?: string | null) => {
    if (!userId) return;
    
    const { data: newConvo, error } = await supabase
      .from('kira_conversations')
      .insert({ 
        user_id: userId, 
        title: 'New conversation',
        project_id: projectId ?? null
      })
      .select()
      .single();
    
    if (!error && newConvo) {
      const newChat: ChatHistory = {
        id: newConvo.id,
        title: 'New conversation',
        timestamp: new Date(),
        project_id: projectId ?? null
      };
      setChatHistories([newChat, ...chatHistories]);
      setActiveChat(newChat.id);
      setActiveProjectId(projectId ?? null);
      setMessages([]);
      setViewMode("chat");
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    const { error } = await supabase
      .from('kira_conversations')
      .delete()
      .eq('id', chatId);
    
    if (!error) {
      setChatHistories(prev => prev.filter(c => c.id !== chatId));
      if (activeChat === chatId) {
        const remaining = chatHistories.filter(c => c.id !== chatId);
        setActiveChat(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const handleProjectUpdated = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    setSelectedProject(project);
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const handleConversationSelect = (conversationId: string, projectId: string) => {
    setActiveChat(conversationId);
    setActiveProjectId(projectId);
    setViewMode("chat");
  };

  const filteredChats = chatHistories.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generalChats = filteredChats.filter(c => !c.project_id);
  const projectChats = filteredChats.filter(c => c.project_id);

  const quickActions = userType === 'brand' ? [
    { icon: Users, label: "Find creators", prompt: "Help me find creators for my next campaign" },
    { icon: FileText, label: "Write a brief", prompt: "Help me write a campaign brief" },
    { icon: BarChart3, label: "Analyze ROI", prompt: "How do I measure influencer marketing ROI?" },
    { icon: TrendingUp, label: "Strategy tips", prompt: "Give me campaign optimization tips" },
  ] : [
    { icon: Lightbulb, label: "Content ideas", prompt: "Give me content ideas for this week" },
    { icon: FileText, label: "Write a pitch", prompt: "Help me write a brand pitch" },
    { icon: Users, label: "Find collabs", prompt: "How do I find brand collaborations?" },
    { icon: TrendingUp, label: "Growth tips", prompt: "Give me tips to grow my audience" },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const activeProject = getActiveProject();

  return (
    <div className="h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] flex bg-background">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-col bg-card/50 border-r border-border/50 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-border/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="font-poppins font-semibold text-sm">Kira AI</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button 
            onClick={() => handleNewChat(null)}
            className={`w-full gap-2 bg-bronze hover:bg-bronze/90 text-background font-poppins ${
              sidebarCollapsed ? 'px-0 justify-center' : 'justify-start'
            }`}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && "New Chat"}
          </Button>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-muted/50 border-border/50"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        {!sidebarCollapsed && (
          <div className="px-3 space-y-1 mb-2">
            <button
              onClick={() => setViewMode("chat")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === "chat" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chats
            </button>
            <button
              onClick={() => setViewMode("projects")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === "projects" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Projects
              <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                {projects.length}
              </span>
            </button>
          </div>
        )}

        {/* Chat List */}
        {!sidebarCollapsed && viewMode === "chat" && (
          <>
            <div className="px-3 py-2">
              <p className="text-xs font-poppins font-medium text-muted-foreground uppercase tracking-wider">
                Recent Chats
              </p>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 pb-3">
                {isLoadingHistory ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-5 h-5 mx-auto text-muted-foreground animate-spin mb-2" />
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  </div>
                ) : generalChats.length === 0 && projectChats.length === 0 ? (
                  <div className="py-8 text-center">
                    <MessageSquare className="w-6 h-6 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {searchQuery ? 'No chats found' : 'No chats yet'}
                    </p>
                  </div>
                ) : (
                  <>
                    {generalChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChat(chat.id);
                          setActiveProjectId(null);
                          setViewMode("chat");
                        }}
                        className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                          activeChat === chat.id 
                            ? 'bg-bronze/10 text-foreground' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                          activeChat === chat.id ? 'text-bronze' : ''
                        }`} />
                        <span className="flex-1 text-sm truncate">{chat.title}</span>
                        <button 
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}

                    {/* Project Chats */}
                    {projects.map(project => {
                      const projectConversations = projectChats.filter(c => c.project_id === project.id);
                      if (projectConversations.length === 0) return null;
                      
                      return (
                        <div key={project.id} className="mt-3">
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setProjectDetailOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <FolderOpen className="w-3 h-3" />
                            <span className="truncate">{project.name}</span>
                            <ChevronRight className="w-3 h-3 ml-auto" />
                          </button>
                          <div className="space-y-1 mt-1">
                            {projectConversations.slice(0, 3).map((chat) => (
                              <div
                                key={chat.id}
                                onClick={() => {
                                  setActiveChat(chat.id);
                                  setActiveProjectId(project.id);
                                  setViewMode("chat");
                                }}
                                className={`group flex items-center gap-2 p-2 pl-7 rounded-lg cursor-pointer transition-all ${
                                  activeChat === chat.id 
                                    ? 'bg-bronze/10 text-foreground' 
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                              >
                                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${
                                  activeChat === chat.id ? 'text-bronze' : ''
                                }`} />
                                <span className="flex-1 text-sm truncate">{chat.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {/* Collapsed state icons */}
        {sidebarCollapsed && (
          <div className="flex flex-col items-center gap-2 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setSidebarCollapsed(false); setViewMode("chat"); }}
              className="w-10 h-10 text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setSidebarCollapsed(false); setViewMode("projects"); }}
              className="w-10 h-10 text-muted-foreground hover:text-foreground"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-card">
          <SheetHeader className="h-14 flex items-center px-4 border-b border-border/50">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              <span className="font-poppins font-semibold text-sm">Kira AI</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100%-56px)]">
            <div className="p-3">
              <Button 
                onClick={() => { handleNewChat(null); setMobileSidebarOpen(false); }}
                className="w-full justify-start gap-2 bg-bronze hover:bg-bronze/90 text-background"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search chats..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="px-3 space-y-1 mb-2">
              <button
                onClick={() => { setViewMode("chat"); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === "chat" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chats
              </button>
              <button
                onClick={() => { setViewMode("projects"); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === "projects" ? "bg-bronze/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Projects
                <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                  {projects.length}
                </span>
              </button>
            </div>

            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Chats</p>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 pb-3">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => { 
                      setActiveChat(chat.id); 
                      setActiveProjectId(chat.project_id || null);
                      setMobileSidebarOpen(false);
                      setViewMode("chat");
                    }}
                    className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                      activeChat === chat.id 
                        ? 'bg-bronze/10' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 ${activeChat === chat.id ? 'text-bronze' : 'text-muted-foreground'}`} />
                    <span className="flex-1 text-sm truncate">{chat.title}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      {viewMode === "projects" ? (
        <ProjectsView
          projects={projects}
          isLoading={isLoadingProjects}
          onCreateProject={() => setCreateProjectOpen(true)}
          onSelectProject={(project) => {
            setSelectedProject(project);
            setProjectDetailOpen(true);
          }}
        />
      ) : (
        /* Main Chat Area */
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="md:hidden h-12 flex items-center gap-3 px-4 border-b border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-8 w-8"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-background" />
              </div>
              <span className="font-poppins font-semibold text-sm">Kira</span>
            </div>
          </div>

          {/* Project Context Banner */}
          {activeProject && (
            <button
              onClick={() => {
                setSelectedProject(activeProject);
                setProjectDetailOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-bronze/5 border-b border-bronze/20 hover:bg-bronze/10 transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-bronze" />
              <span className="text-sm font-medium">{activeProject.name}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          )}

          {/* Messages Area - Premium Centered Layout */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="min-h-full flex flex-col justify-center px-4 py-8">
                <div className="max-w-2xl mx-auto w-full">
                  {messages.length === 0 ? (
                    /* Empty State - Claude-style centered */
                    <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-bronze/20 to-bronze-dark/20 flex items-center justify-center mb-8 ring-4 ring-bronze/10">
                        <span className="text-3xl">✨</span>
                      </div>
                      
                      <h1 className="font-vollkorn text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-bronze to-bronze-dark bg-clip-text text-transparent">
                        {activeProject ? `Working on ${activeProject.name}` : currentGreeting}
                      </h1>
                      
                      <p className="text-muted-foreground text-sm md:text-base max-w-md mb-12">
                        {activeProject 
                          ? activeProject.description || "Start chatting with project context"
                          : userType === 'brand' 
                            ? "I can help with creator discovery, campaign briefs, and strategy"
                            : "I can help with content ideas, brand pitches, and growth strategies"
                        }
                      </p>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action.prompt)}
                            className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-bronze/50 hover:bg-muted/50 transition-all text-left"
                          >
                            <div className="p-2 rounded-lg bg-bronze/10 text-bronze group-hover:bg-bronze group-hover:text-background transition-all">
                              <action.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{action.label}</span>
                            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Messages */
                    <div className="space-y-6 py-4">
                      {messages.map((msg, idx) => (
                        <div key={idx} className="animate-fade-in">
                          <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                              msg.role === 'user'
                                ? 'bg-bronze text-background'
                                : 'bg-gradient-to-br from-bronze/20 to-bronze-dark/20'
                            }`}>
                              {msg.role === 'user' ? (
                                <span className="text-xs font-semibold">You</span>
                              ) : (
                                <span className="text-xs">✨</span>
                              )}
                            </div>

                            {/* Message */}
                            <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                              <div
                                className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                                  msg.role === 'user'
                                    ? 'bg-bronze text-background rounded-tr-md'
                                    : 'bg-muted rounded-tl-md'
                                }`}
                              >
                                <p className="text-sm md:text-base whitespace-pre-wrap text-left">{msg.content}</p>
                                {msg.file && (
                                  <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                                    <Paperclip className="w-3 h-3" />
                                    {msg.file}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action card — shown below last assistant message when Kira signals an action */}
                          {msg.role === 'assistant' && idx === messages.length - 1 && !isLoading && pendingAction && (
                            <div className="ml-11 mt-3">
                              {pendingAction === 'open_contract' && (
                                <button
                                  onClick={() => setContractDialogOpen(true)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bronze/40 bg-bronze/5 hover:bg-bronze/10 hover:border-bronze/60 transition-all text-left w-fit"
                                >
                                  <div className="p-1.5 rounded-lg bg-bronze/15 text-bronze">
                                    <FileSignature className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Create Contract</p>
                                    <p className="text-xs text-muted-foreground">Open the contract builder</p>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-bronze ml-2" />
                                </button>
                              )}
                              {pendingAction === 'open_invoice' && (
                                <button
                                  onClick={() => setInvoiceDialogOpen(true)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bronze/40 bg-bronze/5 hover:bg-bronze/10 hover:border-bronze/60 transition-all text-left w-fit"
                                >
                                  <div className="p-1.5 rounded-lg bg-bronze/15 text-bronze">
                                    <Receipt className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Create Invoice</p>
                                    <p className="text-xs text-muted-foreground">Open the invoice builder</p>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-bronze ml-2" />
                                </button>
                              )}
                              {pendingAction === 'open_approve' && (
                                <button
                                  onClick={() => setApproveDialogOpen(true)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bronze/40 bg-bronze/5 hover:bg-bronze/10 hover:border-bronze/60 transition-all text-left w-fit"
                                >
                                  <div className="p-1.5 rounded-lg bg-bronze/15 text-bronze">
                                    <FileSignature className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Approve / Update Document</p>
                                    <p className="text-xs text-muted-foreground">Move a contract or invoice to the next stage</p>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-bronze ml-2" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Loading indicator */}
                      {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-3 animate-fade-in">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bronze/20 to-bronze-dark/20 flex items-center justify-center">
                            <span className="font-vollkorn text-xs font-bold text-bronze">K</span>
                          </div>
                          <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-bronze" />
                              <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Input Area - Premium Centered with Claude-style + menu */}
          <div className="p-4 md:p-6 bg-background">
            <div className="max-w-2xl mx-auto">
              {selectedFile && (
                <div className="mb-3 flex items-center gap-2 p-3 bg-muted rounded-xl text-sm border border-border/50">
                  <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              <div className="bg-card rounded-2xl border border-border/50 p-3 shadow-lg">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !isLoading && handleSend()}
                  placeholder={activeProject ? `Ask Kira about ${activeProject.name}...` : "How can I help you today?"}
                  className="border-0 bg-transparent h-12 text-base focus-visible:ring-0 px-1 placeholder:text-muted-foreground/70"
                  disabled={isLoading}
                />
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    
                    {/* Claude-style + Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg hover:bg-muted"
                        >
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-3 cursor-pointer">
                          <Image className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">Add images</span>
                            <span className="text-xs text-muted-foreground">Upload photos or screenshots</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-3 cursor-pointer">
                          <FileUp className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">Add files</span>
                            <span className="text-xs text-muted-foreground">PDF, DOC, TXT files</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setVoiceChatOpen(true)} className="gap-3 cursor-pointer">
                          <Mic className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">Voice chat</span>
                            <span className="text-xs text-muted-foreground">Talk with Kira</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setViewMode("projects")} className="gap-3 cursor-pointer">
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">Use project</span>
                            <span className="text-xs text-muted-foreground">Add project context</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Button 
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && !selectedFile)}
                    size="icon"
                    className="h-9 w-9 rounded-lg bg-bronze hover:bg-bronze-dark text-background"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Kira may occasionally make mistakes. Please verify important information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {userId && (
        <CreateProjectDialog
          open={createProjectOpen}
          onOpenChange={setCreateProjectOpen}
          userId={userId}
          onProjectCreated={handleProjectCreated}
        />
      )}

      <ProjectDetailSheet
        project={selectedProject}
        open={projectDetailOpen}
        onOpenChange={setProjectDetailOpen}
        onProjectUpdated={handleProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
        onConversationSelect={handleConversationSelect}
        onNewChat={(projectId) => handleNewChat(projectId)}
      />

      <VoiceChatDialog
        open={voiceChatOpen}
        onOpenChange={setVoiceChatOpen}
        userType={userType}
        projectContext={getActiveProject() ? {
          name: getActiveProject()!.name,
          description: getActiveProject()!.description,
          customInstructions: getActiveProject()!.custom_instructions
        } : null}
      />

      <CreateContractDialog
        open={contractDialogOpen}
        onOpenChange={setContractDialogOpen}
        onSuccess={() => setContractDialogOpen(false)}
        kiraContext={kiraContractContext}
      />

      <CreateInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        onSuccess={() => setInvoiceDialogOpen(false)}
        kiraContext={kiraInvoiceContext}
      />

      <ApproveActionDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
      />
    </div>
  );
};

export default Kira;
