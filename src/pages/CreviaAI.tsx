import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Menu,
  Loader2
} from "lucide-react";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  file?: string;
}

const CreviaAI = () => {
  const { toast } = useToast();
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to top when page loads
  useEffect(() => {
    // Scroll both window and the main container to top
    window.scrollTo(0, 0);
    // Also scroll the main content container in AppLayout
    const mainContainer = document.querySelector('main.overflow-auto');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, []);
  // Greeting messages that rotate every 24 hours - personalized by user type
  const creatorGreetings = [
    "Hey there! 👋 Let's build something great today",
    "The world needs your story 🌟 — let's tell it better",
    "Ready to turn creative vision into action? 🚀",
    "Your next big collaboration starts here 🤝",
    "Let's craft content that truly resonates ✨"
  ];

  const brandGreetings = [
    "Hey there! 👋 Let's find the perfect storytellers for your brand",
    "Ready to connect with creators who share your vision? 🎯",
    "Your next winning campaign starts here 🏆",
    "Let's build partnerships that drive real impact 📈",
    "Time to create something your audience will love 💖"
  ];

  const greetings = userType === 'brand' ? brandGreetings : creatorGreetings;

  const getGreeting = () => {
    const lastChange = localStorage.getItem('kira-greeting-date');
    const storedIndex = localStorage.getItem('kira-greeting-index');
    const today = new Date().toDateString();
    
    if (lastChange !== today) {
      // Change greeting every 24 hours
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
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([
    { id: '1', title: 'Content strategy tips', timestamp: new Date(Date.now() - 86400000) },
    { id: '2', title: 'Brand collaboration ideas', timestamp: new Date(Date.now() - 172800000) },
    { id: '3', title: 'Instagram growth advice', timestamp: new Date(Date.now() - 259200000) },
  ]);
  const [activeChat, setActiveChat] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch user profile to determine user type
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserType(profile.user_type);
        }
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Check for greeting update when user type is loaded
    if (userType) {
      const greeting = getGreeting();
      setCurrentGreeting(greeting);
    }
  }, [userType]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamKiraResponse = useCallback(async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kira-chat`;
    
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

      // Final flush
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
    } catch (error) {
      console.error("Kira chat error:", error);
      throw error;
    }
  }, [userType]);

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    
    const newMessage: Message = { 
      role: "user", 
      content: input,
      file: selectedFile?.name 
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setSelectedFile(null);
    setIsLoading(true);
    
    try {
      await streamKiraResponse(updatedMessages);
    } catch (error) {
      toast({
        title: "Oops! 😅",
        description: error instanceof Error ? error.message : "Couldn't reach Kira right now. Please try again!",
        variant: "destructive",
      });
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I had a little hiccup! 😅 Could you try asking me again?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: 'New conversation',
      timestamp: new Date()
    };
    setChatHistories([newChat, ...chatHistories]);
    setActiveChat(newChat.id);
    setMessages([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const creatorCapabilities = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Write content plans 📝",
      description: "Get structured content calendars and topic ideas"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Suggest collaborations 🤝",
      description: "Find the perfect brand partnerships for your niche"
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Draft brand pitches ✍️",
      description: "Create compelling pitches that win deals"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analyze your data 📊",
      description: "Understand your metrics and performance"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Give growth tips 🚀",
      description: "Personalized strategies to scale your influence"
    }
  ];

  const brandCapabilities = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Find creators 🔍",
      description: "Discover creators that align with your brand values"
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Draft campaign briefs ✍️",
      description: "Create compelling briefs that attract top creators"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Plan campaigns 📋",
      description: "Get strategic campaign roadmaps and timelines"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analyze ROI 📈",
      description: "Track campaign performance and creator impact"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Optimize strategy 🎯",
      description: "Data-driven insights to improve your campaigns"
    }
  ];

  const capabilities = userType === 'brand' ? brandCapabilities : creatorCapabilities;

  const renderSidebarContent = () => (
    <>
      {/* New Chat Button */}
      <div className="p-3">
        <Button 
          onClick={() => {
            handleNewChat();
            setMobileSidebarOpen(false);
          }}
          className="w-full justify-start gap-2 bg-bronze hover:bg-bronze/90 text-background font-poppins"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Search Chats */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input 
            placeholder="Search chats..." 
            className="pl-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-bronze"
          />
        </div>
      </div>

      <Separator className="bg-white/10 hidden" />

      {/* Your Chats Label */}
      <div className="px-3 py-2">
        <p className="text-xs font-poppins font-medium text-white/50 uppercase tracking-wider">
          Your Chats
        </p>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1.5 pb-3">
          {chatHistories.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-white/20 mb-3" />
              <p className="text-sm text-white/40 font-poppins">No chats yet</p>
              <p className="text-xs text-white/30 mt-1">Start a new conversation!</p>
            </div>
          ) : (
            chatHistories.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChat(chat.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl text-sm transition-all group relative cursor-pointer border ${
                  activeChat === chat.id 
                    ? 'bg-bronze/15 text-white border-bronze/30' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    activeChat === chat.id ? 'bg-bronze/20' : 'bg-white/5'
                  }`}>
                    <MessageSquare className={`w-4 h-4 ${
                      activeChat === chat.id ? 'text-bronze' : 'text-white/50'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins font-medium truncate text-sm leading-tight">
                      {chat.title}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {chat.timestamp.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: chat.timestamp.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                      })}
                    </p>
                  </div>
                  <button 
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatHistories(chatHistories.filter(c => c.id !== chat.id));
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <div className="h-full flex overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile, no borders */}
      <div 
        className={`hidden md:block bg-black text-white transition-all duration-300 flex-shrink-0 fixed left-[100px] top-16 bottom-0 z-20 ${
          sidebarCollapsed ? 'w-[60px]' : 'w-[260px]'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-3 flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="font-poppins font-semibold text-sm">Kira AI</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 text-white/60 hover:text-bronze hover:bg-white/10 flex-shrink-0"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!sidebarCollapsed && renderSidebarContent()}

          {/* Collapsed Sidebar Icons */}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center gap-2 p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="w-10 h-10 text-white/60 hover:text-bronze hover:bg-white/10"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-white/60 hover:text-bronze hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="bg-black w-[280px] p-0 border-none">
          <SheetHeader className="p-3">
            <SheetTitle className="font-poppins font-semibold text-sm text-white">Kira AI</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-60px)]">
            {renderSidebarContent()}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-[160px]' : 'md:ml-[360px]'
      }`}>
        {/* Mobile Menu Button - Positioned below TopBar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden fixed top-20 left-4 z-50 h-10 w-10 bg-black/80 backdrop-blur border border-white/10 hover:bg-white/10 text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Hero Section - Compact */}
        <div className="bg-gradient-to-b from-muted/30 to-background py-12 md:py-16 px-4 md:px-8 pt-16 md:pt-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-vollkorn text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-bronze via-bronze-dark to-bronze bg-clip-text text-transparent leading-tight px-8 md:px-4">
              {currentGreeting}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground px-8 md:px-4 max-w-2xl mx-auto">
              {userType === 'brand' 
                ? "Campaign strategy, creator discovery, briefs — Kira helps you build winning partnerships"
                : "Strategy, ideas, briefs, pitches — Kira helps you grow smarter"
              }
            </p>
          </div>
        </div>
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Toggle button for collapsed sidebar (Desktop only) */}
          {sidebarCollapsed && (
            <div className="hidden md:block absolute top-4 left-4 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
                className="h-9 w-9 bg-background/95 backdrop-blur border-border/40 hover:bg-muted"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 md:px-6">
              <div className="max-w-3xl mx-auto py-6 space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-2">Start chatting with Kira! 🦁</p>
                    <p className="text-sm">Ask anything about content creation, brand partnerships, or growing your audience.</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-bronze text-background'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                      {msg.file && (
                        <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                          <Paperclip className="w-3 h-3" />
                          {msg.file}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Kira is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="bg-card p-3 md:p-6">
            <div className="max-w-3xl mx-auto">
              {selectedFile && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg text-sm">
                  <Paperclip className="w-4 h-4" />
                  <span className="flex-1 truncate">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !isLoading && handleSend()}
                  placeholder="Ask Kira anything..."
                  className="flex-1"
                  disabled={isLoading}
                />
                
                <Button 
                  onClick={handleSend}
                  disabled={isLoading || (!input.trim() && !selectedFile)}
                  className="bg-bronze hover:bg-bronze-dark text-background flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Kira can make mistakes — but hey, nobody's perfect! 🤷‍♀️ Double-check important info.
              </p>
            </div>
          </div>
        </div>

        {/* What Kira Can Do */}
        <div className="py-8 md:py-12 px-3 md:px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-vollkorn text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-center">
              What Kira Can Do
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {capabilities.map((capability, idx) => (
                <Card key={idx} className="p-5 hover:shadow-lg transition-all border-border/50 hover:border-bronze/50">
                  <div className="flex items-start gap-4">
                    <div className="text-bronze flex-shrink-0">{capability.icon}</div>
                    <div>
                      <h4 className="font-poppins font-semibold text-base mb-2">
                        {capability.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreviaAI;
