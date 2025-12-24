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
  Zap,
  ArrowRight
} from "lucide-react";
import kiraImage from "@/assets/kira-mascot-new.png";

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
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        const { data: conversations, error } = await supabase
          .from('kira_conversations')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && conversations) {
          setChatHistories(conversations.map(c => ({
            id: c.id,
            title: c.title,
            timestamp: new Date(c.updated_at)
          })));
          
          if (conversations.length > 0) {
            setActiveChat(conversations[0].id);
          }
        }
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

  const streamKiraResponse = useCallback(async (userMessages: Message[], conversationId: string) => {
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
        await saveMessage(conversationId, "assistant", assistantContent);
      }

      return assistantContent;
    } catch (error) {
      console.error("Kira chat error:", error);
      throw error;
    }
  }, [userType]);

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
        .insert({ user_id: userId, title: 'New conversation' })
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
        timestamp: new Date()
      }, ...prev]);
    }

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setSelectedFile(null);
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

  const handleNewChat = async () => {
    if (!userId) return;
    
    const { data: newConvo, error } = await supabase
      .from('kira_conversations')
      .insert({ user_id: userId, title: 'New conversation' })
      .select()
      .single();
    
    if (!error && newConvo) {
      const newChat: ChatHistory = {
        id: newConvo.id,
        title: 'New conversation',
        timestamp: new Date()
      };
      setChatHistories([newChat, ...chatHistories]);
      setActiveChat(newChat.id);
      setMessages([]);
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

  const filteredChats = chatHistories.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="h-[calc(100vh-64px)] flex bg-background">
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
            onClick={handleNewChat}
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

        {/* Chat List */}
        {!sidebarCollapsed && (
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
                ) : filteredChats.length === 0 ? (
                  <div className="py-8 text-center">
                    <MessageSquare className="w-6 h-6 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {searchQuery ? 'No chats found' : 'No chats yet'}
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
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
                  ))
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
              className="w-10 h-10 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
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
                onClick={() => { handleNewChat(); setMobileSidebarOpen(false); }}
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

            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Chats</p>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 pb-3">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => { setActiveChat(chat.id); setMobileSidebarOpen(false); }}
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

      {/* Main Chat Area */}
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

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto px-4 py-6">
              {messages.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bronze/20 to-bronze-dark/20 flex items-center justify-center mb-6 ring-4 ring-bronze/10">
                    <img src={kiraImage} alt="Kira" className="w-14 h-14 object-contain" />
                  </div>
                  
                  <h1 className="font-vollkorn text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-bronze to-bronze-dark bg-clip-text text-transparent">
                    {currentGreeting}
                  </h1>
                  
                  <p className="text-muted-foreground text-sm md:text-base max-w-md mb-8">
                    {userType === 'brand' 
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
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user' 
                          ? 'bg-bronze text-background' 
                          : 'bg-gradient-to-br from-bronze/20 to-bronze-dark/20'
                      }`}>
                        {msg.role === 'user' ? (
                          <span className="text-xs font-semibold">You</span>
                        ) : (
                          <img src={kiraImage} alt="Kira" className="w-5 h-5 object-contain" />
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
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bronze/20 to-bronze-dark/20 flex items-center justify-center">
                        <img src={kiraImage} alt="Kira" className="w-5 h-5 object-contain" />
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
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-card/50 p-4">
          <div className="max-w-3xl mx-auto">
            {selectedFile && (
              <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg text-sm">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
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
            
            <div className="flex gap-2 items-end">
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
                className="h-11 w-11 flex-shrink-0 rounded-xl"
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !isLoading && handleSend()}
                  placeholder="Ask Kira anything..."
                  className="h-11 pr-12 rounded-xl bg-muted/50 border-border/50 focus:border-bronze"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSend}
                  disabled={isLoading || (!input.trim() && !selectedFile)}
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg bg-bronze hover:bg-bronze-dark text-background"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Kira may occasionally make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreviaAI;
