import { useState, useRef } from "react";
import { AnimatedKira } from "@/components/AnimatedKira";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  PanelLeft
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
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([
    { id: '1', title: 'Content strategy tips', timestamp: new Date(Date.now() - 86400000) },
    { id: '2', title: 'Brand collaboration ideas', timestamp: new Date(Date.now() - 172800000) },
    { id: '3', title: 'Instagram growth advice', timestamp: new Date(Date.now() - 259200000) },
  ]);
  const [activeChat, setActiveChat] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Kira. Ask for advice on brand deals, content, strategy, and more."
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;
    
    const newMessage: Message = { 
      role: "user", 
      content: input,
      file: selectedFile?.name 
    };
    setMessages([...messages, newMessage]);
    setInput("");
    setSelectedFile(null);
    
    // Simulate Kira response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm here to help! This is a demo - the full AI integration is coming soon."
      }]);
    }, 1000);
  };

  const handleNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: 'New conversation',
      timestamp: new Date()
    };
    setChatHistories([newChat, ...chatHistories]);
    setActiveChat(newChat.id);
    setMessages([{
      role: "assistant",
      content: "Hi! I'm Kira. Ask for advice on brand deals, content, strategy, and more."
    }]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const capabilities = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Write content plans",
      description: "Get structured content calendars and topic ideas"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Suggest collaborations",
      description: "Find the perfect brand partnerships for your niche"
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Draft brand briefs",
      description: "Create professional briefs that win deals"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analyze data",
      description: "Understand your metrics and performance"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Give growth tips",
      description: "Personalized strategies to scale your influence"
    }
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar - Fixed Position */}
      <div 
        className={`bg-black text-white border-r border-white/10 transition-all duration-300 flex-shrink-0 fixed left-[240px] top-16 bottom-0 z-20 ${
          sidebarCollapsed ? 'w-0 md:w-[60px]' : 'w-0 md:w-[260px]'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-3 flex items-center justify-between border-b border-white/10">
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

          {!sidebarCollapsed && (
            <>
              {/* New Chat Button */}
              <div className="p-3">
                <Button 
                  onClick={handleNewChat}
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

              <Separator className="bg-white/10" />

              {/* Your Chats Label */}
              <div className="px-3 py-2">
                <p className="text-xs font-poppins font-medium text-white/50 uppercase tracking-wider">
                  Your Chats
                </p>
              </div>

              {/* Chat History */}
              <ScrollArea className="flex-1 px-2">
                <div className="space-y-1 pb-3">
                  {chatHistories.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`w-full text-left p-2.5 rounded-lg text-sm transition-all group relative cursor-pointer ${
                        activeChat === chat.id 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-poppins font-medium truncate text-sm">
                            {chat.title}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {chat.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChatHistories(chatHistories.filter(c => c.id !== chat.id));
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-[260px]">
        {/* Hero Section - Compact */}
        <div className="bg-gradient-to-b from-muted/30 to-background py-6 px-4 border-b border-border/40">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-3 flex justify-center">
              <AnimatedKira />
            </div>
            <h1 className="font-vollkorn text-2xl md:text-3xl font-bold mb-2">
              Meet Kira — your creator co-pilot
            </h1>
            <p className="text-sm text-muted-foreground">
              Strategy, ideas, briefs, pitches — Kira helps you grow smarter
            </p>
          </div>
        </div>


        {/* Chat Interface */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Toggle button for collapsed sidebar */}
          {sidebarCollapsed && (
            <div className="absolute top-4 left-4 z-10">
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
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-card p-4 md:p-6">
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
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask Kira anything..."
                  className="flex-1"
                />
                
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() && !selectedFile}
                  className="bg-bronze hover:bg-bronze-dark text-background flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Kira can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>

        {/* What Kira Can Do */}
        <div className="py-12 px-4 bg-muted/30 border-t border-border/40">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-vollkorn text-2xl md:text-3xl font-bold mb-8 text-center">
              What Kira Can Do
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
