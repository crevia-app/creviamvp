import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import kiraMascot from "@/assets/kira-mascot.png";
import { Lightbulb, Users, FileText, BarChart3, TrendingUp, Send } from "lucide-react";

const CreviaAI = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm Kira. Ask for advice on brand deals, content, strategy, and more."
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    
    // Simulate Kira response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm here to help! This is a demo - the full AI integration is coming soon."
      }]);
    }, 1000);
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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="mb-8 flex justify-center">
            <img src={kiraMascot} alt="Kira mascot" className="w-64 h-64 object-contain" />
          </div>
          
          <h1 className="font-vollkorn text-5xl md:text-6xl font-bold mb-6">
            Meet Kira — your creator co-pilot.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Strategy, ideas, briefs, pitches — Kira helps you grow smarter.
          </p>
          
          <Button 
            size="lg" 
            className="bg-bronze hover:bg-bronze-dark text-background font-poppins font-semibold"
            onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Chatting
          </Button>
        </div>
      </section>

      {/* Main Section */}
      <section id="chat-section" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Chat Window */}
            <div>
              <Card className="h-[600px] flex flex-col border-border/50 shadow-lg">
                <div className="p-6 border-b border-border/50 bg-card">
                  <h3 className="font-vollkorn text-2xl font-bold">Chat with Kira</h3>
                </div>
                
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            msg.role === 'user'
                              ? 'bg-bronze text-background'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-6 border-t border-border/50 bg-card">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask Kira anything..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSend}
                      className="bg-bronze hover:bg-bronze-dark"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: What Kira Can Do */}
            <div>
              <h3 className="font-vollkorn text-3xl font-bold mb-8">What Kira Can Do</h3>
              <div className="space-y-4">
                {capabilities.map((capability, idx) => (
                  <Card key={idx} className="p-6 hover:shadow-lg transition-shadow border-border/50">
                    <div className="flex items-start gap-4">
                      <div className="text-bronze">{capability.icon}</div>
                      <div>
                        <h4 className="font-poppins font-semibold text-lg mb-2">
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
      </section>

      <Footer />
    </div>
  );
};

export default CreviaAI;
