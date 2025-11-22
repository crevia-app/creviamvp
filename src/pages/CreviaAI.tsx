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
  Image as ImageIcon,
  Trash2
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="h-full bg-background flex flex-col">
      {/* Hero Section */}
      <section className="py-8 md:py-12 px-4 md:px-6 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-4 md:mb-6 flex justify-center">
            <AnimatedKira />
          </div>
          
          <h1 className="font-vollkorn text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2">
            Meet Kira — your creator co-pilot
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto px-2">
            Strategy, ideas, briefs, pitches — Kira helps you grow smarter
          </p>
        </div>
      </section>

      {/* Main Chat Interface */}
      <section className="flex-1 flex overflow-hidden">
        <div className="flex w-full h-[calc(100vh-320px)]">
          {/* Sidebar - Chat History */}
          <div className={`${sidebarOpen ? 'w-64' : 'w-0'} hidden lg:block bg-muted/30 border-r border-border/50 transition-all duration-300 overflow-hidden`}>
            <div className="p-4 space-y-4">
              <Button 
                onClick={handleNewChat}
                className="w-full justify-start gap-2 bg-bronze hover:bg-bronze-dark text-background"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search chats..." 
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <Separator />

              <ScrollArea className="h-[calc(100vh-450px)]">
                <div className="space-y-1">
                  {chatHistories.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors group hover:bg-accent ${
                        activeChat === chat.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{chat.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {chat.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <Trash2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
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
        </div>
      </section>

      {/* What Kira Can Do - Below Chat */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-2xl sm:text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center">
            What Kira Can Do
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {capabilities.map((capability, idx) => (
              <Card key={idx} className="p-5 md:p-6 hover:shadow-lg transition-all border-border/50 hover:border-bronze/50">
                <div className="flex items-start gap-4">
                  <div className="text-bronze flex-shrink-0">{capability.icon}</div>
                  <div>
                    <h4 className="font-poppins font-semibold text-base md:text-lg mb-2">
                      {capability.title}
                    </h4>
                    <p className="text-muted-foreground text-xs md:text-sm">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreviaAI;
